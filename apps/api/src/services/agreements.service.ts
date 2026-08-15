import { VECTOR_SIMILARITY_THRESHOLD } from "@/config/ai.config";
import { AgreementStatus, RiskLevelType, SectionClauseType } from "@/constants";
import { Agreements } from "@/db/schema/agreements";
import { Risks } from "@/db/schema/risks";
import { Sections } from "@/db/schema/sections";
import { db } from "@/infra/db.client";
import { publishAgreementProcessEvent } from "@/queues/message.queue";
import {
    AgreementCache,
    AgreementUserMapCache,
} from "@/services/cache.service";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

/**
 * Ensures the existence of an agreement for a specific user.
 */
export const ensureAgreementExists = async (
    agreementId: string,
    userId: string,
) => {
    let agreementUserId = await AgreementUserMapCache.get(agreementId);

    // Handle cache miss
    if (!agreementUserId) {
        const [agreement] = await db
            .select({ userId: Agreements.user_id })
            .from(Agreements)
            .where(eq(Agreements.id, agreementId));

        if (!agreement) throw new Error("Agreement not found");
        agreementUserId = agreement.userId;

        await AgreementUserMapCache.set(agreementId, agreementUserId);
    }

    if (agreementUserId !== userId) throw new Error("Unauthorized access");

    return true;
};

/**
 * Fetch agreement details
 */
export const fetchAgreement = async (agreementId: string, userId: string) => {
    let agreement = await AgreementCache.get(agreementId);

    // Handle cache miss
    if (!agreement) {
        [agreement] = await db
            .select({
                id: Agreements.id,
                title: Agreements.title,
                type: Agreements.type,
                metadata: Agreements.metadata,
                property: Agreements.property,
                payments: Agreements.payments,
                parties: Agreements.parties,
                summary: Agreements.summary,
                status: Agreements.status,
                error: Agreements.error,
                userId: Agreements.user_id,
                fileId: Agreements.file_id,
                createdAt: Agreements.created_at,
                updatedAt: Agreements.updated_at,
            })
            .from(Agreements)
            .where(
                and(
                    eq(Agreements.id, agreementId),
                    eq(Agreements.user_id, userId),
                ),
            );

        // Update cache
        if (agreement) {
            AgreementCache.set(agreementId, agreement);
        }
    }

    return agreement ?? null;
};

/**
 * Fetch all agreements for a user
 */
export const fetchAgreementsByUser = async (userId: string) => {
    return await db
        .select({
            id: Agreements.id,
            type: Agreements.type,
            title: Agreements.title,
            status: Agreements.status,
            updatedAt: Agreements.updated_at,
            createdAt: Agreements.created_at,
        })
        .from(Agreements)
        .where(and(eq(Agreements.user_id, userId)));
};

/**
 * Check if file is processed
 */
export const isFileProcessed = async (fileId: string, userId: string) => {
    const [agreement] = await db
        .select({ id: Agreements.id })
        .from(Agreements)
        .where(
            and(eq(Agreements.user_id, userId), eq(Agreements.file_id, fileId)),
        );

    return Boolean(agreement);
};

/**
 * Inserts a new agreement record into the database.
 */
export const createAgreement = async (
    userId: string,
    fileId: string,
): Promise<string> => {
    const [agreement] = await db
        .insert(Agreements)
        .values({
            user_id: userId,
            file_id: fileId,
        })
        .returning({ id: Agreements.id });

    if (!agreement) {
        throw new Error("Failed to create agreement.");
    }

    return agreement.id;
};

/**
 * Updates the agreement data and saves sections
 */
export const updateAgreement = async (
    agreementId: string,
    { title, type, metadata, property, payments, parties }: any,
    userId: string,
): Promise<void> => {
    await db
        .update(Agreements)
        .set({
            title,
            type,
            metadata,
            property,
            payments,
            parties,
        })
        .where(
            and(eq(Agreements.id, agreementId), eq(Agreements.user_id, userId)),
        );

    // Clear agreement from cache
    AgreementCache.del(agreementId);
};

/**
 * Updates the summary field of an agreement.
 */
export const updateAgreementSummary = async (
    agreementId: string,
    summary: string[],
    userId: string,
): Promise<void> => {
    await db
        .update(Agreements)
        .set({ summary })
        .where(
            and(eq(Agreements.id, agreementId), eq(Agreements.user_id, userId)),
        );

    // Clear agreement from cache
    AgreementCache.del(agreementId);
};

/**
 * Updates an agreement's status
 */
export const updateAgreementStatus = async (
    agreementId: string,
    status: AgreementStatus,
    error: string | null,
    userId: string,
): Promise<void> => {
    await db
        .update(Agreements)
        .set({
            status,
            error: error ?? null,
        })
        .where(
            and(eq(Agreements.id, agreementId), eq(Agreements.user_id, userId)),
        );

    // Clear agreement from cache
    AgreementCache.del(agreementId);
};

/**
 * Insert sections into the database
 */
export const createSections = async (
    agreementId: string,
    sections: {
        ref: string;
        type: SectionClauseType;
        heading: string;
        content: string;
    }[],
    userId: string,
): Promise<{ id: string }[]> => {
    if (sections.length === 0) return [];
    await ensureAgreementExists(agreementId, userId);

    const sectionsToInsert = sections.map((sec) => ({
        agreement_id: agreementId,
        ref: sec.ref,
        heading: sec.heading,
        type: sec.type,
        content: sec.content,
    }));

    const insertedIds = await db
        .insert(Sections)
        .values(sectionsToInsert)
        .returning({ id: Sections.id });

    return insertedIds;
};

/**
 * Fetch sections by agreement
 */
export const fetchSectionsByAgreement = async (
    agreementId: string,
    userId: string,
) => {
    await ensureAgreementExists(agreementId, userId);

    const sections = await db
        .select({
            id: Sections.id,
            ref: Sections.ref,
            heading: Sections.heading,
            type: Sections.type,
            content: Sections.content,
            embedding: Sections.embedding,
        })
        .from(Sections)
        .where(eq(Sections.agreement_id, agreementId));

    return sections;
};

/**
 * Fetch sections of an agreement by embedding similarity
 */
export const fetchSectionsByEmbeddingSimilarity = async (
    agreementId: string,
    embedding: number[],
) => {
    const similarity = sql<number>`1 - (${cosineDistance(Sections.embedding, embedding)})`;

    const results = await db
        .select({
            id: Sections.id,
            ref: Sections.ref,
            heading: Sections.heading,
            content: Sections.content,
            similarity,
        })
        .from(Sections)
        .where(
            and(
                eq(Sections.agreement_id, agreementId),
                gt(similarity, VECTOR_SIMILARITY_THRESHOLD),
            ),
        )
        .orderBy((t) => desc(t.similarity))
        .limit(5);

    return results;
};

/**
 * Updates section vector embeddings.
 */
export const updateSectionEmbedding = async (
    agreementId: string,
    sectionId: string,
    embedding: number[],
    userId: string,
): Promise<void> => {
    await ensureAgreementExists(agreementId, userId);

    await db
        .update(Sections)
        .set({ embedding })
        .where(
            and(
                eq(Sections.id, sectionId),
                eq(Sections.agreement_id, agreementId),
            ),
        );
};

/**
 * Batch insert agreement risk analysis content.
 */
export const insertAgreementRisks = async (
    userId: string,
    agreementId: string,
    data: { clause: string; reason: string; level: RiskLevelType }[],
): Promise<{ id: string }[]> => {
    await ensureAgreementExists(agreementId, userId);

    const dataToInsert = data.map((d) => ({
        agreement_id: agreementId,
        clause: d.clause,
        reason: d.reason,
        level: d.level,
    }));
    const insertedIds = await db
        .insert(Risks)
        .values(dataToInsert)
        .returning({ id: Risks.id });
    return insertedIds;
};

/**
 * Fetch agreement risks if exists.
 */
export const fetchRisksByAgreement = async (
    agreementId: string,
    userId: string,
) => {
    await ensureAgreementExists(agreementId, userId);

    const risks = await db
        .select({
            id: Risks.id,
            clause: Risks.clause,
            reason: Risks.reason,
            level: Risks.level,
        })
        .from(Risks)
        .where(eq(Risks.agreement_id, agreementId));

    return risks;
};

/**
 * Re-trigger agreement processing by setting status to RESTART
 */
export const processAgreement = async (agreementId: string, userId: string) => {
    const agreement = await fetchAgreement(agreementId, userId);
    if (!agreement) throw new Error("Agreement not found");

    await updateAgreementStatus(agreementId, "RESTART", null, userId);

    // Reset cache
    AgreementCache.del(agreementId);

    // Emit file proccesing event
    await publishAgreementProcessEvent({
        agreementId,
        fileId: agreement.fileId,
        userId,
    });
};

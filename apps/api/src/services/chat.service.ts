import { ChatMessageRole } from "@/constants";
import { Chats } from "@/db/schema/chats";
import { Messages } from "@/db/schema/messages";
import { db } from "@/infra/db.client";
import { ChatCache, ChatMessagesCache } from "@/services/cache.service";
import { and, desc, eq, lte, ne } from "drizzle-orm";

/**
 * Creates a Chat window and returns the ID
 */
export const createChat = async (
    userId: string,
    agreementId: string,
): Promise<string> => {
    // Insert into DB
    const [chat] = await db
        .insert(Chats)
        .values({
            user_id: userId,
            agreement_id: agreementId,
        })
        .returning({ id: Chats.id });

    return chat.id;
};

/**
 * Fetch a chat details by ID
 */
export const fetchChatById = async (
    chatId: string,
    userId: string,
    agreementId: string,
) => {
    let chat = await ChatCache.get(chatId);

    if (!chat) {
        // Fetch from database
        const [dbChat] = await db
            .select({
                id: Chats.id,
                user_id: Chats.user_id,
                agreement_id: Chats.agreement_id,
                created_at: Chats.created_at,
            })
            .from(Chats)
            .where(eq(Chats.id, chatId));

        if (!dbChat) throw new Error("Chat not found");
        chat = dbChat;
        await ChatCache.set(chat.id, chat);
    }

    if (chat.user_id !== userId || chat.agreement_id !== agreementId) {
        throw new Error("Unauthorized access");
    }

    return chat;
};

/**
 * Fetch chat ID by agreement
 */
export const fetchChatByAgreement = async (
    agreementId: string,
    userId: string,
) => {
    const [chat] = await db
        .select({
            id: Chats.id,
        })
        .from(Chats)
        .where(
            and(eq(Chats.agreement_id, agreementId), eq(Chats.user_id, userId)),
        );

    // If chat not found create one
    if (!chat) {
        const chatId = await createChat(userId, agreementId);
        return chatId;
    }

    return chat.id;
};

/**
 * Insert message into the chat
 */
export const insertChatMessage = async (
    chatId: string,
    userId: string,
    agreementId: string,
    message: {
        role: ChatMessageRole;
        content: string;
    },
) => {
    // Validate chat exists
    const chat = await fetchChatById(chatId, userId, agreementId);
    if (!chat) throw new Error("Chat not found");

    const [insertedMessage] = await db
        .insert(Messages)
        .values({
            chat_id: chatId,
            user_id: userId,
            role: message.role,
            content: message.content,
        })
        .returning({
            id: Messages.id,
            chatId: Messages.chat_id,
            role: Messages.role,
            content: Messages.content,
            createdAt: Messages.created_at,
        });

    if (insertedMessage) {
        await ChatMessagesCache.push(chatId, insertedMessage);
    }

    return insertedMessage;
};

/**
 * Fetch chat messages using keyset pagination.
 * Messages are returned in descending order (newest first within the page).
 */
export const fetchChatMessages = async (
    chatId: string,
    userId: string,
    agreementId: string,
    limit: number = ChatMessagesCache.limit,
    cursor?: string, // base64-encoded "id"
) => {
    // Validate chat exists
    const chat = await fetchChatById(chatId, userId, agreementId);
    if (!chat) throw new Error("Chat not found");

    // 1. Try cache if no cursor and requested limit fits in cache limit
    if (!cursor && limit <= ChatMessagesCache.limit) {
        const cachedMessages = await ChatMessagesCache.getRecent<{
            id: string;
            chatId: string;
            role: ChatMessageRole;
            content: string;
            createdAt: Date;
        }>(chatId, limit);

        if (cachedMessages) {
            let nextCursor = null;

            // If we got a full page, there's more data; create a cursor
            if (cachedMessages.length >= limit) {
                const lastMessage = cachedMessages.at(-1)!;
                nextCursor = Buffer.from(lastMessage.id).toString("base64url");
            }

            // Return cached messages (descending order)
            return { messages: cachedMessages, nextCursor };
        }
    }

    // 2. Query DB on cache miss or cursor pagination
    const cursorId = cursor
        ? Buffer.from(cursor, "base64url").toString("utf8")
        : undefined;

    // Run db query
    // Sort and paginate by ID (uuidv7 is sortable)
    const filters = [
        eq(Messages.chat_id, chatId),
        eq(Messages.user_id, userId),
    ];
    if (cursorId)
        filters.push(lte(Messages.id, cursorId), ne(Messages.id, cursorId));

    const messages = await db
        .select({
            id: Messages.id,
            chatId: Messages.chat_id,
            role: Messages.role,
            content: Messages.content,
            createdAt: Messages.created_at,
        })
        .from(Messages)
        .where(and(...filters))
        .limit(limit)
        .orderBy(desc(Messages.id));

    // 3. Populate cache if this was Page 1
    if (!cursor && messages.length > 0) {
        await ChatMessagesCache.setMany(chatId, messages);
    }

    // Prepare next cursor only if we got a full page (more data likely exists)
    let nextCursor = null;
    if (messages.length >= limit) {
        const lastMessage = messages.at(-1)!;
        nextCursor = Buffer.from(lastMessage.id).toString("base64url");
    }

    return { messages, nextCursor };
};

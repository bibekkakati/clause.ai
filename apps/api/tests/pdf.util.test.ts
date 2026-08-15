import { existsSync, mkdirSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import { TEMP_STORAGE_DIR } from "../src/config/dir.config";
import { generateUUIDv7 } from "../src/utils/id.util";
import { downloadPDF, parsePDF } from "../src/utils/pdf.util";

/**
 * ============================================================
 *  ⚠️  CONFIGURE THIS URL BEFORE RUNNING THE TEST
 *  Set it to a publicly accessible PDF URL.
 * ============================================================
 */
const TEST_PDF_URL = "";

const TEST_OUTPUT_DIR = TEMP_STORAGE_DIR + "/test-output";
const TEST_FILE_ID = generateUUIDv7();

// ── Guard ────────────────────────────────────────────────────
if (!TEST_PDF_URL) {
    describe("pdf.util", () => {
        it("should fail because TEST_PDF_URL is not configured", () => {
            throw new Error(
                "\n\n" +
                    "╔══════════════════════════════════════════════════════════════╗\n" +
                    "║  TEST_PDF_URL is not configured!                             ║\n" +
                    "║                                                              ║\n" +
                    "║  Open tests/pdf.util.test.ts and set TEST_PDF_URL to a       ║\n" +
                    "║  publicly accessible PDF URL before running this test.       ║\n" +
                    "╚══════════════════════════════════════════════════════════════╝\n",
            );
        });
    });
} else {
    describe("pdf.util", () => {
        // ── Setup & Teardown ─────────────────────────────────
        beforeAll(() => {
            if (!existsSync(TEST_OUTPUT_DIR)) {
                mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
            }
        });

        // ── Test 1: Buffer → Parse → Save output ────────────
        it("should download PDF as buffer, parse it, and save output to test-temp", async () => {
            // Step 1 – Download as buffer
            const buffer = await downloadPDF(
                TEST_FILE_ID,
                TEST_PDF_URL,
                "buffer",
            );

            expect(buffer).not.toBeNull();
            expect(buffer).toBeInstanceOf(Buffer);

            // Step 2 – Parse the buffer
            const { text, ocrRequired } = await parsePDF(
                TEST_FILE_ID,
                buffer as Buffer,
            );

            if (!text) {
                expect(ocrRequired).toBe(true);

                console.log(`\n✅ File is too complex. OCR required.`);
            } else {
                expect(typeof text).toBe("string");
                expect((text as string).length).toBeGreaterThan(0);

                // Step 3 – Write parsed output to test-temp for inspection
                const outputPath = `${TEST_OUTPUT_DIR}/${TEST_FILE_ID}-parsed.txt`;
                await writeFile(outputPath, text as string, "utf-8");

                expect(existsSync(outputPath)).toBe(true);

                const savedContent = await readFile(outputPath, "utf-8");
                expect(savedContent).toBe(text);

                console.log(`\n✅ Parsed output saved to: ${outputPath}`);
                console.log(
                    `   Content length: ${(text as string).length} characters\n`,
                );
            }
        }, 300_000); // 5 min timeout – OCR can be slow

        // ── Test 2: Filepath → Validate file exists ──────────
        it("should download PDF as filepath and validate the file exists", async () => {
            const filePath = (await downloadPDF(
                TEST_FILE_ID,
                TEST_PDF_URL,
                "path",
            )) as string;

            expect(filePath).not.toBeNull();
            expect(typeof filePath).toBe("string");
            expect(existsSync(filePath as string)).toBe(true);

            await unlink(filePath);

            console.log(`\n✅ PDF file downloaded to: ${filePath}\n`);
        }, 30_000); // 30 sec timeout
    });
}

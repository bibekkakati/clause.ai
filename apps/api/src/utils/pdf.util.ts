import { TEMP_STORAGE_DIR } from "@/config/dir.config";
import { env } from "@/config/env.config";
import { LiteParse } from "@llamaindex/liteparse";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import * as fs from "node:fs/promises";
import { logger } from "./logger.util";

const PDF_STORAGE_DIR = TEMP_STORAGE_DIR + "/docs";

const PDF_PARSER = new LiteParse({
    ocrEnabled: true,
    ocrLanguage: "eng",
    dpi: 300,
    outputFormat: "text",
    quiet: env.NODE_ENV === "development",
    keepHeadersFooters: false,
    extractFormFields: true,
    preserveVerySmallText: true,
});

/**
 * Ensures directory exists
 */
const ensureStorageDirectory = () => {
    // Clear the directory if exists to remove stale files
    if (existsSync(PDF_STORAGE_DIR)) {
        rmSync(PDF_STORAGE_DIR, { recursive: true });
    }

    mkdirSync(PDF_STORAGE_DIR, { recursive: true });
};

// Ensures directory exists
ensureStorageDirectory();

/**
 * Downloads the PDF buffer and saves it to the temporary storage
 *
 * @param key string - A unique identifier for the PDF file
 * @param url string - URL of the PDF file
 * @param returning string - Type of the return value ("path" | "buffer")
 * @returns Promise<string | null> - Path or buffer of the PDF file
 */
export const downloadPDF = async (
    key: string,
    url: string,
    returning: "path" | "buffer",
): Promise<Buffer | string> => {
    const filePath = `${PDF_STORAGE_DIR}/${key}.pdf`;

    logger.info({ key }, "PDF file download in progress...");

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    logger.info({ key }, "PDF file downloaded");

    const buffer: Buffer = Buffer.from(await response.arrayBuffer());

    // Returns buffer if requested
    if (returning === "buffer") {
        return buffer as Buffer;
    }

    // Save it to the filesystem
    await fs.writeFile(filePath, buffer);

    // Returns file path if requested
    return filePath as string;
};

/**
 * Pass the PDF buffer to parse the content (raw text)
 *
 * @param key string - A unique identifier for the PDF file
 * @param pdfBuffer Buffer - PDF Buffer
 * @returns Return parsed text or a flag if OCR is required
 */
export const parsePDF = async (
    key: string,
    pdfBuffer: Buffer,
): Promise<{ text: string; ocrRequired: boolean }> => {
    const parserLogger = logger.child({ key });
    parserLogger.info("Starting PDF Parser");

    const pdfComplexity = await PDF_PARSER.isComplex(pdfBuffer);

    let skipLocalParser = false;
    for (const complexity of pdfComplexity) {
        const { fullPageImage, textCoverage, needsOcr } = complexity;
        if (fullPageImage && textCoverage < 0.65 && needsOcr) {
            skipLocalParser = true;
            break;
        }
    }

    // Skip local parser if PDF is too complex
    if (skipLocalParser) {
        parserLogger.info(
            "Skipping PDF Parser. File is complex. OCR required.",
        );
        return { text: "", ocrRequired: true };
    }

    const result = await PDF_PARSER.parse(pdfBuffer);

    if (result.pages.length === 0) {
        parserLogger.error("No pages found in PDF");
        throw new Error("No pages found in PDF");
    }

    parserLogger.info({ pages: result.pages.length }, "PDF Parsing completed");
    return { text: result.text, ocrRequired: false };
};

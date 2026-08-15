import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerender() {
    console.log("⚡ Pre-rendering HomePage for ultra-fast First Contentful Paint (FCP)...");

    const rootDir = __dirname;
    const distDir = path.resolve(rootDir, "dist");
    const indexPath = path.resolve(distDir, "index.html");

    if (!fs.existsSync(indexPath)) {
        console.error("❌ dist/index.html not found. Run vite build first.");
        process.exit(1);
    }

    let template = fs.readFileSync(indexPath, "utf-8");

    // Use Vite SSR environment to execute entry-server.tsx
    const vite = await createServer({
        root: rootDir,
        server: { middlewareMode: true },
        appType: "custom",
    });

    try {
        const { renderHomePage } = await vite.ssrLoadModule("/src/entry-server.tsx");
        const renderedHtml = renderHomePage();

        // Inject the pre-rendered HTML into the #root element
        const updatedHtml = template.replace(
            '<div id="root"></div>',
            `<div id="root">${renderedHtml}</div>`,
        );

        fs.writeFileSync(indexPath, updatedHtml, "utf-8");
        console.log("✅ Successfully pre-rendered HomePage into dist/index.html!");
    } catch (err) {
        console.error("❌ Pre-rendering failed:", err);
        process.exit(1);
    } finally {
        await vite.close();
    }
}

prerender();

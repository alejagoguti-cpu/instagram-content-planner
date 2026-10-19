import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.NOTION_TOKEN;
const PARENT_PAGE_ID = "3f192105-e196-811c-90ea-d46b1f004c98";

const NOTION_HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json; charset=utf-8"
};

const STOP_KEYWORDS = [
  "referente",
  "dirección de arte",
  "desglose",
  "guía de",
  "notas para",
  "imágenes originales",
  "indicaciones",
  "aprendizaje",
  "regla de flujo"
];

async function extractCopies() {
  console.log("1. Buscando fichas aprobadas...");
  const parentResp = await fetch(`https://api.notion.com/v1/blocks/${PARENT_PAGE_ID}/children?page_size=100`, {
    headers: NOTION_HEADERS
  });
  const parentData = await parentResp.json();
  const childPages = parentData.results.filter(b => b.type === "child_page");
  console.log(`Encontradas ${childPages.length} fichas.`);

  const copyMap = {}; // cleanId -> copy text

  for (let i = 0; i < childPages.length; i++) {
    const cp = childPages[i];
    const cleanId = cp.id.replace(/-/g, "");

    try {
      const blocksResp = await fetch(`https://api.notion.com/v1/blocks/${cp.id}/children?page_size=100`, {
        headers: NOTION_HEADERS
      });
      const blocksData = await blocksResp.json();
      if (!blocksResp.ok) continue;

      let capturing = false;
      let lines = [];

      for (const b of (blocksData.results || [])) {
        let txt = "";
        if (b[b.type]?.rich_text) {
          txt = b[b.type].rich_text.map(t => t.plain_text).join("").trim();
        }

        const isHeading = b.type.startsWith("heading");
        const lower = txt.toLowerCase();

        // Detectar inicio de sección de copy de la pieza nueva
        if (isHeading && (lower.includes("copy") || lower.includes("copys") || lower.includes("texto aprobado"))) {
          capturing = true;
          continue;
        }

        if (capturing) {
          // Detectar final de sección de copy
          if (isHeading && STOP_KEYWORDS.some(k => lower.includes(k))) {
            break;
          }

          if (isHeading) {
            lines.push(`\n**${txt}**`);
          } else if (b.type === "bulleted_list_item") {
            lines.push(`• ${txt}`);
          } else if (txt) {
            lines.push(txt);
          }
        }
      }

      if (lines.length > 0) {
        copyMap[cleanId] = lines.join("\n").trim();
        console.log(`[${i + 1}/${childPages.length}] Copy extraído: ${cp.child_page.title.slice(0, 45)}`);
      }
    } catch (err) {
      console.warn(`Error en ${cp.child_page.title}:`, err.message);
    }
  }

  console.log(`\nExtraídos ${Object.keys(copyMap).length} copies aprobados.`);

  // Actualizar src/data/notionPosts.json
  const postsPath = path.resolve("./src/data/notionPosts.json");
  if (fs.existsSync(postsPath)) {
    const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
    let updated = 0;

    for (const p of posts) {
      const fichaUrl = p.fichaAprobada || p.linkReferente || "";
      let matchedCleanId = null;

      for (const cleanId of Object.keys(copyMap)) {
        if (fichaUrl.includes(cleanId) || (p.id && p.id.replace(/-/g, "").includes(cleanId))) {
          matchedCleanId = cleanId;
          break;
        }
      }

      if (!matchedCleanId) {
        for (const cp of childPages) {
          const cleanId = cp.id.replace(/-/g, "");
          if (copyMap[cleanId]) {
            const cpTitle = cp.child_page.title.toLowerCase();
            const pTitle = (p.pieza || "").toLowerCase();
            const sliceMatch = pTitle.replace(/^\d+\.\s*/, "").slice(0, 18);
            if (sliceMatch && cpTitle.includes(sliceMatch)) {
              matchedCleanId = cleanId;
              break;
            }
          }
        }
      }

      if (matchedCleanId && copyMap[matchedCleanId]) {
        p.copyAprobado = copyMap[matchedCleanId];
        p.guionCopy = copyMap[matchedCleanId];
        updated++;
      }
    }

    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`✅ ¡${updated} publicaciones actualizadas con su COPY APROBADO LÁMINA POR LÁMINA!`);
  }
}

extractCopies().catch(err => {
  console.error(err);
  process.exit(1);
});

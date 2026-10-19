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

const STOP_SECTIONS = [
  "board",
  "propósito",
  "proposito",
  "referente",
  "guía visual",
  "guia visual",
  "desglose",
  "originales",
  "regla y propósito",
  "arquitectura visual",
  "arquitectura y",
  "decisión creativa",
  "pendientes",
  "correspondencia",
  "preparación pendiente",
  "fuentes del caso",
  "contexto de producto",
  "contexto confirmado",
  "nota de adaptación"
];

function isStartHeading(txt) {
  const t = txt.trim().toLowerCase();
  return (
    t.includes("texto exacto") ||
    t.includes("copy exacto") ||
    t.includes("copy final") ||
    t.includes("copys exactos") ||
    t.includes("texto aprobado") ||
    (t.startsWith("copy") && !t.includes("referente"))
  );
}

function isStopHeading(txt) {
  const t = txt.trim().toLowerCase();
  return STOP_SECTIONS.some(s => t.startsWith(s) || t.includes("board aprobado") || t.includes("referente original") || t.includes("caption y cta"));
}

async function extractAllCopies() {
  console.log("1. Buscando todas las fichas en Notion...");
  const parentResp = await fetch(`https://api.notion.com/v1/blocks/${PARENT_PAGE_ID}/children?page_size=100`, {
    headers: NOTION_HEADERS
  });
  const parentData = await parentResp.json();
  const childPages = parentData.results.filter(b => b.type === "child_page");
  console.log(`Encontradas ${childPages.length} fichas.`);

  const copyMap = {}; // cleanId -> full structured copy text

  for (let i = 0; i < childPages.length; i++) {
    const cp = childPages[i];
    const cleanId = cp.id.replace(/-/g, "");

    try {
      const blocksResp = await fetch(`https://api.notion.com/v1/blocks/${cp.id}/children?page_size=100`, {
        headers: NOTION_HEADERS
      });
      const blocksData = await blocksResp.json();
      if (!blocksResp.ok) continue;

      const blocks = blocksData.results || [];
      let startIndex = -1;

      for (let j = 0; j < blocks.length; j++) {
        const b = blocks[j];
        if (b.type.startsWith("heading")) {
          const txt = b[b.type]?.rich_text?.map(t => t.plain_text).join("") || "";
          if (isStartHeading(txt)) {
            startIndex = j;
            break;
          }
        }
      }

      if (startIndex !== -1) {
        let lines = [];
        let currentSlide = "";

        for (let j = startIndex + 1; j < blocks.length; j++) {
          const b = blocks[j];
          const txt = (b[b.type]?.rich_text?.map(t => t.plain_text).join("") || "").trim();
          
          if (b.type.startsWith("heading_1") || b.type.startsWith("heading_2")) {
            if (isStopHeading(txt)) {
              break;
            }
          }

          if (b.type.startsWith("heading")) {
            lines.push(`\n**${txt}**`);
          } else if (b.type === "bulleted_list_item") {
            lines.push(`• ${txt}`);
          } else if (b.type === "numbered_list_item") {
            lines.push(txt);
          } else if (txt) {
            lines.push(txt);
          }
        }

        const fullCopy = lines.join("\n").trim();
        if (fullCopy.length > 0) {
          copyMap[cleanId] = fullCopy;
          console.log(`[${i + 1}/${childPages.length}] OK (${fullCopy.length} caracteres): ${cp.child_page.title.slice(0, 45)}`);
        }
      } else {
        console.warn(`[${i + 1}/${childPages.length}] No se detectó inicio de copy: ${cp.child_page.title}`);
      }
    } catch (err) {
      console.warn(`Error en ficha ${cp.child_page.title}:`, err.message);
    }
  }

  console.log(`\nExtraídos ${Object.keys(copyMap).length} copys completos.`);

  // Actualizar src/data/notionPosts.json
  const postsPath = path.resolve("./src/data/notionPosts.json");
  if (fs.existsSync(postsPath)) {
    const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
    let updated = 0;

    for (const p of posts) {
      const fichaUrl = p.fichaAprobada || p.linkReferente || "";
      let matchedCleanId = null;

      // 1. Coincidencia por URL / ID limpio
      for (const cleanId of Object.keys(copyMap)) {
        if (fichaUrl.includes(cleanId) || (p.id && p.id.replace(/-/g, "").includes(cleanId))) {
          matchedCleanId = cleanId;
          break;
        }
      }

      // 2. Coincidencia por título o número
      if (!matchedCleanId) {
        const pNumMatch = p.pieza.match(/^(\d+)\./);
        const pNum = pNumMatch ? pNumMatch[1] : null;

        for (const cp of childPages) {
          const cleanId = cp.id.replace(/-/g, "");
          if (copyMap[cleanId]) {
            const cpTitle = cp.child_page.title;
            const cpNumMatch = cpTitle.match(/^(\d+)\./);
            const cpNum = cpNumMatch ? cpNumMatch[1] : null;

            if (pNum && cpNum && parseInt(pNum, 10) === parseInt(cpNum, 10)) {
              matchedCleanId = cleanId;
              break;
            }

            const pTitle = (p.pieza || "").toLowerCase().replace(/^\d+\.\s*/, "").slice(0, 20);
            if (pTitle && cpTitle.toLowerCase().includes(pTitle)) {
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
      } else {
        console.warn(`Sin copy para post: ${p.pieza}`);
      }
    }

    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`\n✅ ¡${updated} de ${posts.length} publicaciones actualizadas con su COPY COMPLETO!`);
  }
}

extractAllCopies().catch(err => {
  console.error(err);
  process.exit(1);
});

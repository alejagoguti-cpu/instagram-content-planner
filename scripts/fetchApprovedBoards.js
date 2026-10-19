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

const boardsDir = path.resolve("./public/boards");
if (!fs.existsSync(boardsDir)) {
  fs.mkdirSync(boardsDir, { recursive: true });
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    console.error(`Error descargando imagen a ${destPath}:`, err.message);
    return false;
  }
}

async function fetchAllApprovedBoards() {
  console.log("1. Buscando fichas aprobadas hijas de:", PARENT_PAGE_ID);

  const parentResp = await fetch(`https://api.notion.com/v1/blocks/${PARENT_PAGE_ID}/children?page_size=100`, {
    headers: NOTION_HEADERS
  });
  const parentData = await parentResp.json();
  if (!parentResp.ok) {
    throw new Error(`Error Notion API: ${JSON.stringify(parentData)}`);
  }

  const childPages = parentData.results.filter(b => b.type === "child_page");
  console.log(`Encontradas ${childPages.length} fichas.`);

  const boardMap = {}; // cleanId -> local path

  for (let i = 0; i < childPages.length; i++) {
    const cp = childPages[i];
    const cleanId = cp.id.replace(/-/g, "");
    const title = cp.child_page.title;

    try {
      const blocksResp = await fetch(`https://api.notion.com/v1/blocks/${cp.id}/children?page_size=100`, {
        headers: NOTION_HEADERS
      });
      const blocksData = await blocksResp.json();
      if (!blocksResp.ok) continue;

      const imageBlocks = (blocksData.results || []).filter(b => b.type === "image");
      if (imageBlocks.length > 0) {
        // La imagen del board aprobado siempre está al final
        const lastImage = imageBlocks[imageBlocks.length - 1];
        const imgUrl = lastImage.image.file?.url || lastImage.image.external?.url;

        if (imgUrl) {
          const fileName = `${cleanId}.png`;
          const filePath = path.join(boardsDir, fileName);

          console.log(`[${i + 1}/${childPages.length}] Guardando Board aprobado: ${title.slice(0, 45)}...`);
          const ok = await downloadImage(imgUrl, filePath);
          if (ok) {
            boardMap[cleanId] = `./boards/${fileName}`;
          }
        }
      }
    } catch (err) {
      console.warn(`Error en ${title}:`, err.message);
    }
  }

  console.log(`\nDescargados ${Object.keys(boardMap).length} boards aprobados.`);

  const postsPath = path.resolve("./src/data/notionPosts.json");
  if (fs.existsSync(postsPath)) {
    const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
    let updatedCount = 0;

    for (const p of posts) {
      const fichaUrl = p.fichaAprobada || p.linkReferente || "";
      let matchedCleanId = null;

      for (const cleanId of Object.keys(boardMap)) {
        if (fichaUrl.includes(cleanId) || (p.id && p.id.replace(/-/g, "").includes(cleanId))) {
          matchedCleanId = cleanId;
          break;
        }
      }

      if (!matchedCleanId) {
        for (const cp of childPages) {
          const cleanId = cp.id.replace(/-/g, "");
          if (boardMap[cleanId]) {
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

      if (matchedCleanId && boardMap[matchedCleanId]) {
        p.coverImage = boardMap[matchedCleanId];
        updatedCount++;
      }
    }

    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`✅ ¡${updatedCount} publicaciones actualizadas con su DISEÑO APROBADO REAL en notionPosts.json!`);
  }
}

fetchAllApprovedBoards().catch(err => {
  console.error("Error en fetchAllApprovedBoards:", err);
  process.exit(1);
});

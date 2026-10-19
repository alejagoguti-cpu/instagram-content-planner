import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DATABASE_ID || "3fb92105-e196-812f-9af9-da2a1aed073f";

const NOTION_HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json; charset=utf-8"
};

const THEME_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80"
];

function getPlainText(prop) {
  if (!prop) return "";
  if (prop.title && Array.isArray(prop.title)) {
    return prop.title.map(t => t.plain_text).join("");
  }
  if (prop.rich_text && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map(t => t.plain_text).join("");
  }
  return "";
}

function formatNotionPage(page, index) {
  const p = page.properties || {};

  let coverImage = "";
  if (page.cover) {
    coverImage = page.cover.file?.url || page.cover.external?.url || "";
  } else if (p["Archivos / Editables"]?.files?.length > 0) {
    const f = p["Archivos / Editables"].files[0];
    coverImage = f.file?.url || f.external?.url || "";
  }

  const linkReferente = p["Link Referente"]?.url || p["\"Link Referente\""]?.url || "";
  const linkEntrega = p["Link de Entrega"]?.url || p["\"Link de Entrega\""]?.url || "";
  const editableLink = p["Editable (Canva / Link)"]?.url || "";
  const fichaAprobada = p["Ficha Aprobada"]?.url || "";

  if (!coverImage) {
    if (linkReferente.includes(".jpg") || linkReferente.includes(".png") || linkReferente.includes("unsplash")) {
      coverImage = linkReferente;
    } else {
      // Usar miniatura visual por temática para que no se vea vacío
      coverImage = THEME_IMAGES[index % THEME_IMAGES.length];
    }
  }

  const pilar = p["Pilar / Temática"]?.select?.name || "Cobros · Pagos y Tesorería";

  return {
    id: page.id,
    pieza: getPlainText(p["Pieza"]) || "Sin título",
    estado: p["Estado"]?.select?.name || "Aprobado (Copy y Board)",
    fecha: p["Fecha"]?.date?.start || "",
    turno: p["Turno del Día"]?.select?.name || "☀️ Publicación 1 (Mañana)",
    dia: p["Día"]?.select?.name || "Lunes",
    semana: p["Semana"]?.select?.name || "Semana 01",
    etapa: p["Etapa"]?.select?.name || (index % 3 === 0 ? "Atracción" : index % 3 === 1 ? "Venta" : "Validación"),
    producto: getPlainText(p["Producto"]) || pilar,
    anguloVenta: p["Ángulo de Venta"]?.select?.name || p["\"Ángulo de Venta\""]?.select?.name || "Voz en Off",
    categoria: p["Categoría"]?.select?.name || "Aspiracional",
    formato: p["Formato"]?.select?.name || "Carrusel",
    tipo: p["Tipo"]?.select?.name || "Carrusel",
    hook: getPlainText(p["Hook"]) || getPlainText(p["Pieza"]) || "",
    guionCopy: getPlainText(p["Guión / Copy"]) || `Ficha aprobada: ${fichaAprobada}`,
    storytelling: getPlainText(p["Storytelling"]) || `Pilar temático: ${pilar}`,
    historias: getPlainText(p["Historias"]) || "Acompañamiento en Stories con sticker de interacción",
    linkReferente: linkReferente || editableLink || fichaAprobada || "",
    notasReferentes: getPlainText(p["Notas Referentes"]) || getPlainText(p["\"Notas Referentes\""]) || "",
    fechaEntrega: p["Fecha de Entrega"]?.date?.start || p["\"Fecha de Entrega\""]?.date?.start || "",
    linkEntrega: linkEntrega || editableLink,
    responsable: getPlainText(p["Responsable"]) || "Gabi",
    observaciones: getPlainText(p["Observaciones"]) || "",
    editableLink,
    fichaAprobada,
    coverImage,
    url: page.url
  };
}

async function syncAllPosts() {
  console.log("Consultando publicaciones reales desde Notion...");
  let allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: "POST",
      headers: NOTION_HEADERS,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error Notion API: ${JSON.stringify(data)}`);
    }

    allPages = allPages.concat(data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  console.log(`¡Recuperadas ${allPages.length} publicaciones de Notion con éxito!`);
  const formatted = allPages.map((page, i) => formatNotionPage(page, i));

  formatted.sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));

  const outputPath = path.resolve("./src/data/notionPosts.json");
  fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2), "utf-8");
  console.log(`Guardado en ${outputPath}`);
}

syncAllPosts().catch(err => {
  console.error("Error al sincronizar con Notion:", err);
  process.exit(1);
});

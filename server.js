import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

app.use(cors());
app.use(express.json());

const NOTION_HEADERS = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json; charset=utf-8"
};

// Helper: extraer texto plano de propiedad rich_text o title
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

// Helper: formatear página de Notion a objeto simple del Planner
function formatNotionPage(page) {
  const p = page.properties || {};

  // Extraer imagen de cover o archivos
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

  return {
    id: page.id,
    pieza: getPlainText(p["Pieza"]) || "Sin título",
    estado: p["Estado"]?.select?.name || "Sin estado",
    fecha: p["Fecha"]?.date?.start || "",
    turno: p["Turno del Día"]?.select?.name || "☀️ Publicación 1 (Mañana)",
    dia: p["Día"]?.select?.name || "Lunes",
    semana: p["Semana"]?.select?.name || "Semana 01",
    etapa: p["Etapa"]?.select?.name || "Atracción",
    producto: getPlainText(p["Producto"]) || "",
    anguloVenta: p["Ángulo de Venta"]?.select?.name || p["\"Ángulo de Venta\""]?.select?.name || "Voz en Off",
    categoria: p["Categoría"]?.select?.name || "Aspiracional",
    formato: p["Formato"]?.select?.name || "Carrusel",
    tipo: p["Tipo"]?.select?.name || "Carrusel",
    hook: getPlainText(p["Hook"]) || "",
    guionCopy: getPlainText(p["Guión / Copy"]) || "",
    storytelling: getPlainText(p["Storytelling"]) || "",
    historias: getPlainText(p["Historias"]) || "",
    linkReferente,
    notasReferentes: getPlainText(p["Notas Referentes"]) || getPlainText(p["\"Notas Referentes\""]) || "",
    fechaEntrega: p["Fecha de Entrega"]?.date?.start || p["\"Fecha de Entrega\""]?.date?.start || "",
    linkEntrega,
    responsable: getPlainText(p["Responsable"]) || "",
    observaciones: getPlainText(p["Observaciones"]) || "",
    editableLink,
    fichaAprobada,
    coverImage: coverImage || (linkReferente.includes(".jpg") || linkReferente.includes(".png") ? linkReferente : ""),
    url: page.url
  };
}

// Endpoint de estado
app.get("/api/status", async (req, res) => {
  try {
    const response = await fetch("https://api.notion.com/v1/users/me", {
      headers: NOTION_HEADERS
    });
    const data = await response.json();
    if (!response.ok) {
      return res.json({ connected: false, error: data.message });
    }
    res.json({
      connected: true,
      botName: data.name,
      workspaceName: data.bot?.workspace_name,
      databaseId: NOTION_DATABASE_ID
    });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// Endpoint: Obtener todos los posts
app.get("/api/posts", async (req, res) => {
  try {
    if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
      return res.status(400).json({ error: "Faltan credenciales de Notion en el .env" });
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        page_size: 100,
        sorts: [
          { property: "Fecha", direction: "ascending" }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message });
    }

    const posts = data.results.map(formatNotionPage);
    res.json(posts);
  } catch (err) {
    console.error("Error al obtener posts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Crear nuevo post en Notion
app.post("/api/posts", async (req, res) => {
  try {
    const post = req.body;
    const properties = {
      "Pieza": {
        title: [{ text: { content: post.pieza || "Nueva Pieza" } }]
      }
    };

    if (post.estado) properties["Estado"] = { select: { name: post.estado } };
    if (post.fecha) properties["Fecha"] = { date: { start: post.fecha } };
    if (post.turno) properties["Turno del Día"] = { select: { name: post.turno } };
    if (post.dia) properties["Día"] = { select: { name: post.dia } };
    if (post.semana) properties["Semana"] = { select: { name: post.semana } };
    if (post.etapa) properties["Etapa"] = { select: { name: post.etapa } };
    if (post.producto) properties["Producto"] = { rich_text: [{ text: { content: post.producto } }] };
    if (post.anguloVenta) properties["Ángulo de Venta"] = { select: { name: post.anguloVenta } };
    if (post.categoria) properties["Categoría"] = { select: { name: post.categoria } };
    if (post.formato) properties["Formato"] = { select: { name: post.formato } };
    if (post.tipo) properties["Tipo"] = { select: { name: post.tipo } };
    if (post.hook) properties["Hook"] = { rich_text: [{ text: { content: post.hook } }] };
    if (post.guionCopy) properties["Guión / Copy"] = { rich_text: [{ text: { content: post.guionCopy } }] };
    if (post.storytelling) properties["Storytelling"] = { rich_text: [{ text: { content: post.storytelling } }] };
    if (post.historias) properties["Historias"] = { rich_text: [{ text: { content: post.historias } }] };
    if (post.linkReferente) properties["Link Referente"] = { url: post.linkReferente };
    if (post.notasReferentes) properties["Notas Referentes"] = { rich_text: [{ text: { content: post.notasReferentes } }] };
    if (post.fechaEntrega) properties["Fecha de Entrega"] = { date: { start: post.fechaEntrega } };
    if (post.linkEntrega) properties["Link de Entrega"] = { url: post.linkEntrega };
    if (post.responsable) properties["Responsable"] = { rich_text: [{ text: { content: post.responsable } }] };
    if (post.observaciones) properties["Observaciones"] = { rich_text: [{ text: { content: post.observaciones } }] };

    const payload = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties
    };

    if (post.coverImage && post.coverImage.startsWith("http")) {
      payload.cover = {
        type: "external",
        external: { url: post.coverImage }
      };
    }

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: NOTION_HEADERS,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message });
    }

    res.json(formatNotionPage(data));
  } catch (err) {
    console.error("Error al crear post:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Actualizar post existente
app.patch("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = req.body;
    const properties = {};

    if (post.pieza !== undefined) {
      properties["Pieza"] = { title: [{ text: { content: post.pieza } }] };
    }
    if (post.estado !== undefined) properties["Estado"] = { select: { name: post.estado } };
    if (post.fecha !== undefined) properties["Fecha"] = { date: post.fecha ? { start: post.fecha } : null };
    if (post.turno !== undefined) properties["Turno del Día"] = { select: { name: post.turno } };
    if (post.dia !== undefined) properties["Día"] = { select: { name: post.dia } };
    if (post.semana !== undefined) properties["Semana"] = { select: { name: post.semana } };
    if (post.etapa !== undefined) properties["Etapa"] = { select: { name: post.etapa } };
    if (post.producto !== undefined) properties["Producto"] = { rich_text: [{ text: { content: post.producto } }] };
    if (post.anguloVenta !== undefined) properties["Ángulo de Venta"] = { select: { name: post.anguloVenta } };
    if (post.categoria !== undefined) properties["Categoría"] = { select: { name: post.categoria } };
    if (post.formato !== undefined) properties["Formato"] = { select: { name: post.formato } };
    if (post.tipo !== undefined) properties["Tipo"] = { select: { name: post.tipo } };
    if (post.hook !== undefined) properties["Hook"] = { rich_text: [{ text: { content: post.hook } }] };
    if (post.guionCopy !== undefined) properties["Guión / Copy"] = { rich_text: [{ text: { content: post.guionCopy } }] };
    if (post.storytelling !== undefined) properties["Storytelling"] = { rich_text: [{ text: { content: post.storytelling } }] };
    if (post.historias !== undefined) properties["Historias"] = { rich_text: [{ text: { content: post.historias } }] };
    if (post.linkReferente !== undefined) properties["Link Referente"] = { url: post.linkReferente || null };
    if (post.notasReferentes !== undefined) properties["Notas Referentes"] = { rich_text: [{ text: { content: post.notasReferentes } }] };
    if (post.fechaEntrega !== undefined) properties["Fecha de Entrega"] = { date: post.fechaEntrega ? { start: post.fechaEntrega } : null };
    if (post.linkEntrega !== undefined) properties["Link de Entrega"] = { url: post.linkEntrega || null };
    if (post.responsable !== undefined) properties["Responsable"] = { rich_text: [{ text: { content: post.responsable } }] };
    if (post.observaciones !== undefined) properties["Observaciones"] = { rich_text: [{ text: { content: post.observaciones } }] };

    const payload = { properties };

    if (post.coverImage && post.coverImage.startsWith("http")) {
      payload.cover = {
        type: "external",
        external: { url: post.coverImage }
      };
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: NOTION_HEADERS,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message });
    }

    res.json(formatNotionPage(data));
  } catch (err) {
    console.error("Error al actualizar post:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Resolver vista previa de link de referente (Instagram / TikTok / YouTube / Imagen)
app.post("/api/extract-preview", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL requerida" });

  try {
    let type = "generic";
    let embedUrl = "";
    let thumbnail = "";

    if (url.includes("instagram.com")) {
      type = "instagram";
      // Formato embed estándar de instagram
      const match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
      if (match) {
        embedUrl = `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
      }
    } else if (url.includes("tiktok.com")) {
      type = "tiktok";
      const match = url.match(/\/video\/([0-9]+)/);
      if (match) {
        embedUrl = `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      type = "youtube";
      const match = url.match(/(?:youtu\.be\/|watch\?v=)([A-Za-z0-9_-]+)/);
      if (match) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        thumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    } else if (/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url)) {
      type = "image";
      thumbnail = url;
    }

    res.json({
      url,
      type,
      embedUrl,
      thumbnail
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend de Instagram Content Planner corriendo en http://localhost:${PORT}`);
});

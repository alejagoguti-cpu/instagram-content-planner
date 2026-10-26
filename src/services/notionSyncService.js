// Servicio de Sincronización en Tiempo Real con Notion
// Base de datos oficial de Bitaxus: 3fb92105-e196-812f-9af9-da2a1aed073f

const DATABASE_ID = '3fb92105-e196-812f-9af9-da2a1aed073f';

const getNotionToken = () => {
  const b64 = 'bnRuXzM5MjA4NzM5MjIyMnRXS2piWmxFQmJpVTExZXZvOHFlZXFkTVpkNXhwV0g3blM=';
  if (typeof atob === 'function') {
    return atob(b64);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  return '';
};

const getHeaders = () => ({
  'Authorization': `Bearer ${getNotionToken()}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
});

// Normalizar estados para Notion y el planificador
export const mapNotionStatusToLocal = (notionStatus) => {
  if (!notionStatus) return 'Aprobado';
  const t = notionStatus.toLowerCase();
  if (t.includes('corrección') || t.includes('correcion') || t.includes('desaprobado')) {
    return 'Corrección';
  }
  if (t.includes('proceso')) {
    return 'En proceso';
  }
  return 'Aprobado';
};

export const mapLocalStatusToNotion = (localStatus) => {
  if (localStatus === 'Corrección') return 'En corrección';
  if (localStatus === 'En proceso') return 'En proceso';
  return 'Aprobado (Copy y Board)';
};

// Estados antiguos (En corrección / Desaprobado) -> categorías actuales
export const normalizeEstado = (estado) =>
  estado === 'En corrección' || estado === 'Desaprobado' ? 'Corrección' : estado;

// Obtener actualizaciones en vivo desde Notion para todos los computadores
export const fetchNotionLiveUpdates = async () => {
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ page_size: 100 })
    });

    if (!res.ok) {
      console.warn('Error al consultar Notion API:', res.status);
      return { success: false, data: {}, allNotionPosts: [] };
    }

    const data = await res.json();
    const updatesMap = {};
    const allNotionPosts = [];

    (data.results || []).forEach(page => {
      const pageId = page.id;
      const estadoRaw = page.properties?.Estado?.select?.name;
      const obsList = page.properties?.Observaciones?.rich_text || [];
      const observaciones = obsList.map(t => t.plain_text).join('\n').trim();
      const canvaLink = page.properties?.['Editable (Canva / Link)']?.url;
      const pieza = page.properties?.Pieza?.title?.[0]?.plain_text || 'Publicación sin título';
      const semana = page.properties?.Semana?.select?.name || 'Semana 01';
      const dia = page.properties?.['Día']?.select?.name || 'Lunes';
      const fecha = page.properties?.Fecha?.date?.start || '2026-10-21';
      const fechaEntrega = page.properties?.['Fecha de Entrega']?.date?.start || '2026-10-18';
      const turno = page.properties?.['Turno del Día']?.select?.name || 'Turno 1';
      const pilar = page.properties?.['Pilar / Temática']?.select?.name || 'Bitaxus';
      const etapa = page.properties?.Etapa?.select?.name || 'Atracción';
      const hook = page.properties?.Hook?.rich_text?.[0]?.plain_text || pieza;
      const guionCopy = page.properties?.['Guión / Copy']?.rich_text?.[0]?.plain_text || pieza;
      const linkReferente = page.properties?.['Ficha Aprobada']?.url || page.url;

      const postObj = {
        id: pageId,
        pieza,
        semana,
        dia,
        fecha,
        fechaEntrega,
        turno,
        pilar,
        producto: pilar,
        etapa,
        hook,
        guionCopy,
        copyAprobado: guionCopy,
        caption: `${pieza}\n\nNueva publicación sincronizada directamente desde Notion.\n\n• • •\n#Bitaxus`,
        linkReferente,
        editableLink: canvaLink || null,
        viewLink: page.properties?.['Vista (Canva / Link)']?.url || null,
        historiaLink: ((page.properties?.Historias?.rich_text || []).map(t => t.plain_text).join('').trim().match(/^https?:\/\/\S+$/) || [null])[0],
        fechaNotion: page.properties?.Fecha?.date?.start || null,
        fechaEntregaNotion: page.properties?.['Fecha de Entrega']?.date?.start || null,
        diaNotion: page.properties?.['Día']?.select?.name || null,
        estadoAprobacion: mapNotionStatusToLocal(estadoRaw),
        estadoNotionOriginal: estadoRaw,
        notasFeedback: observaciones || '',
        coverImage: page.cover?.file?.url || page.cover?.external?.url || null
      };

      updatesMap[pageId] = postObj;
      allNotionPosts.push(postObj);
    });

    return { success: true, data: updatesMap, allNotionPosts };
  } catch (err) {
    console.error('Fallo en sincronización Notion:', err);
    return { success: false, data: {}, allNotionPosts: [] };
  }
};

// Guardar cambios directamente en la fila de Notion correspondiente
export const savePostToNotion = async (postId, updates) => {
  try {
    const propertiesToUpdate = {};

    // 1. Actualizar Observaciones / Feedback
    if (updates.notasFeedback !== undefined) {
      const textContent = updates.notasFeedback ? String(updates.notasFeedback).trim() : '';
      propertiesToUpdate['Observaciones'] = {
        rich_text: textContent
          ? [{ text: { content: textContent } }]
          : []
      };
    }

    // 2. Actualizar Estado
    if (updates.estadoAprobacion) {
      propertiesToUpdate['Estado'] = {
        select: {
          name: mapLocalStatusToNotion(updates.estadoAprobacion)
        }
      };
    }

    // 3. Actualizar Link de Canva / Editable si se provee
    if (updates.editableLink) {
      propertiesToUpdate['Editable (Canva / Link)'] = {
        url: updates.editableLink
      };
    }

    // Fechas (Publicación, Solicitado) y día de la semana
    if (updates.fecha) {
      propertiesToUpdate['Fecha'] = { date: { start: updates.fecha } };
    }
    if (updates.dia) {
      propertiesToUpdate['Día'] = { select: { name: updates.dia } };
    }
    if (updates.fechaEntrega) {
      propertiesToUpdate['Fecha de Entrega'] = { date: { start: updates.fechaEntrega } };
    }

    // Link de Canva de la historia (se guarda como texto en la propiedad Historias)
    if (updates.historiaLink) {
      propertiesToUpdate['Historias'] = {
        rich_text: [{ text: { content: updates.historiaLink } }]
      };
    }

    // 4. Mover el post de semana
    if (updates.semana) {
      propertiesToUpdate['Semana'] = {
        select: { name: updates.semana }
      };
    }

    // Si no hay propiedades que actualizar en Notion
    if (Object.keys(propertiesToUpdate).length === 0) {
      return { success: true };
    }

    const res = await fetch(`https://api.notion.com/v1/pages/${postId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ properties: propertiesToUpdate })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Error al actualizar página en Notion:', res.status, errData);
      return { success: false, error: errData };
    }

    return { success: true };
  } catch (err) {
    console.error('Error enviando cambios a Notion:', err);
    return { success: false, error: err.message };
  }
};

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
  if (notionStatus.toLowerCase().includes('corrección') || notionStatus.toLowerCase().includes('correcion')) {
    return 'En corrección';
  }
  if (notionStatus.toLowerCase().includes('desaprobado')) {
    return 'Desaprobado';
  }
  return 'Aprobado';
};

export const mapLocalStatusToNotion = (localStatus) => {
  if (localStatus === 'En corrección') return 'En corrección';
  if (localStatus === 'Desaprobado') return 'Desaprobado';
  return 'Aprobado (Copy y Board)';
};

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
      return { success: false, data: {} };
    }

    const data = await res.json();
    const updatesMap = {};

    (data.results || []).forEach(page => {
      const pageId = page.id;
      const estadoRaw = page.properties?.Estado?.select?.name;
      const obsList = page.properties?.Observaciones?.rich_text || [];
      const observaciones = obsList.map(t => t.plain_text).join('\n').trim();
      const canvaLink = page.properties?.['Editable (Canva / Link)']?.url;

      updatesMap[pageId] = {
        estadoAprobacion: mapNotionStatusToLocal(estadoRaw),
        estadoNotionOriginal: estadoRaw,
        notasFeedback: observaciones || '',
        editableLink: canvaLink || undefined
      };
    });

    return { success: true, data: updatesMap };
  } catch (err) {
    console.error('Fallo en sincronización Notion:', err);
    return { success: false, data: {} };
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

// Servicio de Notificaciones para Bitaxus Planner
// Destinatario oficial configurado: socialmedia@bitaxus.com

const DEFAULT_RECIPIENT = 'socialmedia@bitaxus.com';
const STORAGE_KEY = 'bitaxus_notification_email';
const WEBHOOK_KEY = 'bitaxus_notification_webhook';

export const getNotificationEmail = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_RECIPIENT;
  } catch (e) {
    return DEFAULT_RECIPIENT;
  }
};

export const setNotificationEmail = (email) => {
  try {
    localStorage.setItem(STORAGE_KEY, email);
  } catch (e) {}
};

export const getNotificationWebhook = () => {
  try {
    return localStorage.getItem(WEBHOOK_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const setNotificationWebhook = (url) => {
  try {
    localStorage.setItem(WEBHOOK_KEY, url);
  } catch (e) {}
};

export const formatEmailPayload = (post, feedback, estado, autor = 'Alejandra Gómez') => {
  const currentStatus = estado || post.estadoAprobacion || 'En corrección';
  const postName = post.pieza || post.hook || `Post ${post.id}`;
  const semana = post.semana || 'Semana 01';
  const pilar = post.pilar || post.producto || 'Bitaxus';
  const canvaLink = post.editableLink || post.linkEntrega || 'No disponible';
  const notionLink = post.linkReferente || 'No disponible';
  const fechaPublicacion = post.fecha || 'No definida';
  const fechaEntrega = post.fechaEntrega || 'No definida';

  const subject = `[Bitaxus Planner] Feedback de ${autor}: ${postName} (${semana})`;
  
  const body = `Hola equipo Bitaxus,

Se ha registrado una nueva observación de ${autor} para la siguiente pieza de contenido:

• Pieza: ${postName}
• Semana: ${semana}
• Autor del comentario: ${autor}
• Pilar: ${pilar}
• Estado: ${currentStatus}
• Fecha Solicitud / Deadline: ${fechaEntrega}
• Fecha de Publicación Instagram: ${fechaPublicacion}

OBSERVACIONES / CORRECCIONES:
--------------------------------------------------
${feedback || 'Sin observaciones adicionales.'}
--------------------------------------------------

ENLACES DE PRODUCCIÓN:
• Diseño editable (Canva): ${canvaLink}
• Referente original (Notion): ${notionLink}

Enviado automáticamente desde el Planificador de Contenido Bitaxus.`;

  return { subject, body };
};

// Generar y abrir cliente de correo (Gmail, Outlook, Mail app)
export const openMailClient = (post, feedback, estado, autor = 'Alejandra Gómez') => {
  const recipient = getNotificationEmail();
  const { subject, body } = formatEmailPayload(post, feedback, estado, autor);
  const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
};

// Formato limpio para compartir en WhatsApp o Slack
export const formatWhatsAppText = (post, feedback, estado, autor = 'Alejandra Gómez') => {
  const currentStatus = estado || post.estadoAprobacion || 'En corrección';
  const postName = post.pieza || post.hook || `Post ${post.id}`;
  const semana = post.semana || 'Semana 01';
  const canvaLink = post.editableLink || post.linkEntrega || '';

  return `*Feedback Bitaxus Content*\n` +
    `*Pieza:* ${postName} (${semana})\n` +
    `*Por:* ${autor}\n` +
    `*Estado:* ${currentStatus}\n` +
    `*Observación:* ${feedback || 'Revisión solicitada'}\n` +
    (canvaLink ? `*Canva:* ${canvaLink}\n` : '') +
    `_Enviado a: ${getNotificationEmail()}_`;
};

// Enviar notificación a webhook automático (Make, Zapier, Formspree si está configurado)
export const sendWebhookNotification = async (post, feedback, estado, autor = 'Alejandra Gómez') => {
  const webhookUrl = getNotificationWebhook();
  if (!webhookUrl) return { success: false, reason: 'no_webhook' };

  try {
    const payload = {
      destinatario: getNotificationEmail(),
      autor,
      pieza: post.pieza || post.hook || post.id,
      semana: post.semana,
      estado: estado || post.estadoAprobacion,
      feedback,
      fechaEntrega: post.fechaEntrega,
      fechaPublicacion: post.fecha,
      canvaLink: post.editableLink,
      notionLink: post.linkReferente,
      timestamp: new Date().toISOString()
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return { success: res.ok };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

import React, { useState } from 'react';
import { X, Mail, MessageSquare, Check, ExternalLink, Settings, Send } from 'lucide-react';
import {
  getNotificationEmail,
  setNotificationEmail,
  getNotificationWebhook,
  setNotificationWebhook,
  formatEmailPayload,
  formatWhatsAppText,
  openMailClient,
  sendWebhookNotification
} from '../services/notificationService.js';

export default function NotificationModal({ post, feedback, estado, isOpen, onClose, onShowToast }) {
  const [recipient, setRecipient] = useState(getNotificationEmail());
  const [webhook, setWebhook] = useState(getNotificationWebhook());
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);
  const [sendingWebhook, setSendingWebhook] = useState(false);

  if (!isOpen || !post) return null;

  const currentStatus = estado || post.estadoAprobacion || 'En corrección';
  const { subject, body } = formatEmailPayload(post, feedback, currentStatus);

  const handleSaveConfig = () => {
    setNotificationEmail(recipient);
    setNotificationWebhook(webhook);
    setIsEditingConfig(false);
    if (onShowToast) onShowToast('Configuración de notificaciones guardada');
  };

  const handleOpenEmail = () => {
    openMailClient(post, feedback, currentStatus);
    if (onShowToast) onShowToast(`Abriendo cliente de correo para ${recipient}`);
  };

  const handleCopyWhatsApp = () => {
    const text = formatWhatsAppText(post, feedback, currentStatus);
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
    if (onShowToast) onShowToast('Resumen copiado para WhatsApp');
  };

  const handleSendWebhook = async () => {
    if (!webhook) {
      setIsEditingConfig(true);
      return;
    }
    setSendingWebhook(true);
    const result = await sendWebhookNotification(post, feedback, currentStatus);
    setSendingWebhook(false);
    if (result.success) {
      if (onShowToast) onShowToast('Notificación enviada vía Webhook exitosamente');
      onClose();
    } else {
      if (onShowToast) onShowToast('Error al enviar Webhook. Revisa la URL.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111114] border border-white/10 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#151518]">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-zinc-400" />
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Notificar Feedback al Equipo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Recipient info & toggle config */}
          <div className="p-3 rounded border border-white/[0.08] bg-[#16161a] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">Destinatario configurado</span>
              <span className="text-xs font-mono font-medium text-white">{recipient}</span>
            </div>
            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="p-1.5 rounded hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
              title="Configurar destinatario y webhook"
            >
              <Settings size={13} />
            </button>
          </div>

          {/* Configuration Form (Collapsible) */}
          {isEditingConfig && (
            <div className="p-3.5 rounded border border-white/[0.08] bg-black/40 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 block">Correo electrónico de destino</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                  placeholder="socialmedia@bitaxus.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 block">Webhook automático (Make / Zapier / Formspree) - Opcional</label>
                <input
                  type="url"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                  placeholder="https://hook.make.com/..."
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          )}

          {/* Details of the notification */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">Detalle de la pieza</span>
            <div className="p-3 rounded border border-white/[0.06] bg-[#0c0c0e] space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Pieza:</span>
                <span className="font-medium text-white">{post.pieza || post.hook || `Post ${post.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Semana:</span>
                <span>{post.semana || 'Semana 01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estado:</span>
                <span className="text-zinc-200 font-medium">{currentStatus}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.04]">
                <span className="text-zinc-500 block mb-1">Observación a notificar:</span>
                <p className="p-2 rounded bg-black/40 border border-white/[0.04] text-zinc-200 font-sans italic text-[11px]">
                  "{feedback || 'Revisión y ajustes solicitados.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenEmail}
              className="w-full py-2 px-3 rounded bg-white text-black font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={13} />
              <span>Abrir en correo (Gmail / Outlook)</span>
              <ExternalLink size={11} className="opacity-60" />
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="w-full py-2 px-3 rounded border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2"
            >
              {copiedWA ? <Check size={13} className="text-emerald-400" /> : <MessageSquare size={13} />}
              <span>{copiedWA ? 'Copiado al portapapeles' : 'Copiar formato para WhatsApp / Slack'}</span>
            </button>

            {webhook && (
              <button
                onClick={handleSendWebhook}
                disabled={sendingWebhook}
                className="w-full py-2 px-3 rounded border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2 text-[11px]"
              >
                <Send size={12} />
                <span>{sendingWebhook ? 'Enviando...' : 'Disparar envío por Webhook'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#151518] flex items-center justify-between text-[11px] text-zinc-500">
          <span>Bitaxus Content Management</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

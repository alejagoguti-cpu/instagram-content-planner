import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Film, Copy, Check, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ReferentePreviewModal({ post, onClose, onUpdateEstado }) {
  const [activeTab, setActiveTab] = useState('copy'); // 'copy' | 'caption' | 'board' | 'feedback'
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedSlide, setCopiedSlide] = useState(null);
  const [feedbackText, setFeedbackText] = useState(post?.notasFeedback || '');
  const [currentStatus, setCurrentStatus] = useState(post?.estadoAprobacion || 'Aprobado');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (post) {
      setFeedbackText(post.notasFeedback || '');
      setCurrentStatus(post.estadoAprobacion || 'Aprobado');
    }
  }, [post]);

  if (!post) return null;

  const handleStatusChange = (status) => {
    setCurrentStatus(status);
    if (onUpdateEstado) {
      onUpdateEstado(post.id, status, feedbackText);
    }
  };

  const handleSaveFeedback = () => {
    if (onUpdateEstado) {
      onUpdateEstado(post.id, currentStatus, feedbackText);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  const fullCopy = post.copyAprobado || post.guionCopy || post.hook || "Sin copy registrado.";
  const fullCaption = post.caption || "Sin caption registrado.";

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopySection = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedSlide(idx);
    setTimeout(() => setCopiedSlide(null), 2000);
  };

  // Separar el copy por láminas / secciones de manera limpia y robusta
  const parseSections = (text) => {
    if (!text) return [];
    const regex = /(?:^|\n)\*\*([^\*\n]+)\*\*\s*\n?/g;
    let matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        title: match[1].trim(),
        index: match.index,
        headerLength: match[0].length
      });
    }

    if (matches.length === 0) {
      return [{ title: "Copy Completo de la Pieza", content: text.trim() }];
    }

    const result = [];
    if (matches[0].index > 0) {
      const preContent = text.slice(0, matches[0].index).trim();
      if (preContent) {
        result.push({ title: "Introducción", content: preContent });
      }
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const startIndex = current.index + current.headerLength;
      const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
      const content = text.slice(startIndex, endIndex).trim();
      
      // Si el título es solo un número, por ejemplo "4", formatearlo a "Lámina 4"
      let displayTitle = current.title;
      if (/^\d+$/.test(displayTitle)) {
        displayTitle = `Lámina ${displayTitle}`;
      }

      result.push({
        title: displayTitle,
        content: content || displayTitle
      });
    }

    return result;
  };

  const sections = parseSections(fullCopy);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111113] border border-[#2e2e33] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#232327] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c1121f] text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
                {post.pieza || "Pieza de Contenido"}
              </h3>
              <p className="text-xs text-[#8b8b94]">
                {post.semana} · {post.dia} ({post.turno}) · {post.producto}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b8b94] hover:text-white hover:bg-[#202024] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas: Copy de Láminas vs Caption de Publicación vs Board Visual */}
        <div className="flex items-center bg-[#18181b]/80 border-b border-[#232327] px-6">
          <button
            onClick={() => setActiveTab('copy')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'copy'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <FileText size={14} className={activeTab === 'copy' ? 'text-[#ff4d57]' : ''} />
            <span>Copy de Láminas</span>
          </button>

          <button
            onClick={() => setActiveTab('caption')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'caption'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'caption' ? 'text-[#ff4d57]' : ''} />
            <span>Caption de Publicación</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'board'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <ImageIcon size={14} className={activeTab === 'board' ? 'text-[#ff4d57]' : ''} />
            <span>Board Visual Aprobado</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'feedback'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <span>💬 Notas de Feedback</span>
            {feedbackText && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: COPY DE LA PIEZA NUEVA */}
          {activeTab === 'copy' && (
            <div className="space-y-4">
              
              {/* Barra de acción rápida para copiar todo */}
              <div className="flex items-center justify-between p-3.5 bg-black rounded-xl border border-[#2e2e33]">
                <div>
                  <span className="text-xs font-bold text-white block">Texto completo para producción</span>
                  <span className="text-[11px] text-[#8b8b94]">Copia el texto por lámina o todo el contenido con un solo clic</span>
                </div>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                >
                  {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedAll ? '¡Copiado!' : 'Copiar Todo el Copy'}</span>
                </button>
              </div>

              {/* Hook Principal destacado */}
              {post.hook && (
                <div className="p-4 rounded-xl bg-[#18181b] border border-amber-500/30 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    Hook Inicial (Primeros 3 segundos)
                  </span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    "{post.hook}"
                  </p>
                </div>
              )}

              {/* Desglose por Lámina */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff4d57] block">
                  Estructura y Texto por Lámina:
                </span>
                
                {sections.map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#18181b] border border-[#2e2e33] space-y-2 hover:border-[#c1121f]/50 transition-colors">
                    <div className="flex items-center justify-between border-b border-[#232327] pb-2">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                        {sec.title}
                      </span>
                      <button
                        onClick={() => handleCopySection(`${sec.title}\n${sec.content}`, idx)}
                        className="p-1.5 rounded-lg bg-[#111113] hover:bg-[#202024] text-[#8b8b94] hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors border border-[#2e2e33]"
                        title="Copiar texto de esta lámina"
                      >
                        {copiedSlide === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedSlide === idx ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                      {sec.content || sec.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Storytelling y estrategia */}
              {post.storytelling && (
                <div className="p-4 rounded-xl bg-[#18181b] border border-sky-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-sky-400">Enfoque de Storytelling</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {post.storytelling}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: CAPTION DE PUBLICACIÓN PARA INSTAGRAM */}
          {activeTab === 'caption' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-black rounded-xl border border-[#2e2e33]">
                <div>
                  <span className="text-xs font-bold text-white block">Texto del Post de Instagram</span>
                  <span className="text-[11px] text-[#8b8b94]">Listo para pegar en Instagram con gancho, llamado a la acción y hashtags</span>
                </div>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                >
                  {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCaption ? '¡Copiado!' : 'Copiar Caption'}</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#18181b] border border-[#2e2e33] space-y-3">
                <div className="flex items-center justify-between border-b border-[#232327] pb-2">
                  <span className="text-xs font-black text-[#ff4d57] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Copy Descriptivo Aprobado
                  </span>
                  <span className="text-[10px] text-[#8b8b94] font-mono">
                    {post.pilar || post.producto}
                  </span>
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-[#111113] p-4 rounded-lg border border-[#232327]">
                  {fullCaption}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOARD VISUAL APROBADO */}
          {activeTab === 'board' && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-black border border-[#232327] flex items-center justify-center relative">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt="Board Aprobado"
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                ) : (
                  <div className="text-center p-8 text-[#8b8b94]">
                    <ImageIcon size={40} className="mx-auto mb-2 text-[#8b8b94]" />
                    <p className="text-xs">No hay imagen de board disponible.</p>
                  </div>
                )}
              </div>

              {post.linkReferente && (
                <div className="p-3 bg-black rounded-xl border border-[#2e2e33] flex items-center justify-between gap-3">
                  <span className="text-xs text-[#8b8b94] truncate">
                    Enlace de Referente / Editable: <span className="text-white font-mono">{post.linkReferente}</span>
                  </span>
                  <a
                    href={post.linkReferente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <span>Abrir Enlace</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTAS DE FEEDBACK Y CORRECCIONES */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#2e2e33] space-y-3">
                <div className="flex items-center justify-between border-b border-[#232327] pb-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>💬 Notas de Revisión y Feedback</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentStatus === 'Aprobado' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      currentStatus === 'En corrección' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {currentStatus}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#8b8b94]">
                    Registra observaciones de Social Media u OnTarget
                  </span>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Escribe las correcciones solicitadas (ej. 'Reducir tamaño del logo', 'Cambiar gancho', 'Ajustar copy de lámina 2', 'Aprobado con cambio mínimo')..."
                  className="w-full h-36 bg-[#111113] border border-[#2e2e33] rounded-xl p-3.5 text-xs text-white placeholder-[#8b8b94]/60 focus:outline-none focus:border-[#c1121f] transition-all resize-none leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8b8b94]">
                    Los cambios y notas se guardan localmente para el equipo.
                  </span>
                  <button
                    onClick={handleSaveFeedback}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                  >
                    {savedFeedback ? <Check size={14} className="text-white" /> : null}
                    <span>{savedFeedback ? '¡Guardado!' : 'Guardar Feedback'}</span>
                  </button>
                </div>
              </div>

              {/* Guía rápida de criterios de revisión acordados en la reunión */}
              <div className="p-3.5 rounded-xl bg-[#111113] border border-[#232327] space-y-1.5 text-[11px] text-[#8b8b94]">
                <span className="font-bold text-white block">Criterios de Aprobación acordados (20 Oct):</span>
                <ul className="list-disc list-inside space-y-1 text-[#8b8b94]">
                  <li><strong className="text-slate-300">Estilo visual fresco y dinámico:</strong> Evitar rigidez corporativa y saturación excesiva del logo.</li>
                  <li><strong className="text-slate-300">Variedad de pilares:</strong> Alternar pagos, IA, WhatsApp, restaurantes y pioneros.</li>
                  <li><strong className="text-slate-300">Redacción natural:</strong> Textos fluidos y claros sin exceso de tecnicismos.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer con Barra de Aprobación y Notas de Feedback */}
        <div className="p-4 border-t border-[#232327] bg-[#141416] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Selector de Estado de Aprobación */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#8b8b94] uppercase tracking-wider shrink-0">Estado:</span>
            <div className="flex rounded-xl overflow-hidden border border-[#2e2e33] p-1 bg-[#111113] gap-1">
              <button
                onClick={() => handleStatusChange('Aprobado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1 ${
                  currentStatus === 'Aprobado'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-[#8b8b94] hover:text-white'
                }`}
              >
                <span>✅ Aprobado</span>
              </button>

              <button
                onClick={() => handleStatusChange('En corrección')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1 ${
                  currentStatus === 'En corrección'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-[#8b8b94] hover:text-white'
                }`}
              >
                <span>⚠️ En corrección</span>
              </button>

              <button
                onClick={() => handleStatusChange('Desaprobado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1 ${
                  currentStatus === 'Desaprobado'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-[#8b8b94] hover:text-white'
                }`}
              >
                <span>❌ Desaprobado</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#202024] hover:bg-[#2e2e33] text-white text-xs font-bold transition-colors uppercase tracking-wide border border-[#2e2e33]"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

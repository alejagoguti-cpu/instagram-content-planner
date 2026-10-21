import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Play, Film, Copy, Check, FileText, 
  Image as ImageIcon, Sparkles, MessageSquare, CheckCircle2, 
  AlertTriangle, XCircle, Info, Calendar, User
} from 'lucide-react';

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

  // Separar el copy por láminas / secciones limpiamente
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-[#0f1018] border border-white/[0.1] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header Superior del Modal */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#141522]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#c1121f] to-rose-600 text-white shadow-lg shadow-[#c1121f]/20">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-sans">
                  {post.pieza || "Pieza de Contenido"}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  currentStatus === 'Aprobado' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                  currentStatus === 'En corrección' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                  'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}>
                  {currentStatus}
                </span>
              </div>
              <p className="text-xs text-[#8b8b94] font-medium flex items-center gap-2 mt-0.5">
                <span>{post.semana}</span>
                <span>·</span>
                <span>{post.dia} ({post.turno?.includes('1') ? '☀️ T1' : '🌙 T2'})</span>
                <span>·</span>
                <span className="text-slate-300">{post.pilar || post.producto}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8b8b94] hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="flex items-center bg-[#11121a] border-b border-white/[0.08] px-4 sm:px-6 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('copy')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'copy'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <FileText size={14} className={activeTab === 'copy' ? 'text-[#ff4d57]' : ''} />
            <span>Copy de Láminas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">{sections.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('caption')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'caption'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'caption' ? 'text-[#ff4d57]' : ''} />
            <span>Caption de Instagram</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'board'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <ImageIcon size={14} className={activeTab === 'board' ? 'text-[#ff4d57]' : ''} />
            <span>Board Visual</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'feedback'
                ? 'border-[#c1121f] text-white'
                : 'border-transparent text-[#8b8b94] hover:text-white'
            }`}
          >
            <MessageSquare size={14} className={activeTab === 'feedback' ? 'text-[#ff4d57]' : ''} />
            <span>Revisión y Feedback</span>
            {feedbackText && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
          </button>

        </div>

        {/* Cuerpo del Modal con Contenido por Pestaña */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* =========================================================================
              TAB 1: COPY DE LÁMINAS
              ========================================================================= */}
          {activeTab === 'copy' && (
            <div className="space-y-4">
              
              {/* Barra de acción rápida para copiar todo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-black/50 rounded-2xl border border-white/[0.08]">
                <div>
                  <span className="text-xs font-bold text-white block">Texto completo para diseño y producción</span>
                  <span className="text-[11px] text-[#8b8b94]">Copia lámina por lámina o todo el contenido con un clic</span>
                </div>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] hover:from-[#d61a28] hover:to-[#ef233c] text-white text-xs font-bold shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                >
                  {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedAll ? '¡Copiado!' : 'Copiar Todo el Copy'}</span>
                </button>
              </div>

              {/* Hook Principal destacado */}
              {post.hook && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Hook Inicial (3 primeros segundos):
                  </span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    "{post.hook}"
                  </p>
                </div>
              )}

              {/* Desglose de Láminas */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#ff4d57] block">
                  Desglose por Lámina:
                </span>
                
                {sections.map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#141520] border border-white/[0.08] space-y-2 hover:border-[#c1121f]/50 transition-colors">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57]"></span>
                        {sec.title}
                      </span>
                      <button
                        onClick={() => handleCopySection(`${sec.title}\n${sec.content}`, idx)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#8b8b94] hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors border border-white/10"
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
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-sky-400">Enfoque de Storytelling</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {post.storytelling}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* =========================================================================
              TAB 2: CAPTION DE PUBLICACIÓN PARA INSTAGRAM
              ========================================================================= */}
          {activeTab === 'caption' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-black/50 rounded-2xl border border-white/[0.08]">
                <div>
                  <span className="text-xs font-bold text-white block">Texto del Post de Instagram</span>
                  <span className="text-[11px] text-[#8b8b94]">Listo con gancho, llamado a la acción y hashtags optimizados</span>
                </div>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] hover:from-[#d61a28] hover:to-[#ef233c] text-white text-xs font-bold shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                >
                  {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCaption ? '¡Copiado!' : 'Copiar Caption'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#141520] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-xs font-black text-[#ff4d57] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Copy Descriptivo Aprobado
                  </span>
                  <span className="text-[10px] text-[#8b8b94] font-mono">
                    {post.pilar || post.producto}
                  </span>
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-[#0c0d14] p-4 rounded-xl border border-white/[0.06]">
                  {fullCaption}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: BOARD VISUAL
              ========================================================================= */}
          {activeTab === 'board' && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black border border-white/[0.08] flex items-center justify-center relative shadow-inner">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt="Board Aprobado"
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                ) : (
                  <div className="text-center p-12 text-[#8b8b94]">
                    <ImageIcon size={40} className="mx-auto mb-2 text-[#8b8b94]/60" />
                    <p className="text-xs">No hay imagen de board disponible.</p>
                  </div>
                )}
              </div>

              {post.linkReferente && (
                <div className="p-3.5 bg-[#141520] rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#8b8b94] truncate">
                    Enlace de Referente / Notion: <span className="text-white font-mono">{post.linkReferente}</span>
                  </span>
                  <a
                    href={post.linkReferente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] hover:from-[#d61a28] hover:to-[#ef233c] text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                  >
                    <span>Abrir Enlace</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 4: NOTAS DE FEEDBACK Y CORRECCIONES
              ========================================================================= */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#141520] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#ff4d57]" />
                    <span>Notas de Revisión y Feedback</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentStatus === 'Aprobado' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      currentStatus === 'En corrección' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/15 text-rose-300 border border-rose-500/30'
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
                  className="w-full h-36 bg-[#0c0d14] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-[#8b8b94]/60 focus:outline-none focus:border-[#c1121f] transition-all resize-none leading-relaxed font-sans"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#8b8b94]">
                    Los cambios y notas se guardan en el navegador para todo el equipo.
                  </span>
                  <button
                    onClick={handleSaveFeedback}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] hover:from-[#d61a28] hover:to-[#ef233c] text-white text-xs font-bold shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                  >
                    {savedFeedback ? <Check size={14} className="text-white" /> : null}
                    <span>{savedFeedback ? '¡Guardado con éxito!' : 'Guardar Feedback'}</span>
                  </button>
                </div>
              </div>

              {/* Recordatorio de Criterios Acordados en la Reunión */}
              <div className="p-4 rounded-2xl bg-[#0c0d14] border border-white/[0.06] space-y-2 text-[11px] text-[#8b8b94]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Info size={13} className="text-amber-400" />
                  Criterios de Aprobación acordados (Reunión 20 Oct):
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong className="text-white">Estilo visual fresco y dinámico:</strong> Evitar rigidez corporativa y no saturar repitiendo el logo de Vitaxus en todas las láminas.</li>
                  <li><strong className="text-white">Variedad de pilares:</strong> Alternar pagos, IA, WhatsApp, restaurantes y pioneros para no concentrar el mismo tema.</li>
                  <li><strong className="text-white">Redacción natural:</strong> Textos fluidos y claros sin exceso de tecnicismos.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer con Barra de Aprobación Interactiva */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#141522] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Selector de Estado de Aprobación */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-black text-[#8b8b94] uppercase tracking-wider shrink-0">Estado:</span>
            <div className="flex rounded-2xl overflow-hidden border border-white/10 p-1 bg-[#0a0b10] gap-1 w-full sm:w-auto justify-between sm:justify-start">
              
              <button
                onClick={() => handleStatusChange('Aprobado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                  currentStatus === 'Aprobado'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-[#8b8b94] hover:text-white'
                }`}
              >
                <span>✅ Aprobado</span>
              </button>

              <button
                onClick={() => handleStatusChange('En corrección')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                  currentStatus === 'En corrección'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-[#8b8b94] hover:text-white'
                }`}
              >
                <span>⚠️ En corrección</span>
              </button>

              <button
                onClick={() => handleStatusChange('Desaprobado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                  currentStatus === 'Desaprobado'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
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
              className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors uppercase tracking-wide border border-white/10 w-full sm:w-auto"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

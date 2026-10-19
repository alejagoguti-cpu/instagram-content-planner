import React, { useState } from 'react';
import { X, ExternalLink, Play, Film, Copy, Check, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ReferentePreviewModal({ post, onClose }) {
  const [activeTab, setActiveTab] = useState('copy'); // 'copy' | 'board'
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSlide, setCopiedSlide] = useState(null);

  if (!post) return null;

  const fullCopy = post.copyAprobado || post.guionCopy || post.hook || "Sin copy registrado.";

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySection = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedSlide(idx);
    setTimeout(() => setCopiedSlide(null), 2000);
  };

  // Separar el copy por láminas / secciones si contiene markdown **
  const parseSections = (text) => {
    if (!text) return [];
    const parts = text.split(/(?=\*\*[0-9A-Za-zÁ-ÿ\s\.\—\-]+\*\*)/g).filter(Boolean);
    if (parts.length <= 1) {
      return [{ title: "Copy Completo de la Pieza", content: text }];
    }
    return parts.map((part, i) => {
      const match = part.match(/\*\*([^*]+)\*\*/);
      const title = match ? match[1] : `Lámina ${i + 1}`;
      const content = part.replace(/\*\*([^*]+)\*\*/, '').trim();
      return { title, content };
    });
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

        {/* Pestañas: Copy de la Pieza vs Board Visual */}
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
            <span>Copy de la Pieza Nueva</span>
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

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232327] bg-[#18181b] flex items-center justify-between">
          <span className="text-[11px] text-[#8b8b94]">
            {post.estado}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#202024] hover:bg-[#2e2e33] text-white text-xs font-bold transition-colors uppercase tracking-wide"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

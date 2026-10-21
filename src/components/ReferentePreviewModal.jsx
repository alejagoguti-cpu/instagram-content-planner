import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check, FileText, Palette, MessageSquare } from 'lucide-react';

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
      return [{ title: "Guion de la pieza", content: text.trim() }];
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#111114] border border-white/10 rounded-lg max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#151518]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">{post.semana}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-zinc-400 font-medium">{post.pilar || post.producto}</span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-white/10 text-zinc-300">
                {currentStatus}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {post.pieza || "Detalle de Publicación"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab Selector (Zero Emojis) */}
        <div className="flex items-center border-b border-white/[0.08] bg-[#111114] px-4 text-xs">
          <button
            onClick={() => setActiveTab('copy')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'copy' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Guion ({sections.length} láminas)
          </button>
          <button
            onClick={() => setActiveTab('caption')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'caption' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Caption Instagram
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'board' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Diseño & Board
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'feedback' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Notas de Feedback
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {activeTab === 'copy' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded border border-white/[0.06] bg-black/40">
                <span className="text-xs text-zinc-400">Texto para producción visual</span>
                <button
                  onClick={handleCopyAll}
                  className="px-2.5 py-1 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1"
                >
                  {copiedAll ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedAll ? 'Copiado' : 'Copiar todo'}</span>
                </button>
              </div>

              {post.hook && (
                <div className="p-3 rounded border border-white/10 bg-white/[0.02] space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">Hook inicial</span>
                  <p className="text-xs font-medium text-white">{post.hook}</p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {sections.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded border border-white/[0.06] bg-black/20 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                      <span className="text-xs font-semibold text-zinc-300">{sec.title}</span>
                      <button
                        onClick={() => handleCopySection(`${sec.title}\n${sec.content}`, idx)}
                        className="text-[10px] text-zinc-400 hover:text-white"
                      >
                        {copiedSlide === idx ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                      {sec.content || sec.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'caption' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded border border-white/[0.06] bg-black/40">
                <span className="text-xs text-zinc-400">Texto listo para publicación</span>
                <button
                  onClick={handleCopyCaption}
                  className="px-2.5 py-1 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1"
                >
                  {copiedCaption ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCaption ? 'Copiado' : 'Copiar caption'}</span>
                </button>
              </div>

              <div className="p-4 rounded border border-white/[0.06] bg-black/20 text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
                {fullCaption}
              </div>
            </div>
          )}

          {activeTab === 'board' && (
            <div className="space-y-3">
              <div className="aspect-[16/10] rounded bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-zinc-600">Sin imagen</span>
                )}
              </div>

              <div className="p-3 rounded border border-white/[0.06] bg-black/40 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Referente en Notion</span>
                <a
                  href={post.linkReferente}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Abrir ficha</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-3">
              <div className="p-3 rounded border border-white/[0.06] bg-black/40 space-y-2">
                <span className="text-xs font-medium text-white block">Observaciones y solicitudes de cambio</span>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Escribe comentarios de revisión..."
                  className="w-full bg-[#09090b] border border-white/10 rounded p-3 text-xs text-zinc-200 focus:outline-none focus:border-white/30 resize-none"
                />
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveFeedback}
                    className="px-3 py-1.5 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                  >
                    {savedFeedback ? 'Guardado' : 'Guardar nota'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer with Status Selectors */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#151518] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500 font-medium">Estado:</span>
            {['Aprobado', 'En corrección', 'Desaprobado'].map(st => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                  currentStatus === st
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded border border-white/10 text-xs text-zinc-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

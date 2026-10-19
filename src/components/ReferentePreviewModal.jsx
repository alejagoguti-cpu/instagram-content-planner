import React from 'react';
import { X, ExternalLink, Play, Film, Sparkles, Copy, Check } from 'lucide-react';

export default function ReferentePreviewModal({ post, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!post) return null;

  const handleCopy = () => {
    if (post.linkReferente) {
      navigator.clipboard.writeText(post.linkReferente);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isInstagram = post.linkReferente?.includes('instagram.com');
  const isTikTok = post.linkReferente?.includes('tiktok.com');
  const isYouTube = post.linkReferente?.includes('youtube.com') || post.linkReferente?.includes('youtu.be');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <Film size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Referente Inspiracional
              </h3>
              <p className="text-xs text-slate-400">
                {post.pieza || post.hook}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Link box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Play size={16} className="text-rose-500 shrink-0" />
              <span className="text-xs text-slate-300 font-mono truncate">
                {post.linkReferente || "No se ha configurado link de referente"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              {post.linkReferente && (
                <a
                  href={post.linkReferente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                >
                  <span>Abrir enlace</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Preview player / frame if embeddable */}
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center relative">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt="Referente"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <Play size={40} className="mx-auto mb-2 text-rose-500/60" />
                <p className="text-xs text-slate-400">
                  Haz clic en "Abrir enlace" para ver el video completo en {isInstagram ? 'Instagram' : isTikTok ? 'TikTok' : isYouTube ? 'YouTube' : 'su plataforma original'}.
                </p>
              </div>
            )}
            {post.linkReferente && (
              <a
                href={post.linkReferente}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/20 transition-all flex items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600/90 group-hover:bg-rose-500 group-hover:scale-110 text-white flex items-center justify-center shadow-xl transition-all">
                  <Play size={24} className="ml-1" />
                </div>
              </a>
            )}
          </div>

          {/* Desglose de contenido para grabación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400">Hook inicial</span>
              <p className="text-xs font-semibold text-slate-100">
                {post.hook || "Sin gancho registrado"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-400">Notas sobre el Referente</span>
              <p className="text-xs text-slate-300">
                {post.notasReferentes || "No hay notas adicionales del referente."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold uppercase text-sky-400">Storytelling / Enfoque</span>
              <p className="text-xs text-slate-300">
                {post.storytelling || "Sin especificación de storytelling."}
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

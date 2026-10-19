import React from 'react';
import { X, ExternalLink, Play, Film, Copy, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111113] border border-[#2e2e33] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#232327] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#c1121f]/20 text-[#ff4d57]">
              <Film size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide font-sans">
                Referente Inspiracional
              </h3>
              <p className="text-xs text-[#8b8b94]">
                {post.pieza || post.hook}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Link box */}
          <div className="p-3 bg-black rounded-xl border border-[#2e2e33] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Play size={16} className="text-[#c1121f] shrink-0" />
              <span className="text-xs text-slate-300 font-mono truncate">
                {post.linkReferente || "No se ha configurado link de referente"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              {post.linkReferente && (
                <a
                  href={post.linkReferente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                >
                  <span>Abrir enlace</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Preview player */}
          <div className="rounded-xl overflow-hidden bg-black border border-[#232327] aspect-video flex items-center justify-center relative">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt="Referente"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-[#8b8b94]">
                <Play size={40} className="mx-auto mb-2 text-[#c1121f]" />
                <p className="text-xs text-[#8b8b94]">
                  Haz clic en "Abrir enlace" para ver el video completo en {isInstagram ? 'Instagram' : isTikTok ? 'TikTok' : isYouTube ? 'YouTube' : 'su plataforma original'}.
                </p>
              </div>
            )}
            {post.linkReferente && (
              <a
                href={post.linkReferente}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-all flex items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-full bg-[#c1121f] group-hover:bg-[#d61a28] group-hover:scale-110 text-white flex items-center justify-center shadow-xl shadow-[#c1121f]/30 transition-all">
                  <Play size={24} className="ml-1" />
                </div>
              </a>
            )}
          </div>

          {/* Desglose de contenido para grabación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#2e2e33] space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400">Hook inicial</span>
              <p className="text-xs font-bold text-white">
                {post.hook || "Sin gancho registrado"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181b] border border-[#2e2e33] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#ff4d57]">Notas sobre el Referente</span>
              <p className="text-xs text-slate-300">
                {post.notasReferentes || "No hay notas adicionales del referente."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181b] border border-[#2e2e33] space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold uppercase text-sky-400">Storytelling / Enfoque</span>
              <p className="text-xs text-slate-300">
                {post.storytelling || "Sin especificación de storytelling."}
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232327] bg-[#18181b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#202024] hover:bg-[#2e2e33] text-white text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

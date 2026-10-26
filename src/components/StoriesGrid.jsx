import React from 'react';
import canvaViews from '../data/canvaViews.json';

// Convierte un link de Canva (…/design/ID/TOKEN/edit|view) en su versión incrustable
const embedFromLink = (link) => {
  const m =
    typeof link === 'string' &&
    link.match(/^(https:\/\/(?:www\.)?canva\.com\/design\/[^/]+\/[^/?#]+)\/(?:view|edit)/);
  return m ? m[1] + '/view?embed' : null;
};

// Vista de Historias: una tarjeta vertical (9:16) por post, con el diseño de Canva de su historia
export default function StoriesGrid({ posts, onUpdatePostData }) {
  const pegarLink = (post) => {
    const nuevo = window.prompt(
      'Pega el link de Canva de la historia de este post (se guarda en Notion y se muestra aquí):',
      post.historiaLink || ''
    );
    if (!nuevo) return;
    if (!/^https:\/\/(www\.)?canva\.(com|link)\//.test(nuevo.trim())) {
      window.alert('Pega un link de Canva (canva.com o canva.link).');
      return;
    }
    onUpdatePostData(post.id, { historiaLink: nuevo.trim() });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Historias</span>
        <span className="text-xs text-zinc-500 font-mono">{posts.length} publicaciones</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((post) => {
          // Un link de Canva pegado completo se ve al instante; uno corto, cuando el despliegue lo resuelve
          const embed = embedFromLink(post.historiaLink) || embedFromLink(canvaViews[`${post.id}#h`]);
          return (
            <div
              key={post.id}
              className="bg-[#121215] rounded-md border border-white/[0.08] overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[9/16] bg-[#0c0c0e]">
                {embed ? (
                  <iframe
                    src={embed}
                    title={`Historia · ${post.pieza}`}
                    loading="lazy"
                    allowFullScreen
                    className="w-full h-full border-0 bg-white"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3 text-center">
                    <span className="text-zinc-600 text-xs font-mono">
                      {post.historiaLink ? 'Se mostrará en unos minutos' : 'Sin historia'}
                    </span>
                    <button
                      type="button"
                      onClick={() => pegarLink(post)}
                      className="px-2.5 py-1 rounded bg-white text-black text-[11px] font-medium"
                    >
                      + Link de la historia
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2.5 space-y-1.5">
                <h4 className="text-[11px] font-medium text-white leading-snug line-clamp-2">
                  {post.hook || post.pieza}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>
                    {post.dia || ''} {post.turno ? `· ${post.turno}` : ''}
                  </span>
                  <span>{post.fecha || ''}</span>
                </div>
                {post.historiaLink && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <a
                      href={post.historiaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-1 rounded border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-medium transition-colors"
                    >
                      Abrir en Canva
                    </a>
                    <button
                      type="button"
                      onClick={() => pegarLink(post)}
                      className="py-1 px-2 rounded border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-medium transition-colors"
                      title="Cambiar el link de la historia"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

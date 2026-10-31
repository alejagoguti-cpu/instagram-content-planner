import React, { useState } from 'react';
import SlideCarousel from './SlideCarousel.jsx';

// Vista previa de la card: la inspo (referente) va primero y el diseño de Canva en vivo, después
export default function CardPreview({ post, embedUrl }) {
  const [tab, setTab] = useState('inspo');

  const inspo = post.coverImage ? (
    <img
      src={post.coverImage}
      alt={post.pieza}
      className={`w-full h-full ${embedUrl ? 'object-contain' : 'object-cover group-hover:scale-102'} transition-transform duration-200`}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
      Sin board
    </div>
  );

  const hasSlides = post.slides?.length > 0;

  // Sin diseño todavía: solo la inspo
  if (!embedUrl && !hasSlides) return inspo;
  // Diseño sin inspo: directo al carrusel
  if (!post.coverImage) {
    return hasSlides ? <SlideCarousel slides={post.slides} alt={post.pieza} /> : null;
  }

  // Las láminas exportadas de Canva se ven siempre; el iframe solo si el diseño es público
  const diseno = hasSlides ? (
    <SlideCarousel slides={post.slides} alt={post.pieza} />
  ) : (
    <iframe
      src={embedUrl}
      title={post.pieza}
      loading="lazy"
      allowFullScreen
      className="w-full h-full border-0 bg-white"
    />
  );

  return (
    <>
      {tab === 'inspo' ? inspo : diseno}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex rounded-full overflow-hidden border border-white/20 bg-black/70 backdrop-blur-sm text-[10px] font-medium">
        {[
          ['inspo', 'Inspo'],
          ['diseno', 'Diseño'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1 transition-colors ${tab === key ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

import React from 'react';
import { ExternalLink, Play, Image as ImageIcon, Plus, Eye } from 'lucide-react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TURNOS = [
  { key: '☀️ Publicación 1 (Mañana)', label: 'Publicación 1 (Mañana)', icon: '☀️' },
  { key: '🌙 Publicación 2 (Tarde)', label: 'Publicación 2 (Tarde)', icon: '🌙' }
];

export default function FeedMatrixView({
  posts,
  selectedSemana,
  onEditPost,
  onNewPostWithDefaults,
  onPreviewReferente
}) {
  const filteredPosts = selectedSemana === 'todas'
    ? posts
    : posts.filter(p => p.semana === selectedSemana);

  const activeSemanas = selectedSemana === 'todas'
    ? Array.from(new Set(posts.map(p => p.semana))).sort()
    : [selectedSemana];

  const getEtapaBadge = (etapa) => {
    switch (etapa?.toLowerCase()) {
      case 'atracción':
      case 'atraccion':
        return 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
      case 'venta':
        return 'bg-[#c1121f]/25 text-[#ff4d57] border border-[#c1121f]/40';
      case 'validación':
      case 'validacion':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      case 'fidelización':
      case 'fidelizacion':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      default:
        return 'bg-[#202024] text-[#8b8b94] border border-[#2e2e33]';
    }
  };

  const getTipoBadge = (tipo) => {
    if (tipo?.toLowerCase().includes('video')) return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    if (tipo?.toLowerCase().includes('carrusel')) return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
    return 'bg-[#18181b] text-[#8b8b94] border border-[#2e2e33]';
  };

  return (
    <div className="space-y-12">
      {activeSemanas.map((semana) => {
        const semanaPosts = filteredPosts.filter(p => p.semana === semana);

        return (
          <div key={semana} className="bg-[#111113] rounded-2xl border border-[#232327] overflow-hidden shadow-2xl">
            
            {/* Header de la semana estilo Bitaxus */}
            <div className="bg-[#18181b] px-6 py-3.5 border-b border-[#232327] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-[#c1121f] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm">
                  Bitaxus Feed
                </span>
                <h2 className="text-sm font-extrabold text-white tracking-wider uppercase font-sans">
                  {semana}
                </h2>
              </div>
              <div className="text-xs text-[#8b8b94] font-medium">
                <span className="text-white font-bold">{semanaPosts.length}</span> piezas planificadas
              </div>
            </div>

            {/* Matriz tipo Excel / Planner */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1300px]">
                <thead>
                  <tr className="bg-[#18181b]/70 text-center border-b border-[#232327]">
                    <th className="w-32 py-3 px-3 text-[11px] font-extrabold text-[#8b8b94] uppercase tracking-wider border-r border-[#232327]">
                      Turno / Día
                    </th>
                    {DIAS.map((dia) => (
                      <th key={dia} className="py-3 px-2 text-xs font-extrabold text-white uppercase tracking-wider border-r border-[#232327] last:border-r-0">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TURNOS.map((turno) => (
                    <tr key={turno.key} className="border-b border-[#232327] hover:bg-[#18181b]/30 transition-colors">
                      
                      {/* Columna lateral: Turno */}
                      <td className="p-3 bg-[#111113] border-r border-[#232327] text-center align-middle">
                        <div className="text-2xl mb-1">{turno.icon}</div>
                        <div className="text-[11px] font-bold text-slate-300 leading-tight">
                          {turno.label}
                        </div>
                      </td>

                      {/* Celdas para cada día */}
                      {DIAS.map((dia) => {
                        const post = semanaPosts.find(p => p.dia === dia && p.turno === turno.key);

                        return (
                          <td
                            key={`${semana}-${turno.key}-${dia}`}
                            className="p-2.5 border-r border-[#232327] last:border-r-0 align-top w-[14.28%]"
                          >
                            {post ? (
                              <div className="group relative bg-[#18181b] hover:bg-[#202024] rounded-xl border border-[#2e2e33] hover:border-[#c1121f] shadow-md hover:shadow-xl hover:shadow-[#c1121f]/10 transition-all duration-200 flex flex-col h-full overflow-hidden">
                                
                                {/* 1. MINIATURA DE LA IMAGEN / POST */}
                                <div className="relative aspect-[4/3] w-full bg-black overflow-hidden border-b border-[#232327]">
                                  {post.coverImage ? (
                                    <img
                                      src={post.coverImage}
                                      alt={post.pieza}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  
                                  {/* Fallback si no hay portada o falla */}
                                  <div
                                    className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#111113] to-black text-[#8b8b94] ${
                                      post.coverImage ? 'hidden' : 'flex'
                                    }`}
                                  >
                                    <ImageIcon size={24} className="text-[#8b8b94] mb-1" />
                                    <span className="text-[10px]">Sin miniatura</span>
                                  </div>

                                  {/* Overlay con botones rápidos al pasar el cursor */}
                                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-sm">
                                    {post.linkReferente && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onPreviewReferente(post);
                                        }}
                                        className="p-2 rounded-lg bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold shadow-lg flex items-center gap-1 transition-all"
                                        title="Ver referente"
                                      >
                                        <Eye size={13} />
                                        <span>Referente</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onEditPost(post)}
                                      className="p-2 rounded-lg bg-[#202024] hover:bg-[#2e2e33] border border-[#2e2e33] text-white text-xs font-semibold shadow-lg transition-all"
                                      title="Editar post"
                                    >
                                      Editar
                                    </button>
                                  </div>

                                  {/* Badge de Estado flotante */}
                                  <div className="absolute top-1.5 left-1.5">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white border border-[#2e2e33] shadow-sm backdrop-blur-sm">
                                      {post.estado || 'Plan'}
                                    </span>
                                  </div>

                                  {/* Icono de Referente si tiene link */}
                                  {post.linkReferente && (
                                    <div className="absolute top-1.5 right-1.5">
                                      <span className="p-1 rounded-md bg-[#c1121f] text-white text-[10px] shadow flex items-center gap-0.5" title="Tiene Link de Referente">
                                        <Play size={10} />
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 2. CONTENIDO FEED (HOOK / TITULO) */}
                                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                                  <div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff4d57] mb-1">
                                      Contenido Feed:
                                    </div>
                                    <h3
                                      onClick={() => onEditPost(post)}
                                      className="text-xs font-bold text-white hover:text-[#ff4d57] cursor-pointer line-clamp-2 leading-snug font-sans"
                                      title={post.hook || post.pieza}
                                    >
                                      {post.hook || post.pieza}
                                    </h3>
                                  </div>

                                  {/* 3. FILAS DE PROPIEDADES (TIPO, ETAPA, PRODUCTO) */}
                                  <div className="space-y-1.5 pt-2 text-[11px] border-t border-[#232327]">
                                    
                                    {/* Tipo y Formato */}
                                    <div className="flex items-center justify-between gap-1 text-[10px]">
                                      <span className="text-[#8b8b94] font-medium">Tipo:</span>
                                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${getTipoBadge(post.tipo)}`}>
                                        {post.tipo || post.formato || 'Carrusel'}
                                      </span>
                                    </div>

                                    {/* Etapa con color exacto */}
                                    <div className="flex items-center justify-between gap-1 text-[10px]">
                                      <span className="text-[#8b8b94] font-medium">Etapa:</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getEtapaBadge(post.etapa)}`}>
                                        {post.etapa || 'Atracción'}
                                      </span>
                                    </div>

                                    {/* Producto */}
                                    {post.producto && (
                                      <div className="flex items-start justify-between gap-1 text-[10px]">
                                        <span className="text-[#8b8b94] font-medium whitespace-nowrap">Producto:</span>
                                        <span className="text-white font-semibold text-right line-clamp-1 text-[10px] bg-black/60 px-1.5 py-0.5 rounded border border-[#2e2e33]">
                                          {post.producto}
                                        </span>
                                      </div>
                                    )}

                                    {/* Botón principal: Ver Copy & Board */}
                                    <div className="pt-2">
                                      <button
                                        onClick={() => onPreviewReferente(post)}
                                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#c1121f] hover:bg-[#d61a28] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#c1121f]/20 transition-all uppercase tracking-wide"
                                      >
                                        <Play size={11} />
                                        <span>Ver Copy & Board</span>
                                      </button>
                                    </div>

                                  </div>

                                </div>

                              </div>
                            ) : (
                              /* Celda vacía para agregar post */
                              <div
                                onClick={() => onNewPostWithDefaults({ dia, turno: turno.key, semana })}
                                className="h-full min-h-[220px] rounded-xl border border-dashed border-[#232327] hover:border-[#c1121f] bg-[#111113]/50 hover:bg-[#18181b] p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#18181b] group-hover:bg-[#c1121f] group-hover:text-white flex items-center justify-center text-[#8b8b94] transition-all mb-2">
                                  <Plus size={16} />
                                </div>
                                <span className="text-xs font-semibold text-[#8b8b94] group-hover:text-white">
                                  + Planificar
                                </span>
                                <span className="text-[10px] text-[#8b8b94]/70">
                                  {dia}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        );
      })}
    </div>
  );
}

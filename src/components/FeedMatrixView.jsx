import React from 'react';
import { ExternalLink, Play, Image as ImageIcon, Plus, Sparkles, Film, Eye } from 'lucide-react';

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
  // Filtrar posts según semana si está seleccionada
  const filteredPosts = selectedSemana === 'todas'
    ? posts
    : posts.filter(p => p.semana === selectedSemana);

  // Obtener semanas únicas
  const activeSemanas = selectedSemana === 'todas'
    ? Array.from(new Set(posts.map(p => p.semana))).sort()
    : [selectedSemana];

  // Helper para color de Etapa
  const getEtapaBadge = (etapa) => {
    switch (etapa?.toLowerCase()) {
      case 'atracción':
      case 'atraccion':
        return 'bg-amber-400 text-slate-950 font-bold';
      case 'venta':
        return 'bg-emerald-500 text-white font-bold';
      case 'validación':
      case 'validacion':
        return 'bg-sky-500 text-white font-bold';
      case 'fidelización':
      case 'fidelizacion':
        return 'bg-purple-500 text-white font-bold';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  // Helper para tipo de contenido
  const getTipoBadge = (tipo) => {
    if (tipo?.toLowerCase().includes('video')) return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    if (tipo?.toLowerCase().includes('carrusel')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  };

  return (
    <div className="space-y-12">
      {activeSemanas.map((semana) => {
        const semanaPosts = filteredPosts.filter(p => p.semana === semana);

        return (
          <div key={semana} className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            
            {/* Barra superior de título de la semana */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold text-sm border border-rose-500/30 uppercase tracking-wider">
                  Instagram Feed
                </span>
                <h2 className="text-base font-bold text-white tracking-wide">
                  {semana.toUpperCase()}
                </h2>
              </div>
              <div className="text-xs text-slate-400">
                {semanaPosts.length} publicaciones planificadas
              </div>
            </div>

            {/* Matriz tipo Excel / Planner */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1250px]">
                <thead>
                  <tr className="bg-slate-800/90 text-center border-b border-slate-700">
                    <th className="w-28 py-3 px-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-r border-slate-700 bg-slate-850">
                      Turno / Día
                    </th>
                    {DIAS.map((dia) => (
                      <th key={dia} className="py-3 px-2 text-xs font-bold text-slate-200 uppercase tracking-wider border-r border-slate-700 last:border-r-0">
                        <div className="font-extrabold text-white text-sm">{dia}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TURNOS.map((turno) => (
                    <tr key={turno.key} className="border-b border-slate-800/80 hover:bg-slate-800/20 transition-colors">
                      
                      {/* Columna lateral: Turno */}
                      <td className="p-3 bg-slate-900/80 border-r border-slate-700/80 text-center align-middle">
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
                            className="p-2.5 border-r border-slate-800/80 last:border-r-0 align-top w-[14.28%]"
                          >
                            {post ? (
                              <div className="group relative bg-slate-800/90 hover:bg-slate-800 rounded-xl border border-slate-700/80 hover:border-rose-500/50 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col h-full overflow-hidden">
                                
                                {/* 1. MINIATURA DE LA IMAGEN / POST */}
                                <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden border-b border-slate-700/60">
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
                                    className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 ${
                                      post.coverImage ? 'hidden' : 'flex'
                                    }`}
                                  >
                                    <ImageIcon size={26} className="text-slate-600 mb-1" />
                                    <span className="text-[10px] text-slate-400">Sin miniatura</span>
                                  </div>

                                  {/* Overlay con botones rápidos al pasar el cursor */}
                                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                    {post.linkReferente && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onPreviewReferente(post);
                                        }}
                                        className="p-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold shadow-lg flex items-center gap-1"
                                        title="Ver referente"
                                      >
                                        <Eye size={13} />
                                        <span>Referente</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onEditPost(post)}
                                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold shadow-lg"
                                      title="Editar post"
                                    >
                                      Editar
                                    </button>
                                  </div>

                                  {/* Badge de Estado flotante */}
                                  <div className="absolute top-1.5 left-1.5">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/90 text-slate-200 border border-slate-700/60 shadow-sm backdrop-blur-sm">
                                      {post.estado || 'Plan'}
                                    </span>
                                  </div>

                                  {/* Icono de Referente si tiene link */}
                                  {post.linkReferente && (
                                    <div className="absolute top-1.5 right-1.5">
                                      <span className="p-1 rounded-md bg-rose-600/90 text-white text-[10px] shadow flex items-center gap-0.5" title="Tiene Link de Referente">
                                        <Play size={10} />
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 2. CONTENIDO FEED (HOOK / TITULO) */}
                                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                                  <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">
                                      Contenido Feed:
                                    </div>
                                    <h3
                                      onClick={() => onEditPost(post)}
                                      className="text-xs font-semibold text-slate-100 hover:text-rose-400 cursor-pointer line-clamp-2 leading-snug"
                                      title={post.hook || post.pieza}
                                    >
                                      {post.hook || post.pieza}
                                    </h3>
                                  </div>

                                  {/* 3. FILAS DE PROPIEDADES (TIPO, ETAPA, PRODUCTO) */}
                                  <div className="space-y-1.5 pt-1 text-[11px] border-t border-slate-700/50">
                                    
                                    {/* Tipo y Formato */}
                                    <div className="flex items-center justify-between gap-1 text-[10px]">
                                      <span className="text-slate-400 font-medium">Tipo:</span>
                                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${getTipoBadge(post.tipo)}`}>
                                        {post.tipo || post.formato || 'Carrusel'}
                                      </span>
                                    </div>

                                    {/* Etapa con color exacto */}
                                    <div className="flex items-center justify-between gap-1 text-[10px]">
                                      <span className="text-slate-400 font-medium">Etapa:</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getEtapaBadge(post.etapa)}`}>
                                        {post.etapa || 'Atracción'}
                                      </span>
                                    </div>

                                    {/* Producto */}
                                    {post.producto && (
                                      <div className="flex items-start justify-between gap-1 text-[10px]">
                                        <span className="text-slate-400 font-medium whitespace-nowrap">Producto:</span>
                                        <span className="text-slate-200 font-semibold text-right line-clamp-1 text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/60">
                                          {post.producto}
                                        </span>
                                      </div>
                                    )}

                                    {/* Referente directo botón */}
                                    {post.linkReferente && (
                                      <div className="pt-1">
                                        <button
                                          onClick={() => onPreviewReferente(post)}
                                          className="w-full py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                                        >
                                          <Play size={10} />
                                          <span className="truncate">Ver Referente</span>
                                          <ExternalLink size={10} />
                                        </button>
                                      </div>
                                    )}

                                  </div>

                                </div>

                              </div>
                            ) : (
                              /* Celda vacía para agregar post */
                              <div
                                onClick={() => onNewPostWithDefaults({ dia, turno: turno.key, semana })}
                                className="h-full min-h-[220px] rounded-xl border border-dashed border-slate-800 hover:border-slate-600 bg-slate-950/30 hover:bg-slate-900/40 p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-rose-500/20 group-hover:text-rose-400 flex items-center justify-center text-slate-500 transition-colors mb-2">
                                  <Plus size={16} />
                                </div>
                                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                                  + Planificar
                                </span>
                                <span className="text-[10px] text-slate-500">
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

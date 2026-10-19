import React from 'react';
import { ExternalLink, Play, Edit, Eye, Image as ImageIcon } from 'lucide-react';

export default function TableView({
  posts,
  onEditPost,
  onPreviewReferente
}) {
  const getEtapaColor = (etapa) => {
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

  const getEstadoColor = (estado) => {
    if (estado?.includes('Publicado')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (estado?.includes('Aprobado')) return 'bg-green-500/20 text-green-300 border border-green-500/30';
    if (estado?.includes('Programado')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Tabla_1 — Detalle de Guiones, Referentes y Entregas
          </h2>
          <p className="text-xs text-slate-400">
            Vista extendida con hooks, storytelling y enlaces de referente directos
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Total: <span className="text-rose-400 font-bold">{posts.length}</span> registros
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200 border-collapse min-w-[1700px]">
          <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-700">
            <tr>
              <th className="py-3 px-3">Miniatura</th>
              <th className="py-3 px-3">Etapa</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3">Fecha</th>
              <th className="py-3 px-3">Producto</th>
              <th className="py-3 px-3">Ángulo Venta</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Formato / Tipo</th>
              <th className="py-3 px-4 min-w-[220px]">Hook</th>
              <th className="py-3 px-4 min-w-[220px]">Guión / Copy</th>
              <th className="py-3 px-4 min-w-[220px]">Storytelling</th>
              <th className="py-3 px-3 min-w-[150px]">Link Referente</th>
              <th className="py-3 px-4 min-w-[200px]">Notas Referente</th>
              <th className="py-3 px-3">F. Entrega</th>
              <th className="py-3 px-3">Responsable</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                
                {/* Miniatura */}
                <td className="py-2.5 px-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center relative group">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.pieza} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-slate-500" />
                    )}
                    {post.linkReferente && (
                      <button
                        onClick={() => onPreviewReferente(post)}
                        className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                        title="Ver referente"
                      >
                        <Play size={14} />
                      </button>
                    )}
                  </div>
                </td>

                {/* Etapa */}
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getEtapaColor(post.etapa)}`}>
                    {post.etapa || 'Atracción'}
                  </span>
                </td>

                {/* Estado */}
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getEstadoColor(post.estado)}`}>
                    {post.estado || 'Plan'}
                  </span>
                </td>

                {/* Fecha */}
                <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                  {post.fecha || 'Sin fecha'}
                </td>

                {/* Producto */}
                <td className="py-2.5 px-3 font-medium text-slate-100">
                  {post.producto || '-'}
                </td>

                {/* Ángulo de Venta */}
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                    {post.anguloVenta || 'Voz en Off'}
                  </span>
                </td>

                {/* Categoría */}
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium">
                    {post.categoria || 'Aspiracional'}
                  </span>
                </td>

                {/* Formato / Tipo */}
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-medium">
                    {post.tipo || post.formato || 'Carrusel'}
                  </span>
                </td>

                {/* Hook */}
                <td className="py-2.5 px-4 font-semibold text-white">
                  <div className="line-clamp-2" title={post.hook || post.pieza}>
                    {post.hook || post.pieza}
                  </div>
                </td>

                {/* Guión / Copy */}
                <td className="py-2.5 px-4 text-slate-300">
                  <div className="line-clamp-2" title={post.guionCopy}>
                    {post.guionCopy || '-'}
                  </div>
                </td>

                {/* Storytelling */}
                <td className="py-2.5 px-4 text-slate-400">
                  <div className="line-clamp-2" title={post.storytelling}>
                    {post.storytelling || '-'}
                  </div>
                </td>

                {/* Link Referente */}
                <td className="py-2.5 px-3">
                  {post.linkReferente ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onPreviewReferente(post)}
                        className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Play size={10} />
                        <span>Ver</span>
                      </button>
                      <a
                        href={post.linkReferente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-rose-400"
                        title={post.linkReferente}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-600 text-[10px]">Sin link</span>
                  )}
                </td>

                {/* Notas Referente */}
                <td className="py-2.5 px-4 text-slate-400">
                  <div className="line-clamp-2" title={post.notasReferentes}>
                    {post.notasReferentes || '-'}
                  </div>
                </td>

                {/* Fecha de Entrega */}
                <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                  {post.fechaEntrega || '-'}
                </td>

                {/* Responsable */}
                <td className="py-2.5 px-3 font-medium text-slate-300">
                  {post.responsable || 'Gabi'}
                </td>

                {/* Acciones */}
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onEditPost(post)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Editar detalles"
                  >
                    <Edit size={13} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

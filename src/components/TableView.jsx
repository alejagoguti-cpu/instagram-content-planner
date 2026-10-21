import React from 'react';
import { ExternalLink, Play, Edit, Image as ImageIcon } from 'lucide-react';

export default function TableView({
  posts,
  onEditPost,
  onPreviewReferente
}) {
  const getEtapaColor = (etapa) => {
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

  const getEstadoColor = (estado) => {
    if (estado?.includes('Publicado')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (estado?.includes('Aprobado')) return 'bg-green-500/20 text-green-300 border border-green-500/30';
    if (estado?.includes('Programado')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-[#202024] text-[#8b8b94] border border-[#2e2e33]';
  };

  return (
    <div className="bg-[#111113] rounded-2xl border border-[#232327] overflow-hidden shadow-2xl">
      <div className="p-4 bg-[#18181b] border-b border-[#232327] flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold text-white tracking-wider uppercase font-sans">
            Tabla_1 — Detalle de Guiones, Referentes y Entregas
          </h2>
          <p className="text-[11px] text-[#8b8b94] font-medium">
            Vista extendida con hooks, storytelling y enlaces de referente directos
          </p>
        </div>
        <div className="text-xs text-[#8b8b94]">
          Total: <span className="text-[#ff4d57] font-bold">{posts.length}</span> registros
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200 border-collapse min-w-[1700px]">
          <thead className="bg-[#141416] text-[#8b8b94] uppercase text-[10px] tracking-wider font-extrabold border-b border-[#232327]">
            <tr>
              <th className="py-3 px-3">Miniatura</th>
              <th className="py-3 px-3">Etapa</th>
              <th className="py-3 px-3">Pilar Temático</th>
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
          <tbody className="divide-y divide-[#232327]">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-[#18181b]/50 transition-colors">
                
                {/* Miniatura */}
                <td className="py-2.5 px-3">
                  <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-[#2e2e33] flex items-center justify-center relative group">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.pieza} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-[#8b8b94]" />
                    )}
                    {post.linkReferente && (
                      <button
                        onClick={() => onPreviewReferente(post)}
                        className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#ff4d57] transition-opacity"
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

                {/* Pilar Temático */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
                    {post.pilar || post.producto || 'Cobros'}
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
                <td className="py-2.5 px-3 font-semibold text-white">
                  {post.producto || '-'}
                </td>

                {/* Ángulo de Venta */}
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-[#18181b] text-slate-300 border border-[#2e2e33] text-[10px] font-medium">
                    {post.anguloVenta || 'Voz en Off'}
                  </span>
                </td>

                {/* Categoría */}
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-[#18181b] text-[#ff4d57] border border-[#2e2e33] text-[10px] font-medium">
                    {post.categoria || 'Aspiracional'}
                  </span>
                </td>

                {/* Formato / Tipo */}
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-medium">
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
                <td className="py-2.5 px-4 text-[#8b8b94]">
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
                        className="px-2 py-1 rounded bg-[#c1121f]/20 hover:bg-[#c1121f]/30 text-[#ff4d57] border border-[#c1121f]/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Play size={10} />
                        <span>Ver</span>
                      </button>
                      <a
                        href={post.linkReferente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8b8b94] hover:text-[#ff4d57]"
                        title={post.linkReferente}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[#8b8b94]/50 text-[10px]">Sin link</span>
                  )}
                </td>

                {/* Notas Referente */}
                <td className="py-2.5 px-4 text-[#8b8b94]">
                  <div className="line-clamp-2" title={post.notasReferentes}>
                    {post.notasReferentes || '-'}
                  </div>
                </td>

                {/* Fecha de Entrega */}
                <td className="py-2.5 px-3 whitespace-nowrap text-[#8b8b94] font-mono text-[11px]">
                  {post.fechaEntrega || '-'}
                </td>

                {/* Responsable */}
                <td className="py-2.5 px-3 font-medium text-slate-300">
                  {post.responsable || 'Alejandra'}
                </td>

                {/* Acciones */}
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onEditPost(post)}
                    className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] text-white transition-colors"
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

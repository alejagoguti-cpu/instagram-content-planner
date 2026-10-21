import React from 'react';
import { ExternalLink, Play, Edit, Image as ImageIcon, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';

export default function TableView({
  posts,
  onEditPost,
  onPreviewReferente,
  onUpdateEstado
}) {
  const getEtapaColor = (etapa) => {
    switch (etapa?.toLowerCase()) {
      case 'atracción':
      case 'atraccion':
        return 'bg-amber-400/15 text-amber-300 border border-amber-400/30';
      case 'venta':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'validación':
      case 'validacion':
        return 'bg-sky-500/15 text-sky-300 border border-sky-500/30';
      case 'fidelización':
      case 'fidelizacion':
        return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
      default:
        return 'bg-white/5 text-[#8b8b94] border border-white/10';
    }
  };

  const getAprobacionBadge = (estado) => {
    const est = estado || 'Aprobado';
    if (est === 'Aprobado') return { label: 'Aprobado', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    if (est === 'En corrección') return { label: 'En corrección', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    return { label: 'Desaprobado', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
  };

  return (
    <div className="bg-[#0f1018] rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl">
      <div className="p-4 sm:p-5 bg-[#141522] border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase font-sans">
            Tabla Maestra de Producción y Guiones
          </h2>
          <p className="text-[11px] text-[#8b8b94] font-medium">
            Vista tabular con hooks, storytelling, copys de láminas y enlaces directos
          </p>
        </div>
        <div className="text-xs text-[#8b8b94] font-bold">
          Total: <span className="text-[#ff4d57]">{posts.length}</span> registros
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200 border-collapse min-w-[1700px]">
          <thead className="bg-[#0c0d14] text-[#8b8b94] uppercase text-[10px] tracking-wider font-black border-b border-white/[0.08]">
            <tr>
              <th className="py-3.5 px-3">Miniatura</th>
              <th className="py-3.5 px-3">Aprobación</th>
              <th className="py-3.5 px-3">Etapa</th>
              <th className="py-3.5 px-3">Pilar Temático</th>
              <th className="py-3.5 px-3">Fecha / Turno</th>
              <th className="py-3.5 px-3">Formato</th>
              <th className="py-3.5 px-4 min-w-[240px]">Hook</th>
              <th className="py-3.5 px-4 min-w-[260px]">Guión / Copy Aprobado</th>
              <th className="py-3.5 px-4 min-w-[220px]">Storytelling</th>
              <th className="py-3.5 px-3 min-w-[150px]">Link Referente</th>
              <th className="py-3.5 px-3">Responsable</th>
              <th className="py-3.5 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {posts.map((post) => {
              const aprob = getAprobacionBadge(post.estadoAprobacion);
              return (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                  
                  {/* Miniatura */}
                  <td className="py-2.5 px-3">
                    <div 
                      onClick={() => onPreviewReferente(post)}
                      className="w-12 h-12 rounded-xl bg-black overflow-hidden border border-white/10 flex items-center justify-center relative group cursor-pointer"
                    >
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.pieza} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-[#8b8b94]" />
                      )}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Play size={13} fill="white" />
                      </div>
                    </div>
                  </td>

                  {/* Estado de Aprobación */}
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => {
                        const current = post.estadoAprobacion || 'Aprobado';
                        const next = current === 'Aprobado' ? 'En corrección' : (current === 'En corrección' ? 'Desaprobado' : 'Aprobado');
                        if (onUpdateEstado) onUpdateEstado(post.id, next);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border transition-transform hover:scale-105 ${aprob.bg}`}
                      title="Haz clic para cambiar estado"
                    >
                      {aprob.label}
                    </button>
                  </td>

                  {/* Etapa */}
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${getEtapaColor(post.etapa)}`}>
                      {post.etapa || 'Atracción'}
                    </span>
                  </td>

                  {/* Pilar Temático */}
                  <td className="py-2.5 px-3 font-semibold text-slate-300">
                    <span className="truncate block max-w-[180px]">
                      {post.pilar || post.producto || '—'}
                    </span>
                  </td>

                  {/* Fecha y Turno */}
                  <td className="py-2.5 px-3 text-[#8b8b94]">
                    <div className="font-mono text-[11px] text-slate-200">{post.fecha || '—'}</div>
                    <div className="text-[10px]">{post.turno?.includes('1') ? '☀️ T1' : '🌙 T2'} · {post.dia}</div>
                  </td>

                  {/* Formato */}
                  <td className="py-2.5 px-3 text-[#8b8b94]">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] border border-white/10">
                      {post.formato || post.tipo || 'Carrusel'}
                    </span>
                  </td>

                  {/* Hook */}
                  <td className="py-2.5 px-4 font-semibold text-white">
                    <p className="line-clamp-2 leading-relaxed">
                      {post.hook || post.pieza}
                    </p>
                  </td>

                  {/* Guión / Copy */}
                  <td className="py-2.5 px-4 text-[#8b8b94]">
                    <p className="line-clamp-2 leading-relaxed font-sans text-[11px]">
                      {post.copyAprobado || post.guionCopy || '—'}
                    </p>
                  </td>

                  {/* Storytelling */}
                  <td className="py-2.5 px-4 text-[#8b8b94]">
                    <p className="line-clamp-2 leading-relaxed text-[11px]">
                      {post.storytelling || '—'}
                    </p>
                  </td>

                  {/* Link Referente */}
                  <td className="py-2.5 px-3">
                    {post.linkReferente ? (
                      <a
                        href={post.linkReferente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#ff4d57] hover:text-[#ff6b73] text-[11px] font-semibold"
                      >
                        <span>Ver Notion</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>

                  {/* Responsable */}
                  <td className="py-2.5 px-3 text-[#8b8b94] font-medium">
                    {post.responsable || 'Alejandra'}
                  </td>

                  {/* Acciones */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onPreviewReferente(post)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#c1121f] text-slate-200 hover:text-white text-[11px] font-bold transition-all border border-white/10 hover:border-transparent inline-flex items-center gap-1.5"
                    >
                      <FileText size={12} />
                      <span>Ver Pieza</span>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

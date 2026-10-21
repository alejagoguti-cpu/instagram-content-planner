import React from 'react';
import { ExternalLink, Palette, FileText } from 'lucide-react';

export default function TableView({
  posts,
  onEditPost,
  onPreviewReferente,
  onUpdateEstado
}) {
  return (
    <div className="bg-[#111114] rounded-md border border-white/[0.08] overflow-hidden">
      
      <div className="p-3.5 bg-[#151518] border-b border-white/[0.08] flex items-center justify-between">
        <h2 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">
          Tabla de Producción y Guiones ({posts.length} registros)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300 border-collapse min-w-[1200px]">
          <thead className="bg-[#0c0c0e] text-zinc-500 uppercase text-[10px] tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="py-2.5 px-3 w-16">Miniatura</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3">Pilar</th>
              <th className="py-2.5 px-3">Fecha</th>
              <th className="py-2.5 px-3">Turno</th>
              <th className="py-2.5 px-3">Etapa</th>
              <th className="py-2.5 px-4 min-w-[280px]">Hook / Título</th>
              <th className="py-2.5 px-3">Responsable</th>
              <th className="py-2.5 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {posts.map((post) => {
              const currentStatus = post.estadoAprobacion || 'Aprobado';

              return (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                  
                  <td className="py-2 px-3">
                    <div 
                      onClick={() => onPreviewReferente(post)}
                      className="w-10 h-10 rounded bg-black overflow-hidden border border-white/10 flex items-center justify-center cursor-pointer"
                    >
                      {post.coverImage ? (
                        <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-600">Img</span>
                      )}
                    </div>
                  </td>

                  <td className="py-2 px-3">
                    <button
                      onClick={() => {
                        const next = currentStatus === 'Aprobado' ? 'En corrección' : (currentStatus === 'En corrección' ? 'Desaprobado' : 'Aprobado');
                        if (onUpdateEstado) onUpdateEstado(post.id, next);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-medium border border-white/10 hover:border-white/30 text-zinc-300"
                    >
                      {currentStatus}
                    </button>
                  </td>

                  <td className="py-2 px-3 text-zinc-300 max-w-[180px] truncate">
                    {post.pilar || post.producto}
                  </td>

                  <td className="py-2 px-3 font-mono text-zinc-400">
                    {post.fecha || '—'}
                  </td>

                  <td className="py-2 px-3 text-zinc-400">
                    {post.turno?.includes('1') ? 'T1 · 09:00' : 'T2 · 17:00'}
                  </td>

                  <td className="py-2 px-3 text-zinc-400">
                    {post.etapa || 'Atracción'}
                  </td>

                  <td className="py-2 px-4 font-medium text-white max-w-xs truncate">
                    {post.hook || post.pieza}
                  </td>

                  <td className="py-2 px-3 text-zinc-400">
                    {post.responsable || 'Alejandra'}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPreviewReferente(post)}
                        className="px-2.5 py-1 rounded border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] font-medium"
                      >
                        Ver guion
                      </button>
                    </div>
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

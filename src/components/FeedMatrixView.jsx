import React, { useState } from 'react';
import { Play, Copy, Check, ExternalLink, Calendar, User, Tag, Sparkles } from 'lucide-react';

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function FeedMatrixView({
  posts,
  selectedSemana,
  onEditPost,
  onPreviewReferente,
  onUpdateEstado
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [filterEtapa, setFilterEtapa] = useState('todas');
  const [filterPilar, setFilterPilar] = useState('todos');
  const [filterAprobacion, setFilterAprobacion] = useState('todos');

  const activeSemanas = selectedSemana === 'todas'
    ? Array.from(new Set(posts.map(p => p.semana))).sort()
    : [selectedSemana];

  const handleCopy = (text, id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAprobacionBadge = (estado) => {
    const est = estado || 'Aprobado';
    if (est === 'Aprobado') {
      return {
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dot: 'bg-emerald-400',
        label: 'Aprobado'
      };
    }
    if (est === 'En corrección') {
      return {
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-400',
        label: 'En corrección'
      };
    }
    return {
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-400',
      label: 'Desaprobado'
    };
  };

  const pilaresList = [
    'todos',
    'Cobros, Pagos y Tesorería',
    'Bitaxus IA y Automatización',
    'Bitaxus Global y Dólares Digitales',
    'WhatsApp y Automatización',
    'Crecimiento, Equipo y Delegación',
    'Pioneros y Acceso Anticipado',
    'Humor y Cultura Pop',
    'Comercio, Domicilios y Puntos'
  ];

  const getPilarColor = (pilar) => {
    const p = pilar || '';
    if (p.includes('Global')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (p.includes('IA')) return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
    if (p.includes('WhatsApp')) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (p.includes('Pionero')) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    if (p.includes('Humor')) return 'text-pink-400 border-pink-500/30 bg-pink-500/10';
    if (p.includes('Equipo') || p.includes('Crecimiento')) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (p.includes('Domicilio') || p.includes('Puntos')) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    return 'text-[#ff4d57] border-[#c1121f]/30 bg-[#c1121f]/10';
  };

  const getEtapaBadge = (etapa) => {
    const e = etapa?.toLowerCase() || '';
    if (e.includes('atrac')) {
      return {
        bg: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        dot: 'bg-amber-400'
      };
    }
    if (e.includes('vent')) {
      return {
        bg: 'bg-[#c1121f]/20 text-[#ff4d57] border-[#c1121f]/40',
        dot: 'bg-[#c1121f]'
      };
    }
    if (e.includes('valid')) {
      return {
        bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        dot: 'bg-sky-400'
      };
    }
    return {
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dot: 'bg-purple-400'
    };
  };

  return (
    <div className="space-y-10">
      
      {/* Barra de Filtros por Etapa y Pilar Temático */}
      <div className="space-y-3 p-4 rounded-2xl bg-[#111113] border border-[#232327] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#8b8b94] uppercase tracking-wider">Etapa:</span>
            <div className="flex flex-wrap gap-1.5">
              {['todas', 'Atracción', 'Validación', 'Venta'].map(et => (
                <button
                  key={et}
                  onClick={() => setFilterEtapa(et)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterEtapa === et
                      ? 'bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/30'
                      : 'bg-[#18181b] text-[#8b8b94] hover:text-white border border-[#2e2e33]'
                  }`}
                >
                  {et === 'todas' ? 'Todas' : et}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8b8b94]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Atracción
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Validación
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c1121f]"></span> Venta
            </span>
          </div>
        </div>

        {/* Filtro por Pilar Temático */}
        <div className="pt-2 border-t border-[#232327] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#8b8b94] uppercase tracking-wider">Pilar Temático:</span>
          <div className="flex flex-wrap gap-1.5">
            {pilaresList.map(pil => (
              <button
                key={pil}
                onClick={() => setFilterPilar(pil)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterPilar === pil
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#18181b] text-[#8b8b94] hover:text-white border border-[#2e2e33]'
                }`}
              >
                {pil === 'todos' ? 'Todos los pilares' : pil}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Estado de Aprobación */}
        <div className="pt-2 border-t border-[#232327] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#8b8b94] uppercase tracking-wider">Aprobación:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'Aprobado', label: '✅ Aprobado' },
                { id: 'En corrección', label: '⚠️ En corrección' },
                { id: 'Desaprobado', label: '❌ Desaprobado' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFilterAprobacion(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterAprobacion === st.id
                      ? 'bg-[#c1121f] text-white shadow-md'
                      : 'bg-[#18181b] text-[#8b8b94] hover:text-white border border-[#2e2e33]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#8b8b94] hidden sm:inline">
            💡 Haz clic en el badge de aprobación de cada tarjeta para cambiar su estado
          </span>
        </div>
      </div>

      {activeSemanas.map((semana) => {
        const semanaPosts = posts.filter(p => {
          if (p.semana !== semana) return false;
          if (filterEtapa !== 'todas' && !p.etapa?.toLowerCase().includes(filterEtapa.toLowerCase())) {
            return false;
          }
          if (filterPilar !== 'todos' && p.pilar !== filterPilar && p.producto !== filterPilar) {
            return false;
          }
          if (filterAprobacion !== 'todos' && (p.estadoAprobacion || 'Aprobado') !== filterAprobacion) {
            return false;
          }
          return true;
        });

        // Extraer rango de fechas
        const todasFechas = posts.filter(p => p.semana === semana).map(p => p.fecha).filter(Boolean).sort();
        const fechaRango = todasFechas.length > 0
          ? `${todasFechas[0]} — ${todasFechas[todasFechas.length - 1]}`
          : '';

        return (
          <div key={semana} className="space-y-4">
            
            {/* Encabezado elegante de la semana */}
            <div className="flex items-center justify-between pb-2 border-b border-[#232327]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#c1121f] to-[#ff4d57]"></div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider font-sans">
                  {semana}
                </h2>
                {fechaRango && (
                  <span className="text-xs text-[#8b8b94] font-medium bg-[#18181b] px-3 py-1 rounded-full border border-[#2e2e33]">
                    {fechaRango}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#8b8b94] font-bold">
                {semanaPosts.length} publicaciones programadas
              </span>
            </div>

            {/* Cuadrícula de 7 Días (Lunes a Domingo) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
              {DIAS_ORDEN.map((dia) => {
                const postsDelDia = posts.filter(p => p.semana === semana && p.dia === dia);
                const postsFiltrados = postsDelDia.filter(p => {
                  if (filterEtapa !== 'todas' && !p.etapa?.toLowerCase().includes(filterEtapa.toLowerCase())) {
                    return false;
                  }
                  if (filterPilar !== 'todos' && p.pilar !== filterPilar && p.producto !== filterPilar) {
                    return false;
                  }
                  if (filterAprobacion !== 'todos' && (p.estadoAprobacion || 'Aprobado') !== filterAprobacion) {
                    return false;
                  }
                  return true;
                });

                const fechaDia = postsDelDia[0]?.fecha ? postsDelDia[0].fecha.split('-').slice(1).join('/') : '';

                return (
                  <div
                    key={dia}
                    className="flex flex-col rounded-2xl bg-[#111113] border border-[#232327] overflow-hidden min-h-[480px]"
                  >
                    {/* Header del día */}
                    <div className="p-3 bg-[#18181b] border-b border-[#232327] flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {dia}
                      </span>
                      {fechaDia && (
                        <span className="text-[10px] font-bold text-[#8b8b94] font-mono">
                          {fechaDia}
                        </span>
                      )}
                    </div>

                    {/* Lista de publicaciones del día */}
                    <div className="p-2.5 flex-1 flex flex-col gap-3">
                      {postsFiltrados.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#232327] rounded-xl text-[#8b8b94]/40">
                          <span className="text-xs font-medium">Sin publicaciones</span>
                        </div>
                      ) : (
                        postsFiltrados.map((post) => {
                          const badge = getEtapaBadge(post.etapa);
                          const aprobBadge = getAprobacionBadge(post.estadoAprobacion);
                          const copyText = post.copyAprobado || post.guionCopy || post.hook || '';
                          const isMañana = post.turno?.includes('1');

                          const toggleEstado = (e) => {
                            e.stopPropagation();
                            const current = post.estadoAprobacion || 'Aprobado';
                            const next = current === 'Aprobado' ? 'En corrección' : (current === 'En corrección' ? 'Desaprobado' : 'Aprobado');
                            if (onUpdateEstado) {
                              onUpdateEstado(post.id, next);
                            }
                          };

                          return (
                            <div
                              key={post.id}
                              onClick={() => onPreviewReferente(post)}
                              className="group relative flex flex-col bg-[#18181b] hover:bg-[#202024] rounded-xl border border-[#2e2e33] hover:border-[#c1121f] transition-all duration-200 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
                            >
                              {/* Miniatura del Board V3 con Overlay de Acciones */}
                              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                                {post.coverImage ? (
                                  <img
                                    src={post.coverImage}
                                    alt={post.pieza}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8b8b94] text-[10px]">
                                    Sin imagen
                                  </div>
                                )}

                                {/* Gradiente y Badges sobre la imagen */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                                {/* Badge de Turno */}
                                <div className="absolute top-2 left-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow ${
                                    isMañana ? 'bg-amber-500/90 text-black' : 'bg-indigo-600/90 text-white'
                                  }`}>
                                    {isMañana ? '☀️ T1' : '🌙 T2'}
                                  </span>
                                </div>

                                {/* Badges de Etapa y Aprobación */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase border backdrop-blur-md shadow ${badge.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                    {post.etapa || 'Atracción'}
                                  </span>

                                  {/* Badge interactivo Aprobado / Desaprobado */}
                                  <button
                                    onClick={toggleEstado}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border backdrop-blur-md shadow transition-transform hover:scale-105 ${aprobBadge.bg}`}
                                    title="Haz clic para cambiar estado (Aprobado / En corrección / Desaprobado)"
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${aprobBadge.dot}`}></span>
                                    <span>{aprobBadge.label}</span>
                                  </button>
                                </div>

                                {/* Hover Overlay: Botón grande de Ver Láminas */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                                  <span className="px-3 py-1.5 rounded-lg bg-[#c1121f] text-xs font-black uppercase flex items-center gap-1.5 shadow-xl">
                                    <Play size={12} fill="white" />
                                    Ver Copy & Láminas
                                  </span>
                                </div>
                              </div>

                              {/* PILAR TEMÁTICO DESTACADO: Banner visible de ancho completo */}
                              <div className="px-3 pt-2.5">
                                <div className={`w-full px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border flex items-center justify-between ${getPilarColor(post.pilar || post.producto)}`}>
                                  <span className="truncate">{post.pilar || post.producto || 'Cobros'}</span>
                                  <span className="text-[9px] opacity-75 font-normal ml-1 shrink-0">{post.tipo || post.formato || 'Carrusel'}</span>
                                </div>
                              </div>

                              {/* Contenido / Metadata de la Tarjeta */}
                              <div className="p-3 pt-2 flex-1 flex flex-col justify-between gap-2.5">
                                
                                <div>
                                  {/* Hook / Título Principal */}
                                  <p className="text-xs font-bold text-white group-hover:text-[#ff4d57] line-clamp-2 leading-snug transition-colors">
                                    {post.hook || post.pieza}
                                  </p>
                                </div>

                                {/* Historias si existen */}
                                {post.historias && (
                                  <p className="text-[10px] text-[#8b8b94] line-clamp-1 italic bg-[#111113] p-1.5 rounded border border-[#232327]">
                                    💬 {post.historias}
                                  </p>
                                )}

                                {/* Barra inferior de acciones */}
                                <div className="pt-2 border-t border-[#2e2e33] flex items-center justify-between gap-1">
                                  <span className="text-[9px] text-[#8b8b94] font-medium flex items-center gap-1">
                                    <User size={10} className="text-[#c1121f]" />
                                    {post.responsable || 'Alejandra'}
                                  </span>

                                  {copyText && (
                                    <button
                                      onClick={(e) => handleCopy(copyText, post.id, e)}
                                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        copiedId === post.id
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-[#202024] hover:bg-[#2c2c31] text-[#8b8b94] hover:text-white border border-[#2e2e33]'
                                      }`}
                                      title="Copiar texto de este post"
                                    >
                                      {copiedId === post.id ? (
                                        <>
                                          <Check size={11} /> Copiado
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={11} /> Copiar
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })}

    </div>
  );
}

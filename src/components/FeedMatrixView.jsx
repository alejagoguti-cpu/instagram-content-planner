import React, { useState, useMemo } from 'react';
import { 
  Play, Copy, Check, ExternalLink, Calendar, User, Tag, Sparkles, 
  Search, Filter, CheckCircle2, AlertTriangle, XCircle, RotateCcw, 
  MessageSquare, Eye, SlidersHorizontal, ChevronDown
} from 'lucide-react';

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function FeedMatrixView({
  posts,
  selectedSemana,
  onEditPost,
  onPreviewReferente,
  onUpdateEstado
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('todas');
  const [filterPilar, setFilterPilar] = useState('todos');
  const [filterAprobacion, setFilterAprobacion] = useState('todos');
  const [showPilarDropdown, setShowPilarDropdown] = useState(false);

  const activeSemanas = selectedSemana === 'todas'
    ? Array.from(new Set(posts.map(p => p.semana))).sort()
    : [selectedSemana];

  const handleCopy = (text, id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Pilares temáticos con metadatos de estilo
  const PILARES_CONFIG = {
    'Cobros, Pagos y Tesorería': {
      icon: '💳',
      label: 'Cobros y Pagos',
      badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      dot: 'bg-amber-400'
    },
    'Bitaxus IA y Automatización': {
      icon: '🤖',
      label: 'Bitaxus IA',
      badge: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      dot: 'bg-purple-400'
    },
    'Bitaxus Global y Dólares Digitales': {
      icon: '🌍',
      label: 'Global & Dólares',
      badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
      dot: 'bg-cyan-400'
    },
    'WhatsApp y Automatización': {
      icon: '💬',
      label: 'WhatsApp & CRM',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      dot: 'bg-emerald-400'
    },
    'Crecimiento, Equipo y Delegación': {
      icon: '👥',
      label: 'Equipo & Crecimiento',
      badge: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      dot: 'bg-blue-400'
    },
    'Pioneros y Acceso Anticipado': {
      icon: '🚀',
      label: 'Pioneros',
      badge: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      dot: 'bg-amber-400'
    },
    'Humor y Cultura Pop': {
      icon: '🎭',
      label: 'Humor & Cultura',
      badge: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
      dot: 'bg-pink-400'
    },
    'Comercio, Domicilios y Puntos': {
      icon: '🍽️',
      label: 'Comercio & Puntos',
      badge: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
      dot: 'bg-orange-400'
    }
  };

  const getPilarInfo = (pilarName) => {
    if (!pilarName) return { icon: '📌', label: 'General', badge: 'border-rose-500/30 bg-rose-500/10 text-rose-300', dot: 'bg-rose-400' };
    for (const [key, val] of Object.entries(PILARES_CONFIG)) {
      if (pilarName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(pilarName.toLowerCase())) {
        return val;
      }
    }
    return { icon: '📌', label: pilarName, badge: 'border-rose-500/30 bg-rose-500/10 text-rose-300', dot: 'bg-rose-400' };
  };

  const getAprobacionBadge = (estado) => {
    const est = estado || 'Aprobado';
    if (est === 'Aprobado') {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
        dot: 'bg-emerald-400',
        label: 'Aprobado',
        icon: '✅'
      };
    }
    if (est === 'En corrección') {
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
        dot: 'bg-amber-400',
        label: 'En corrección',
        icon: '⚠️'
      };
    }
    return {
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
      dot: 'bg-rose-400',
      label: 'Desaprobado',
      icon: '❌'
    };
  };

  const getEtapaBadge = (etapa) => {
    const e = etapa?.toLowerCase() || '';
    if (e.includes('atrac')) {
      return {
        bg: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        dot: 'bg-amber-400',
        label: 'Atracción'
      };
    }
    if (e.includes('vent')) {
      return {
        bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'Venta'
      };
    }
    if (e.includes('valid')) {
      return {
        bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        dot: 'bg-sky-400',
        label: 'Validación'
      };
    }
    return {
      bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      dot: 'bg-purple-400',
      label: etapa || 'General'
    };
  };

  // Filtrado reactivo de posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      // Búsqueda por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesHook = p.hook?.toLowerCase().includes(query);
        const matchesPieza = p.pieza?.toLowerCase().includes(query);
        const matchesCopy = p.copyAprobado?.toLowerCase().includes(query) || p.guionCopy?.toLowerCase().includes(query);
        const matchesPilar = p.pilar?.toLowerCase().includes(query) || p.producto?.toLowerCase().includes(query);
        if (!matchesHook && !matchesPieza && !matchesCopy && !matchesPilar) return false;
      }
      // Filtro Etapa
      if (filterEtapa !== 'todas' && !p.etapa?.toLowerCase().includes(filterEtapa.toLowerCase())) {
        return false;
      }
      // Filtro Pilar
      if (filterPilar !== 'todos' && p.pilar !== filterPilar && p.producto !== filterPilar) {
        return false;
      }
      // Filtro Aprobación
      if (filterAprobacion !== 'todos' && (p.estadoAprobacion || 'Aprobado') !== filterAprobacion) {
        return false;
      }
      return true;
    });
  }, [posts, searchTerm, filterEtapa, filterPilar, filterAprobacion]);

  // KPIs de progreso general
  const stats = useMemo(() => {
    const total = posts.length;
    let aprobados = 0;
    let enCorreccion = 0;
    let desaprobados = 0;

    posts.forEach(p => {
      const est = p.estadoAprobacion || 'Aprobado';
      if (est === 'Aprobado') aprobados++;
      else if (est === 'En corrección') enCorreccion++;
      else if (est === 'Desaprobado') desaprobados++;
    });

    const percentAprob = total > 0 ? Math.round((aprobados / total) * 100) : 0;
    const percentCorr = total > 0 ? Math.round((enCorreccion / total) * 100) : 0;
    const percentDes = total > 0 ? Math.round((desaprobados / total) * 100) : 0;

    return { total, aprobados, enCorreccion, desaprobados, percentAprob, percentCorr, percentDes };
  }, [posts]);

  const hasActiveFilters = searchTerm !== '' || filterEtapa !== 'todas' || filterPilar !== 'todos' || filterAprobacion !== 'todos';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterEtapa('todas');
    setFilterPilar('todos');
    setFilterAprobacion('todos');
  };

  return (
    <div className="space-y-8">
      
      {/* =========================================================================
          PANEL SUPERIOR: KPIS DE APROBACIÓN Y COMANDO DE CONTROL
          ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-b from-[#141520] to-[#0d0e15] border border-white/[0.08] p-5 shadow-2xl space-y-5">
        
        {/* Fila 1: KPIs & Progreso de Producción */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c1121f]"></span>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Flujo de Revisión y Variedad
              </h2>
            </div>
            <span className="text-xs text-[#8b8b94] font-medium">
              ({filteredPosts.length} de {posts.length} piezas visibles)
            </span>
          </div>

          {/* Badges de Estado Acumulado */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Aprobados */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-emerald-300">
                {stats.aprobados} Aprobados ({stats.percentAprob}%)
              </span>
            </div>

            {/* En Corrección */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-bold text-amber-300">
                {stats.enCorreccion} En Corrección ({stats.percentCorr}%)
              </span>
            </div>

            {/* Desaprobados */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="text-xs font-bold text-rose-300">
                {stats.desaprobados} Desaprobados ({stats.percentDes}%)
              </span>
            </div>

          </div>

        </div>

        {/* Barra Visual de Progreso Multiestado */}
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${stats.percentAprob}%` }} 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            title={`${stats.percentAprob}% Aprobado`}
          />
          <div 
            style={{ width: `${stats.percentCorr}%` }} 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            title={`${stats.percentCorr}% En corrección`}
          />
          <div 
            style={{ width: `${stats.percentDes}%` }} 
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500"
            title={`${stats.percentDes}% Desaprobado`}
          />
        </div>

        {/* Fila 2: Barra de Búsqueda y Filtros Rápidos */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 pt-1">
          
          {/* Buscador en Vivo */}
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b94]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por gancho, palabra clave, lámina o pilar..."
              className="w-full bg-[#0a0b10] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8b8b94]/60 focus:outline-none focus:border-[#c1121f] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8b8b94] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Controls para Etapas y Aprobación */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filtro Etapa */}
            <div className="flex items-center bg-[#0a0b10] p-1 rounded-xl border border-white/10">
              {['todas', 'Atracción', 'Validación', 'Venta'].map(et => (
                <button
                  key={et}
                  onClick={() => setFilterEtapa(et)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterEtapa === et
                      ? 'bg-gradient-to-r from-[#c1121f] to-[#d61a28] text-white shadow-md'
                      : 'text-[#8b8b94] hover:text-white'
                  }`}
                >
                  {et === 'todas' ? 'Etapas' : et}
                </button>
              ))}
            </div>

            {/* Filtro Aprobación */}
            <div className="flex items-center bg-[#0a0b10] p-1 rounded-xl border border-white/10">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'Aprobado', label: '✅ Aprobado' },
                { id: 'En corrección', label: '⚠️ Corrección' },
                { id: 'Desaprobado', label: '❌ Rechazado' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFilterAprobacion(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterAprobacion === st.id
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-[#8b8b94] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Botón Reset */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#8b8b94] hover:text-white border border-white/10 transition-colors"
                title="Limpiar filtros activos"
              >
                <RotateCcw size={12} />
                <span>Limpiar</span>
              </button>
            )}

          </div>

        </div>

        {/* Fila 3: Chips de Pilares Temáticos (Distribución Visual y Balance) */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#8b8b94] uppercase tracking-wider mr-1.5 flex items-center gap-1">
            <Tag size={12} className="text-[#ff4d57]" />
            Pilares:
          </span>

          <button
            onClick={() => setFilterPilar('todos')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterPilar === 'todos'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-[#8b8b94] hover:text-white border border-white/10'
            }`}
          >
            Todos ({posts.length})
          </button>

          {Object.entries(PILARES_CONFIG).map(([key, config]) => {
            const count = posts.filter(p => p.pilar === key || p.producto === key).length;
            const isSelected = filterPilar === key;
            return (
              <button
                key={key}
                onClick={() => setFilterPilar(isSelected ? 'todos' : key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  isSelected
                    ? `${config.badge} ring-1 ring-white/30 font-black shadow-md`
                    : 'bg-white/[0.03] text-[#8b8b94] hover:text-white border-white/[0.06] hover:border-white/20'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-[10px] opacity-60 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          SECCIONES POR SEMANA Y GRID DE 7 DÍAS
          ========================================================================= */}
      {activeSemanas.map((semana) => {
        const semanaPosts = filteredPosts.filter(p => p.semana === semana);

        // Extraer rango de fechas de la semana
        const fechasSemana = posts.filter(p => p.semana === semana).map(p => p.fecha).filter(Boolean).sort();
        const fechaRango = fechasSemana.length > 0
          ? `${fechasSemana[0]} — ${fechasSemana[fechasSemana.length - 1]}`
          : '';

        return (
          <div key={semana} className="space-y-4">
            
            {/* Header de Semana Elegante */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#c1121f] to-[#ff4d57]"></div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans">
                  {semana}
                </h3>
                {fechaRango && (
                  <span className="text-xs text-[#8b8b94] font-medium bg-white/5 px-3 py-0.5 rounded-full border border-white/10">
                    {fechaRango}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#8b8b94] font-bold">
                {semanaPosts.length} piezas programadas
              </span>
            </div>

            {/* Grid de 7 Días (Lunes a Domingo) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
              {DIAS_ORDEN.map((dia) => {
                const postsDelDia = posts.filter(p => p.semana === semana && p.dia === dia);
                const postsFiltrados = filteredPosts.filter(p => p.semana === semana && p.dia === dia);
                const fechaDia = postsDelDia[0]?.fecha ? postsDelDia[0].fecha.split('-').slice(1).join('/') : '';

                return (
                  <div
                    key={dia}
                    className="flex flex-col rounded-2xl bg-[#0f1018]/90 border border-white/[0.07] overflow-hidden min-h-[460px] shadow-lg"
                  >
                    {/* Header del día */}
                    <div className="p-3 bg-[#141522] border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {dia}
                      </span>
                      {fechaDia && (
                        <span className="text-[10px] font-bold text-[#8b8b94] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {fechaDia}
                        </span>
                      )}
                    </div>

                    {/* Lista de publicaciones del día */}
                    <div className="p-2.5 flex-1 flex flex-col gap-3">
                      {postsFiltrados.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl text-[#8b8b94]/40">
                          <span className="text-[11px] font-medium">Sin publicaciones</span>
                        </div>
                      ) : (
                        postsFiltrados.map((post) => {
                          const badge = getEtapaBadge(post.etapa);
                          const aprobBadge = getAprobacionBadge(post.estadoAprobacion);
                          const pilarInfo = getPilarInfo(post.pilar || post.producto);
                          const copyText = post.copyAprobado || post.guionCopy || post.hook || '';
                          const isMañana = post.turno?.includes('1');
                          const hasFeedback = !!post.notasFeedback && post.notasFeedback.trim().length > 0;

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
                              className="group relative flex flex-col bg-[#141520] hover:bg-[#1a1c2b] rounded-xl border border-white/[0.08] hover:border-[#c1121f]/70 transition-all duration-200 cursor-pointer overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-0.5"
                            >
                              {/* Miniatura del Board Visual */}
                              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                                {post.coverImage ? (
                                  <img
                                    src={post.coverImage}
                                    alt={post.pieza}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8b8b94] text-[10px]">
                                    Sin board
                                  </div>
                                )}

                                {/* Gradiente sutil */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none"></div>

                                {/* Top Left: Turno Chip */}
                                <div className="absolute top-2 left-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                                    isMañana ? 'bg-amber-500/90 text-black' : 'bg-indigo-600/90 text-white'
                                  }`}>
                                    {isMañana ? '☀️ T1' : '🌙 T2'}
                                  </span>
                                </div>

                                {/* Top Right: Interactive Approval Badge */}
                                <div className="absolute top-2 right-2">
                                  <button
                                    onClick={toggleEstado}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border backdrop-blur-md shadow-md transition-all hover:scale-105 ${aprobBadge.bg}`}
                                    title="Haz clic para cambiar estado (Aprobado / En corrección / Desaprobado)"
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${aprobBadge.dot}`}></span>
                                    <span>{aprobBadge.label}</span>
                                  </button>
                                </div>

                                {/* Hover Overlay: Quick View Button */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] text-xs font-black uppercase flex items-center gap-1.5 shadow-xl">
                                    <Eye size={13} />
                                    Ver Copy & Láminas
                                  </span>
                                </div>
                              </div>

                              {/* Pilar Temático y Etapa */}
                              <div className="px-3 pt-2.5 flex items-center justify-between gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[70%] ${pilarInfo.badge}`}>
                                  <span>{pilarInfo.icon}</span>
                                  <span className="truncate">{pilarInfo.label}</span>
                                </span>

                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${badge.bg}`}>
                                  <span className={`w-1 h-1 rounded-full ${badge.dot}`}></span>
                                  <span>{badge.label}</span>
                                </span>
                              </div>

                              {/* Hook / Título del Post */}
                              <div className="p-3 pt-2 flex-1 flex flex-col justify-between gap-2.5">
                                <div>
                                  <p className="text-xs font-bold text-white group-hover:text-[#ff4d57] line-clamp-2 leading-snug transition-colors">
                                    {post.hook || post.pieza}
                                  </p>

                                  {/* Indicador de Feedback pendiente si existe */}
                                  {hasFeedback && (
                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate">
                                      <MessageSquare size={10} className="shrink-0" />
                                      <span className="truncate">Notas de corrección</span>
                                    </div>
                                  )}
                                </div>

                                {/* Footer con Responsable y Copiar */}
                                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-1">
                                  <span className="text-[9px] text-[#8b8b94] font-medium flex items-center gap-1">
                                    <User size={10} className="text-[#c1121f]" />
                                    {post.responsable || 'Alejandra'}
                                  </span>

                                  {copyText && (
                                    <button
                                      onClick={(e) => handleCopy(copyText, post.id, e)}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        copiedId === post.id
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-white/5 hover:bg-white/10 text-[#8b8b94] hover:text-white border border-white/10'
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

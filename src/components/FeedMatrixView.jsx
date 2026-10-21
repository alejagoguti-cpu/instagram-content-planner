import React, { useState, useMemo } from 'react';
import { 
  Play, Copy, Check, ExternalLink, Calendar, User, Tag, Sparkles, 
  Search, Filter, CheckCircle2, AlertTriangle, XCircle, RotateCcw, 
  MessageSquare, Eye, SlidersHorizontal, Pin, Palette, Link2, 
  Save, Clock, ArrowRight, LayoutGrid, Columns, AlertCircle
} from 'lucide-react';

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function FeedMatrixView({
  posts,
  pinnedPosts = [],
  selectedSemana,
  onTogglePin,
  onUpdatePostData,
  onEditPost,
  onPreviewReferente,
  onUpdateEstado
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('todas');
  const [filterPilar, setFilterPilar] = useState('todos');
  const [filterAprobacion, setFilterAprobacion] = useState('todos');
  const [cardLayout, setCardLayout] = useState('grid'); // 'grid' | 'days' | 'pinned'
  const [editingCanvaId, setEditingCanvaId] = useState(null);
  const [canvaInput, setCanvaInput] = useState('');
  const [cardFeedback, setCardFeedback] = useState({});
  const [savedFeedbackIds, setSavedFeedbackIds] = useState({});

  const activeSemanas = selectedSemana === 'todas'
    ? Array.from(new Set(posts.map(p => p.semana))).sort()
    : [selectedSemana];

  const handleCopy = (text, id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCardFeedback = (postId) => {
    const text = cardFeedback[postId];
    if (text !== undefined) {
      onUpdatePostData(postId, { notasFeedback: text });
      setSavedFeedbackIds(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setSavedFeedbackIds(prev => ({ ...prev, [postId]: false }));
      }, 2000);
    }
  };

  const handleSaveCanvaLink = (postId) => {
    if (canvaInput.trim()) {
      onUpdatePostData(postId, { editableLink: canvaInput.trim() });
    }
    setEditingCanvaId(null);
    setCanvaInput('');
  };

  // Configuración de Pilares Temáticos
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

  const getEtapaBadge = (etapa) => {
    const e = etapa?.toLowerCase() || '';
    if (e.includes('atrac')) {
      return { bg: 'bg-amber-400/10 text-amber-300 border-amber-400/30', label: 'Atracción' };
    }
    if (e.includes('vent')) {
      return { bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30', label: 'Venta' };
    }
    if (e.includes('valid')) {
      return { bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30', label: 'Validación' };
    }
    return { bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30', label: etapa || 'General' };
  };

  // Filtrado de posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (cardLayout === 'pinned' && !p.isPinned) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesHook = p.hook?.toLowerCase().includes(query);
        const matchesPieza = p.pieza?.toLowerCase().includes(query);
        const matchesCopy = p.copyAprobado?.toLowerCase().includes(query) || p.guionCopy?.toLowerCase().includes(query);
        const matchesPilar = p.pilar?.toLowerCase().includes(query) || p.producto?.toLowerCase().includes(query);
        if (!matchesHook && !matchesPieza && !matchesCopy && !matchesPilar) return false;
      }

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
  }, [posts, searchTerm, filterEtapa, filterPilar, filterAprobacion, cardLayout]);

  // KPIs de progreso
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

  // Componente de Tarjeta Completa y Espaciosa
  const renderCard = (post) => {
    const pilarInfo = getPilarInfo(post.pilar || post.producto);
    const etapaBadge = getEtapaBadge(post.etapa);
    const copyText = post.copyAprobado || post.guionCopy || post.hook || '';
    const isMañana = post.turno?.includes('1');
    const isPinned = !!post.isPinned;
    const hasFeedback = (post.notasFeedback && post.notasFeedback.trim().length > 0) || (cardFeedback[post.id] && cardFeedback[post.id].trim().length > 0);
    const isEditingCanva = editingCanvaId === post.id;
    const isSavedFeedback = savedFeedbackIds[post.id];

    return (
      <div
        key={post.id}
        className={`group relative flex flex-col bg-[#12131d] rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl hover:shadow-2xl ${
          isPinned ? 'border-amber-400/50 ring-1 ring-amber-400/30' : 'border-white/[0.08] hover:border-[#c1121f]/60'
        }`}
      >
        {/* Banner Superior si está fijado en el perfil */}
        {isPinned && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border-b border-amber-400/30 px-3.5 py-1.5 flex items-center justify-between text-amber-300 text-xs font-black">
            <span className="flex items-center gap-1.5">
              <Pin size={13} className="text-amber-400 fill-amber-400" />
              <span>POST FIJADO EN EL PERFIL DE INSTAGRAM</span>
            </span>
            <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
              Lanzamiento
            </span>
          </div>
        )}

        {/* Sección de Imagen & Header */}
        <div className="relative aspect-[16/9] bg-black overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.pieza}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8b8b94] text-xs">
              Sin board visual
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none"></div>

          {/* Turno Pill */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
              isMañana ? 'bg-amber-500/90 text-black' : 'bg-indigo-600/90 text-white'
            }`}>
              {isMañana ? '☀️ Mañana (T1)' : '🌙 Tarde (T2)'}
            </span>
          </div>

          {/* Botón Pin para fijar en el perfil */}
          <div className="absolute top-2.5 right-2.5">
            <button
              onClick={() => onTogglePin(post.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all shadow-md backdrop-blur-md ${
                isPinned
                  ? 'bg-amber-400 text-black hover:bg-amber-300 ring-2 ring-amber-300/60'
                  : 'bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20'
              }`}
              title={isPinned ? 'Quitar de los 3 posts fijados' : 'Fijar como uno de los 3 posts del perfil'}
            >
              <Pin size={11} className={isPinned ? 'fill-black' : ''} />
              <span>{isPinned ? 'Fijado' : 'Fijar'}</span>
            </button>
          </div>

          {/* Hover Overlay para ver láminas */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => onPreviewReferente(post)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] text-white text-xs font-black uppercase flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <Eye size={14} />
              <span>Ver Copy & Láminas</span>
            </button>
          </div>
        </div>

        {/* Cuerpo de la Card */}
        <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
          
          <div className="space-y-3">
            {/* Pilar Temático y Etapa */}
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${pilarInfo.badge}`}>
                <span>{pilarInfo.icon}</span>
                <span>{pilarInfo.label}</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${etapaBadge.bg}`}>
                <span>{etapaBadge.label}</span>
              </span>
            </div>

            {/* Gancho / Hook Principal */}
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#ff4d57] transition-colors leading-snug line-clamp-2">
                {post.hook || post.pieza}
              </h4>
            </div>

            {/* Doble Fecha: Solicitud/Entrega vs Publicación (Exigido por OnTarget) */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/50 border border-white/[0.06] text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b8b94] font-semibold block flex items-center gap-1">
                  <Clock size={10} className="text-amber-400" />
                  Pedido / Deadline:
                </span>
                <span className="text-slate-200 font-mono font-bold text-[11px]">
                  {post.fechaEntrega || '2026-10-13'}
                </span>
              </div>

              <div className="space-y-0.5 border-l border-white/[0.08] pl-2.5">
                <span className="text-[10px] text-[#8b8b94] font-semibold block flex items-center gap-1">
                  <Calendar size={10} className="text-rose-400" />
                  Publicación IG:
                </span>
                <span className="text-white font-mono font-bold text-[11px]">
                  {post.fecha || 'Sin fecha'}
                </span>
              </div>
            </div>

            {/* Enlaces de Trabajo: Proyecto Canva + Referente Notion */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                {isEditingCanva ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="url"
                      value={canvaInput}
                      onChange={(e) => setCanvaInput(e.target.value)}
                      placeholder="Pega link de Canva o Figma..."
                      className="flex-1 bg-black border border-purple-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveCanvaLink(post.id)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingCanvaId(null)}
                      className="text-xs text-[#8b8b94] hover:text-white px-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 w-full">
                    <a
                      href={post.editableLink || `https://www.canva.com/search?q=bitaxus`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 text-[11px] font-bold transition-all truncate"
                      title="Abrir diseño editable en Canva/Figma para trabajar a cualquier hora"
                    >
                      <Palette size={12} className="text-purple-400 shrink-0" />
                      <span className="truncate">Proyecto Canva / Editable</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingCanvaId(post.id);
                        setCanvaInput(post.editableLink || '');
                      }}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8b8b94] hover:text-white border border-white/10 text-[10px]"
                      title="Cambiar link de Canva"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>

              {post.linkReferente && (
                <a
                  href={post.linkReferente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                  title="Abrir ficha del repositorio de 50 contenidos en Notion"
                >
                  <Link2 size={11} className="text-[#ff4d57]" />
                  <span>Referente Notion (Banco de 50)</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Selector de Estado de Aprobación en la Card */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-[#8b8b94] uppercase tracking-wider block mb-1.5">
                Estado de Aprobación:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => onUpdateEstado(post.id, 'Aprobado')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                    (post.estadoAprobacion || 'Aprobado') === 'Aprobado'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-[#8b8b94] hover:text-white'
                  }`}
                >
                  <span>✅ Aprobado</span>
                </button>

                <button
                  onClick={() => onUpdateEstado(post.id, 'En corrección')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                    post.estadoAprobacion === 'En corrección'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-[#8b8b94] hover:text-white'
                  }`}
                >
                  <span>⚠️ Corrección</span>
                </button>

                <button
                  onClick={() => onUpdateEstado(post.id, 'Desaprobado')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                    post.estadoAprobacion === 'Desaprobado'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-[#8b8b94] hover:text-white'
                  }`}
                >
                  <span>❌ Rechazado</span>
                </button>
              </div>
            </div>

            {/* Casilla de Notas / Feedback Directo en la Card (Para Valentina u OnTarget a las 3am) */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <MessageSquare size={11} />
                  Notas de Feedback (3am / Diario):
                </span>
                {hasFeedback && (
                  <span className="text-[9px] text-emerald-400 font-bold">● Con notas</span>
                )}
              </div>

              <textarea
                rows={2}
                value={cardFeedback[post.id] !== undefined ? cardFeedback[post.id] : (post.notasFeedback || '')}
                onChange={(e) => setCardFeedback(prev => ({ ...prev, [post.id]: e.target.value }))}
                placeholder="Escribe cambios o notas aquí para Valentina/Aleja..."
                className="w-full bg-[#090a10] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-[#8b8b94]/50 focus:outline-none focus:border-amber-400 resize-none font-sans"
              />

              <div className="flex items-center justify-between pt-0.5">
                <button
                  onClick={() => handleSaveCardFeedback(post.id)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                    isSavedFeedback
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Save size={11} />
                  <span>{isSavedFeedback ? '¡Nota Guardada!' : 'Guardar Nota'}</span>
                </button>

                <button
                  onClick={() => onPreviewReferente(post)}
                  className="text-[11px] text-[#8b8b94] hover:text-white font-medium flex items-center gap-1"
                >
                  <span>Ver todas las láminas</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>

          </div>

          {/* Footer de la Card: Responsable y Copiar Copy */}
          <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8b8b94]">
            <span className="flex items-center gap-1 font-medium">
              <User size={11} className="text-[#c1121f]" />
              {post.responsable || 'Alejandra'}
            </span>

            {copyText && (
              <button
                onClick={(e) => handleCopy(copyText, post.id, e)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  copiedId === post.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                }`}
                title="Copiar texto del guión"
              >
                {copiedId === post.id ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId === post.id ? '¡Copiado!' : 'Copiar Copy'}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    );
  };

  const hasActiveFilters = searchTerm !== '' || filterEtapa !== 'todas' || filterPilar !== 'todos' || filterAprobacion !== 'todos' || cardLayout !== 'grid';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterEtapa('todas');
    setFilterPilar('todos');
    setFilterAprobacion('todos');
    setCardLayout('grid');
  };

  return (
    <div className="space-y-8">
      
      {/* =========================================================================
          SECCIÓN 1: LOS 3 POSTS FIJADOS EN EL PERFIL DE INSTAGRAM (ACUERDO ONTARGET)
          ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#181512] to-amber-500/10 border-2 border-amber-400/40 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-400/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-black shadow-lg shadow-amber-400/30">
              <Pin size={18} className="fill-black" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <span>3 Posts Fijados en el Perfil de Instagram</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {pinnedPosts.length} de 3 seleccionados
                </span>
              </h2>
              <p className="text-xs text-amber-200/80 font-medium">
                "Para que cuando la gente llegue al perfil sepa qué hace Bitaxus" (Acuerdo OnTarget Administrativo)
              </p>
            </div>
          </div>

          <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
            📌 Fijos en el Feed
          </span>
        </div>

        {/* Los 3 slots para los posts fijados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIdx) => {
            const pinnedPost = pinnedPosts[slotIdx];

            if (pinnedPost) {
              const pilarInfo = getPilarInfo(pinnedPost.pilar || pinnedPost.producto);
              return (
                <div
                  key={pinnedPost.id}
                  className="rounded-2xl bg-[#0f1018] border border-amber-400/40 p-3.5 flex flex-col justify-between gap-3 shadow-lg relative group hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0 border border-amber-400/30 relative">
                      {pinnedPost.coverImage ? (
                        <img src={pinnedPost.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-amber-400">#0{slotIdx + 1}</div>
                      )}
                      <span className="absolute top-1 left-1 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                        #{slotIdx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border mb-1 truncate ${pilarInfo.badge}`}>
                        <span>{pilarInfo.icon}</span>
                        <span className="truncate">{pilarInfo.label}</span>
                      </span>
                      <h5 className="text-xs font-bold text-white leading-tight line-clamp-2">
                        {pinnedPost.hook || pinnedPost.pieza}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <button
                      onClick={() => onPreviewReferente(pinnedPost)}
                      className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Eye size={12} />
                      <span>Ver Láminas</span>
                    </button>

                    <button
                      onClick={() => onTogglePin(pinnedPost.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition-all"
                      title="Quitar este post de los fijados"
                    >
                      Desfijar
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slotIdx}
                className="rounded-2xl border-2 border-dashed border-amber-400/20 p-6 flex flex-col items-center justify-center text-center gap-2 text-amber-200/50 bg-black/20"
              >
                <Pin size={24} className="opacity-40" />
                <span className="text-xs font-bold">Slot #{slotIdx + 1} Libre para Fijar</span>
                <span className="text-[10px] text-[#8b8b94]">
                  Haz clic en el botón 📌 "Fijar" de cualquier post abajo
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECCIÓN 2: CENTRO DE COMANDO & FILTROS
          ========================================================================= */}
      <div className="rounded-3xl bg-[#0e0f17] border border-white/[0.08] p-5 shadow-2xl space-y-4">
        
        {/* Fila 1: Título y Selector de Modo de Tarjetas */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
          
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#c1121f]"></span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Planificador de Contenidos · Semanal & Feed
              </h3>
              <p className="text-xs text-[#8b8b94]">
                {filteredPosts.length} de {posts.length} publicaciones disponibles
              </p>
            </div>
          </div>

          {/* Selector de Modo de Visualización de Cards */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 self-start lg:self-auto">
            <button
              onClick={() => setCardLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cardLayout === 'grid'
                  ? 'bg-gradient-to-r from-[#c1121f] to-[#d61a28] text-white shadow-md'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
              title="Vista en cuadrícula amplia con todo el detalle de cada post"
            >
              <LayoutGrid size={13} />
              <span>Tarjetas Amplias</span>
            </button>

            <button
              onClick={() => setCardLayout('days')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cardLayout === 'days'
                  ? 'bg-gradient-to-r from-[#c1121f] to-[#d61a28] text-white shadow-md'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
              title="Vista de columnas agrupadas por día"
            >
              <Columns size={13} />
              <span>Por Días (Lun - Dom)</span>
            </button>

            <button
              onClick={() => setCardLayout('pinned')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cardLayout === 'pinned'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-amber-300 hover:text-amber-200'
              }`}
              title="Ver solo los posts fijados en el perfil"
            >
              <Pin size={13} className={cardLayout === 'pinned' ? 'fill-black' : ''} />
              <span>Fijados ({pinnedPosts.length})</span>
            </button>
          </div>

        </div>

        {/* Fila 2: Barra de Búsqueda y Filtros Rápidos */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b94]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por gancho, palabra clave, lámina o pilar..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8b8b94]/60 focus:outline-none focus:border-[#c1121f] transition-all"
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

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filtro Etapa */}
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
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
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
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

        {/* Fila 3: Chips de Pilares Temáticos (Sin truncar) */}
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
          SECCIÓN 3: RENDERIZADO DE LAS CARDS (MODO GRID AMPLIO O MODALIDAD POR DÍAS)
          ========================================================================= */}
      {cardLayout === 'grid' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
              Publicaciones Detalladas ({filteredPosts.length})
            </h3>
            <span className="text-xs text-[#8b8b94]">
              Vista amplia con doble fecha, enlace Canva y caja de notas en cada pieza
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredPosts.map(post => renderCard(post))}
          </div>
        </div>
      )}

      {cardLayout === 'pinned' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-amber-400/20">
            <h3 className="text-base font-black text-amber-300 uppercase tracking-wider font-sans flex items-center gap-2">
              <Pin size={16} className="fill-amber-300" />
              <span>Publicaciones Seleccionadas para Fijar en el Perfil ({pinnedPosts.length})</span>
            </h3>
            <span className="text-xs text-amber-200/80">
              Estas son las piezas ancladas fijas en la cabecera de la cuenta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedPosts.map(post => renderCard(post))}
          </div>
        </div>
      )}

      {cardLayout === 'days' && (
        <div className="space-y-8">
          {activeSemanas.map((semana) => {
            const semanaPosts = filteredPosts.filter(p => p.semana === semana);

            return (
              <div key={semana} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#c1121f] to-[#ff4d57]"></div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans">
                      {semana}
                    </h3>
                  </div>
                  <span className="text-xs text-[#8b8b94] font-bold">
                    {semanaPosts.length} piezas programadas
                  </span>
                </div>

                {/* Columnas con ancho mínimo garantizado para que no se corte nada */}
                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin">
                  {DIAS_ORDEN.map((dia) => {
                    const postsDelDia = filteredPosts.filter(p => p.semana === semana && p.dia === dia);
                    const fechaDia = postsDelDia[0]?.fecha ? postsDelDia[0].fecha.split('-').slice(1).join('/') : '';

                    return (
                      <div
                        key={dia}
                        className="flex flex-col rounded-3xl bg-[#0a0b12] border border-white/[0.08] min-w-[340px] max-w-[380px] overflow-hidden shadow-lg shrink-0"
                      >
                        {/* Header del día */}
                        <div className="p-3.5 bg-[#141522] border-b border-white/[0.06] flex items-center justify-between">
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            {dia}
                          </span>
                          {fechaDia && (
                            <span className="text-xs font-bold text-[#8b8b94] font-mono bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                              {fechaDia}
                            </span>
                          )}
                        </div>

                        {/* Publicaciones del día */}
                        <div className="p-3 space-y-4 flex-1">
                          {postsDelDia.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-[#8b8b94]/40 text-xs">
                              Sin publicaciones este día
                            </div>
                          ) : (
                            postsDelDia.map(post => renderCard(post))
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
      )}

    </div>
  );
}

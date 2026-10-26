import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Pin, 
  Palette, 
  Eye, 
  LayoutGrid, 
  Columns, 
  Clock, 
  Calendar, 
  MessageSquare, 
  User, 
  RotateCcw,
  Mail
} from 'lucide-react';
import CardPreview from './CardPreview.jsx';
import { sendInstantEmailNotification } from '../services/notificationService.js';

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Enlace público de vista de Canva (…/design/ID/TOKEN/view) -> versión incrustable en vivo
const getCanvaEmbedUrl = (post) => {
  const candidates = [post.viewLink, post.editableLink];
  for (const link of candidates) {
    // El token del diseño es el mismo en /edit y en /view
    const m = typeof link === 'string' && link.match(/^(https:\/\/(?:www\.)?canva\.com\/design\/[^/]+\/[^/?#]+)\/(?:view|edit)/);
    if (m) return m[1] + '/view?embed';
  }
  return null;
};

export default function FeedMatrixView({
  posts,
  pinnedPosts = [],
  selectedSemana,
  onTogglePin,
  onUpdatePostData,
  onEditPost,
  onPreviewReferente,
  onUpdateEstado,
  onOpenNotification
}) {
  const [copiedId, setCopiedId] = useState(null);
  const semanasDisponibles = Array.from(new Set(posts.map(p => p.semana).filter(Boolean))).sort();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('todas');
  const [filterPilar, setFilterPilar] = useState('todos');
  const [filterAprobacion, setFilterAprobacion] = useState('todos');
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'days' | 'pinned'
  const [cardFeedback, setCardFeedback] = useState({});
  const [savedFeedbackIds, setSavedFeedbackIds] = useState({});
  const [selectedAuthor, setSelectedAuthor] = useState(() => {
    try {
      return localStorage.getItem('bitaxus_feedback_author') || 'Alejandra Gómez';
    } catch (e) {
      return 'Alejandra Gómez';
    }
  });

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
    const post = posts.find(p => p.id === postId);
    if (text !== undefined && post) {
      let trimmed = text.trim();
      if (trimmed && !trimmed.startsWith('[')) {
        trimmed = `[${selectedAuthor}]: ${trimmed}`;
        setCardFeedback(prev => ({ ...prev, [postId]: trimmed }));
      }
      onUpdatePostData(postId, { notasFeedback: trimmed });
      setSavedFeedbackIds(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setSavedFeedbackIds(prev => ({ ...prev, [postId]: false }));
      }, 2500);

      // Enviar notificación instantánea a socialmedia@bitaxus.com en segundo plano
      if (trimmed) {
        sendInstantEmailNotification({
          post,
          feedback: trimmed,
          estado: post.estadoAprobacion,
          autor: selectedAuthor
        });
      }
    }
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

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      // Filtrar por semana si se seleccionó una semana específica
      if (selectedSemana && selectedSemana !== 'todas' && p.semana !== selectedSemana) {
        return false;
      }

      if (viewLayout === 'pinned' && !p.isPinned) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const mHook = p.hook?.toLowerCase().includes(q);
        const mPieza = p.pieza?.toLowerCase().includes(q);
        const mCopy = p.copyAprobado?.toLowerCase().includes(q) || p.guionCopy?.toLowerCase().includes(q);
        const mPilar = p.pilar?.toLowerCase().includes(q) || p.producto?.toLowerCase().includes(q);
        if (!mHook && !mPieza && !mCopy && !mPilar) return false;
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
  }, [posts, selectedSemana, searchTerm, filterEtapa, filterPilar, filterAprobacion, viewLayout]);

  const hasActiveFilters = searchTerm !== '' || filterEtapa !== 'todas' || filterPilar !== 'todos' || filterAprobacion !== 'todos' || viewLayout !== 'grid';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterEtapa('todas');
    setFilterPilar('todos');
    setFilterAprobacion('todos');
    setViewLayout('grid');
  };

  // Renderizador limpio y minimalista de cada tarjeta
  const renderCard = (post) => {
    const isMañana = post.turno?.includes('1');
    const isPinned = !!post.isPinned;
    const copyText = post.copyAprobado || post.guionCopy || post.hook || '';
    const currentStatus = post.estadoAprobacion || 'Aprobado';
    const hasFeedback = (post.notasFeedback && post.notasFeedback.trim().length > 0) || (cardFeedback[post.id] && cardFeedback[post.id].trim().length > 0);
    const isSavedFeedback = savedFeedbackIds[post.id];

    return (
      <div
        key={post.id}
        className={`group bg-[#121215] rounded-md border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
          isPinned ? 'border-zinc-500 ring-1 ring-zinc-500/40' : 'border-white/[0.08] hover:border-white/20'
        }`}
      >
        <div>
          
          {/* Thumbnail / Header */}
          <div className={`relative ${(getCanvaEmbedUrl(post) || post.slides?.length) ? 'aspect-[4/5]' : 'aspect-[16/10]'} bg-[#0c0c0e] border-b border-white/[0.06] overflow-hidden`}>
            <CardPreview post={post} embedUrl={getCanvaEmbedUrl(post)} />

            {/* Turno Label (Sin emojis) */}
            <div className="absolute top-2 left-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/80 text-zinc-300 backdrop-blur-sm border border-white/10">
                {isMañana ? 'T1 · 09:00' : 'T2 · 17:00'}
              </span>
            </div>

            {/* Pin Button & Status Indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={() => onTogglePin(post.id)}
                className={`p-1 rounded backdrop-blur-sm transition-colors border ${
                  isPinned
                    ? 'bg-white text-black border-white'
                    : 'bg-black/60 text-zinc-400 hover:text-white border-white/10'
                }`}
                title={isPinned ? 'Desfijar de las 3 piezas del perfil' : 'Fijar en perfil de Instagram'}
              >
                <Pin size={11} className={isPinned ? 'fill-black' : ''} />
              </button>

              <span className={`px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm border ${
                currentStatus === 'Aprobado' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' :
                currentStatus === 'En proceso' ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' :
                'bg-rose-950/60 text-rose-300 border-rose-800/50'
              }`}>
                {currentStatus}
              </span>
            </div>

            {/* Hover overlay para ver láminas */}
            <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${(getCanvaEmbedUrl(post) || post.slides?.length) ? 'bottom-8 right-2' : 'inset-0 bg-black/60'}`}>
              <button
                onClick={() => onPreviewReferente(post)}
                className="px-3 py-1.5 rounded bg-white text-zinc-900 text-xs font-medium flex items-center gap-1.5 shadow-md"
              >
                <Eye size={13} />
                <span>Ver guion y láminas</span>
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-3">
            
            {/* Meta Line: Pilar & Etapa */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="truncate max-w-[180px] text-zinc-300 font-medium">
                {post.pilar || post.producto}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {post.etapa || 'Atracción'}
              </span>
            </div>

            {/* Title / Hook */}
            <h4 className="text-xs font-medium text-white leading-snug line-clamp-2">
              {post.hook || post.pieza}
            </h4>

            {/* Doble Fecha: Solicitud vs Publicación */}
            <div className="p-2 rounded bg-black/40 border border-white/[0.06] text-[10px] font-mono grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-500 block">Solicitado:</span>
                <input
                  type="date"
                  value={post.fechaEntrega || ''}
                  onChange={(e) => e.target.value && onUpdatePostData(post.id, { fechaEntrega: e.target.value })}
                  title="Cambiar fecha de solicitud (se guarda en Notion)"
                  className="bg-transparent text-zinc-300 text-[10px] font-mono focus:outline-none cursor-pointer w-full"
                />
              </div>
              <div>
                <span className="text-zinc-500 block">Publicación:</span>
                <input
                  type="date"
                  value={post.fecha || ''}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const dia = dias[new Date(e.target.value + 'T00:00:00').getDay()];
                    onUpdatePostData(post.id, { fecha: e.target.value, dia });
                  }}
                  title="Cambiar fecha de publicación (se guarda en Notion)"
                  className="bg-transparent text-white font-medium text-[10px] font-mono focus:outline-none cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Links Rápidos: Canva & Notion */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <a
                href={post.editableLink || 'https://www.canva.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1 px-2 rounded border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                title="Abrir editable en Canva"
              >
                <Palette size={11} />
                <span>Canva editable</span>
              </a>

              {post.linkReferente && (
                <a
                  href={post.linkReferente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1 px-2 rounded border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                  title="Ficha referente Notion"
                >
                  <ExternalLink size={11} />
                  <span>Referente Notion</span>
                </a>
              )}
            </div>

            {/* Selector de Estado */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              {['Aprobado', 'En proceso', 'Corrección'].map(st => (
                <button
                  key={st}
                  onClick={() => onUpdateEstado(post.id, st)}
                  className={`py-1 rounded text-[10px] font-medium transition-colors border ${
                    currentStatus === st
                      ? 'bg-white/[0.14] text-white border-white/25'
                      : 'bg-transparent text-zinc-500 hover:text-zinc-300 border-white/[0.06]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Casilla de Notas / Feedback */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span className="text-zinc-500">Comenta:</span>
                <select
                  value={selectedAuthor}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAuthor(val);
                    try { localStorage.setItem('bitaxus_feedback_author', val); } catch(err){}
                  }}
                  className="bg-[#0a0a0c] text-zinc-300 border border-white/[0.08] rounded px-1.5 py-0.5 text-[10px] focus:outline-none cursor-pointer"
                >
                  <option value="Alejandra Gómez">Alejandra Gómez</option>
                  <option value="Alejandra Torres">Alejandra Torres</option>
                  <option value="Valentina">Valentina</option>
                  <option value="Laura">Laura</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={cardFeedback[post.id] !== undefined ? cardFeedback[post.id] : (post.notasFeedback || '')}
                onChange={(e) => setCardFeedback(prev => ({ ...prev, [post.id]: e.target.value }))}
                placeholder={`Escribir nota como ${selectedAuthor}...`}
                className="w-full bg-[#0a0a0c] border border-white/[0.08] focus:border-white/30 rounded p-2 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between text-[10px]">
                <button
                  onClick={() => handleSaveCardFeedback(post.id)}
                  className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
                    isSavedFeedback
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                  title="Guardar comentario y notificar inmediatamente a socialmedia@bitaxus.com"
                >
                  <Mail size={10} />
                  <span>{isSavedFeedback ? 'Guardado y notificado' : 'Guardar y notificar'}</span>
                </button>
                {hasFeedback && (
                  <span className="text-zinc-500 font-mono">Con notas</span>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 border-t border-white/[0.06] bg-black/20 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <User size={11} />
            <span>{post.responsable || 'Alejandra'}</span>
          </span>

          <select
            value={post.semana || ''}
            onChange={(e) => onUpdatePostData(post.id, { semana: e.target.value })}
            title="Mover este post a otra semana (se guarda en Notion)"
            className="bg-[#0a0a0c] text-zinc-400 border border-white/[0.08] rounded px-1 py-0.5 text-[10px] focus:outline-none cursor-pointer"
          >
            {semanasDisponibles.map(sem => (
              <option key={sem} value={sem}>Mover: {sem}</option>
            ))}
          </select>

          <button
            onClick={(e) => handleCopy(copyText, post.id, e)}
            className="hover:text-white transition-colors"
            title="Copiar texto"
          >
            {copiedId === post.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Módulo Sobrio: 3 Posts Fijados en el Perfil de Instagram */}
      <div className="bg-[#121215] border border-white/[0.08] rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <Pin size={13} className="text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Publicaciones fijadas en el perfil de Instagram (Lanzamiento)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {pinnedPosts.length} de 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => {
            const p = pinnedPosts[idx];

            if (p) {
              return (
                <div
                  key={p.id}
                  className="p-3 rounded border border-white/[0.08] bg-black/30 flex items-start justify-between gap-3 text-left"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Posición 0{idx + 1}</span>
                      <span>{p.id}</span>
                    </div>
                    <h4 className="text-xs font-medium text-white line-clamp-1">
                      {p.hook || p.pieza}
                    </h4>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {p.pilar || p.producto}
                    </span>
                  </div>

                  <button
                    onClick={() => onTogglePin(p.id)}
                    className="text-[10px] text-zinc-500 hover:text-white px-1.5 py-0.5 rounded border border-white/10 hover:border-white/30 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="p-3 rounded border border-dashed border-white/10 flex items-center justify-center text-center text-zinc-600 text-[11px]"
              >
                Slot 0{idx + 1} libre
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Barra de Control y Filtros Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] p-3 rounded-md border border-white/[0.08]">
        
        {/* Buscador */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative w-52 sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por hook, copy o pilar..."
              className="w-full bg-[#0a0a0c] border border-white/[0.08] focus:border-white/30 rounded px-2.5 pl-7 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Etapa */}
          <select
            value={filterEtapa}
            onChange={(e) => setFilterEtapa(e.target.value)}
            className="bg-[#0a0a0c] border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 font-medium cursor-pointer"
          >
            <option value="todas">Todas las etapas</option>
            <option value="Atracción">Atracción</option>
            <option value="Validación">Validación</option>
            <option value="Venta">Venta</option>
          </select>

          {/* Aprobación */}
          <select
            value={filterAprobacion}
            onChange={(e) => setFilterAprobacion(e.target.value)}
            className="bg-[#0a0a0c] border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 font-medium cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="Aprobado">Aprobado</option>
            <option value="En proceso">En proceso</option>
            <option value="Corrección">Corrección</option>
          </select>

          {/* Pilar */}
          <select
            value={filterPilar}
            onChange={(e) => setFilterPilar(e.target.value)}
            className="bg-[#0a0a0c] border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 font-medium cursor-pointer max-w-[160px] truncate"
          >
            {pilaresList.map(pil => (
              <option key={pil} value={pil}>{pil === 'todos' ? 'Todos los pilares' : pil}</option>
            ))}
          </select>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded"
              title="Restablecer filtros"
            >
              Limpiar
            </button>
          )}

          <div className="flex items-center bg-[#0a0a0c] p-0.5 rounded border border-white/[0.08]">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1 rounded transition-colors ${
                viewLayout === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Vista cuadrícula"
            >
              <LayoutGrid size={14} />
            </button>

            <button
              onClick={() => setViewLayout('days')}
              className={`p-1 rounded transition-colors ${
                viewLayout === 'days' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Vista por días de la semana"
            >
              <Columns size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Grid de Publicaciones */}
      {viewLayout === 'grid' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              {selectedSemana === 'todas' ? 'Todas las semanas' : selectedSemana}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {filteredPosts.length} publicaciones
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 bg-[#121215] rounded-md border border-white/[0.06]">
              No hay publicaciones que coincidan con los filtros seleccionados para {selectedSemana}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPosts.map(post => renderCard(post))}
            </div>
          )}
        </div>
      )}

      {/* 4. Columnas por Días (Lunes a Domingo) con Ancho Amplio */}
      {viewLayout === 'days' && (
        <div className="space-y-6">
          {activeSemanas.map((semana) => {
            const semanaPosts = filteredPosts.filter(p => p.semana === semana);

            return (
              <div key={semana} className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    {semana}
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    {semanaPosts.length} publicaciones
                  </span>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-thin">
                  {DIAS_ORDEN.map((dia) => {
                    const postsDelDia = filteredPosts.filter(p => p.semana === semana && p.dia === dia);
                    const fechaDia = postsDelDia[0]?.fecha ? postsDelDia[0].fecha.split('-').slice(1).join('/') : '';

                    return (
                      <div
                        key={dia}
                        className="bg-[#0e0e11] rounded border border-white/[0.08] min-w-[320px] max-w-[360px] p-3 flex flex-col justify-between shrink-0"
                      >
                        <div className="border-b border-white/[0.06] pb-2 mb-3 flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300">{dia}</span>
                          <span className="font-mono text-zinc-500">{fechaDia}</span>
                        </div>

                        <div className="space-y-3 flex-1">
                          {postsDelDia.length === 0 ? (
                            <div className="p-6 text-center text-xs text-zinc-600 border border-dashed border-white/[0.06] rounded">
                              Sin publicaciones
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

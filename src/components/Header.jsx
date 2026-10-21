import React from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar, Table, RefreshCw, Plus, Mail, LogOut } from 'lucide-react';

export default function Header({
  activeView,
  setActiveView,
  selectedSemana,
  setSelectedSemana,
  semanas,
  onSync,
  isSyncing,
  onNewPost,
  totalPosts = 0,
  aprobadosCount = 0,
  onOpenNotificationConfig,
  onLogout
}) {
  const currentIdx = semanas.indexOf(selectedSemana);

  const prevSemana = () => {
    if (currentIdx > 0) setSelectedSemana(semanas[currentIdx - 1]);
  };

  const nextSemana = () => {
    if (currentIdx < semanas.length - 1) setSelectedSemana(semanas[currentIdx + 1]);
  };

  return (
    <header className="h-14 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-40 px-6 flex items-center justify-between">
      
      {/* Brand & Workspace */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src="./logo.png"
            alt="Bitaxus"
            className="h-6 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-6 h-6 rounded bg-zinc-800 text-white font-bold text-xs items-center justify-center">
            B
          </div>
          <span className="text-xs font-semibold text-white tracking-tight">
            Bitaxus Content
          </span>
        </div>

        <span className="text-white/20">/</span>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>{totalPosts} publicaciones</span>
          <span className="text-white/20">·</span>
          <span className="text-zinc-200 font-medium">{aprobadosCount} aprobadas</span>
        </div>
      </div>

      {/* Controls: Week, Views, Actions */}
      <div className="flex items-center gap-3">
        
        {/* Week Selector */}
        <div className="flex items-center border border-white/[0.08] bg-[#121215] rounded-md overflow-hidden">
          <button
            onClick={prevSemana}
            disabled={currentIdx <= 0}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
            title="Semana anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <select
            value={selectedSemana}
            onChange={(e) => setSelectedSemana(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 font-medium px-2 py-1 focus:outline-none cursor-pointer"
          >
            {semanas.map((s) => (
              <option key={s} value={s} className="bg-[#121215] text-white">{s}</option>
            ))}
            <option value="todas" className="bg-[#121215] text-white">Todas las semanas</option>
          </select>
          <button
            onClick={nextSemana}
            disabled={currentIdx >= semanas.length - 1}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
            title="Siguiente semana"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center bg-[#121215] p-0.5 rounded-md border border-white/[0.08]">
          <button
            onClick={() => setActiveView('planner')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'planner'
                ? 'bg-white/[0.12] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setActiveView('month')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'month'
                ? 'bg-white/[0.12] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Mes</span>
          </button>

          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'table'
                ? 'bg-white/[0.12] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Table size={13} />
            <span>Tabla</span>
          </button>
        </div>

        {/* Actions */}
        <button
          onClick={onOpenNotificationConfig}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/[0.08] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors text-[11px]"
          title="Notificaciones automáticas a socialmedia@bitaxus.com"
        >
          <Mail size={12} className="text-zinc-400" />
          <span className="font-mono text-[10px]">socialmedia@bitaxus.com</span>
        </button>

        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-1.5 rounded-md border border-white/[0.08] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          title="Sincronizar"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={onNewPost}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-medium transition-colors"
        >
          <Plus size={13} />
          <span>Nuevo post</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md border border-white/[0.08] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={13} />
          </button>
        )}

      </div>

    </header>
  );
}

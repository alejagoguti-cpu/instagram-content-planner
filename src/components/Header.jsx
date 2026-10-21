import React from 'react';
import { Calendar, Table, RefreshCw, Plus, ChevronLeft, ChevronRight, LayoutGrid, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export default function Header({
  activeView,
  setActiveView,
  selectedSemana,
  setSelectedSemana,
  semanas,
  onSync,
  isSyncing,
  notionStatus,
  onNewPost,
  totalPosts = 0,
  aprobadosCount = 0
}) {
  const currentIdx = semanas.indexOf(selectedSemana);

  const prevSemana = () => {
    if (currentIdx > 0) setSelectedSemana(semanas[currentIdx - 1]);
  };

  const nextSemana = () => {
    if (currentIdx < semanas.length - 1) setSelectedSemana(semanas[currentIdx + 1]);
  };

  const percentApproved = totalPosts > 0 ? Math.round((aprobadosCount / totalPosts) * 100) : 0;

  return (
    <header className="bg-[#090a0f]/95 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-[1850px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c1121f] to-rose-600 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative flex items-center bg-[#11121a] p-1.5 rounded-xl border border-white/10">
              <img
                src="./logo.png"
                alt="Bitaxus"
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-7 h-7 rounded-lg bg-[#c1121f] text-white font-black items-center justify-center text-sm">
                B
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider text-white uppercase font-sans">
                CONTENT STUDIO
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c1121f]/15 text-[#ff4d57] border border-[#c1121f]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57] animate-pulse"></span>
                Vitaxus · Oct/Nov
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10">
                {totalPosts} piezas
              </span>
            </div>
            <p className="text-[11px] text-[#8b8b94] font-medium flex items-center gap-1.5">
              <span>Planificador estratégico de Instagram</span>
              <span className="text-white/20">·</span>
              <span className="text-emerald-400 font-semibold">{percentApproved}% Aprobado</span>
            </p>
          </div>
        </div>

        {/* Center / Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Week Selector with Navigation */}
          <div className="flex items-center bg-[#12131c] p-1 rounded-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={prevSemana}
              disabled={currentIdx <= 0}
              className="p-1.5 rounded-lg text-[#8b8b94] hover:text-white hover:bg-white/5 disabled:opacity-25 transition-all"
              title="Semana anterior"
            >
              <ChevronLeft size={15} />
            </button>

            <select
              value={selectedSemana}
              onChange={(e) => setSelectedSemana(e.target.value)}
              className="bg-transparent text-white text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer tracking-wide"
            >
              {semanas.map((s) => (
                <option key={s} value={s} className="bg-[#12131c] text-white">{s}</option>
              ))}
              <option value="todas" className="bg-[#12131c] text-white">Todas las semanas</option>
            </select>

            <button
              onClick={nextSemana}
              disabled={currentIdx >= semanas.length - 1}
              className="p-1.5 rounded-lg text-[#8b8b94] hover:text-white hover:bg-white/5 disabled:opacity-25 transition-all"
              title="Siguiente semana"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center bg-[#12131c] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setActiveView('planner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'planner'
                  ? 'bg-gradient-to-r from-[#c1121f] to-[#d61a28] text-white shadow-md shadow-[#c1121f]/30'
                  : 'text-[#8b8b94] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Planner</span>
            </button>

            <button
              onClick={() => setActiveView('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'month'
                  ? 'bg-gradient-to-r from-[#c1121f] to-[#d61a28] text-white shadow-md shadow-[#c1121f]/30'
                  : 'text-[#8b8b94] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={13} />
              <span>Mes</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'table'
                  ? 'bg-gradient-to-r from-[#c1121f] to-[#d61a28] text-white shadow-md shadow-[#c1121f]/30'
                  : 'text-[#8b8b94] hover:text-white hover:bg-white/5'
              }`}
            >
              <Table size={13} />
              <span>Tabla</span>
            </button>
          </div>

          {/* Sync & New Post Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12131c] hover:bg-[#1a1b26] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-slate-200 transition-all shadow-sm disabled:opacity-50"
              title="Sincronizar con Notion"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin text-[#ff4d57]' : 'text-[#8b8b94]'} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Sincronizando' : 'Sincronizar'}
              </span>
            </button>

            <button
              onClick={onNewPost}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#e0202e] hover:from-[#d61a28] hover:to-[#ef233c] text-white text-xs font-black shadow-lg shadow-[#c1121f]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Nueva Pieza</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}

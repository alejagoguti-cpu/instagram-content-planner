import React from 'react';
import { Calendar, Table, RefreshCw, Plus, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

export default function Header({
  activeView,
  setActiveView,
  selectedSemana,
  setSelectedSemana,
  semanas,
  onSync,
  isSyncing,
  notionStatus,
  onNewPost
}) {
  const currentIdx = semanas.indexOf(selectedSemana);

  const prevSemana = () => {
    if (currentIdx > 0) setSelectedSemana(semanas[currentIdx - 1]);
  };

  const nextSemana = () => {
    if (currentIdx < semanas.length - 1) setSelectedSemana(semanas[currentIdx + 1]);
  };

  return (
    <header className="bg-[#09090a]/90 backdrop-blur-md border-b border-[#232327] sticky top-0 z-30 px-6 py-4">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Logo y título de marca Bitaxus */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center">
            <img
              src="./logo.png"
              alt="Bitaxus"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-8 h-8 rounded-lg bg-[#c1121f] text-white font-black items-center justify-center text-base">
              B
            </div>
          </div>
          <div className="h-6 w-[1px] bg-[#232327]"></div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-black tracking-wider text-white uppercase font-sans">
                PLANNER DE CONTENIDOS
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c1121f]/15 text-[#ff4d57] border border-[#c1121f]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57] animate-pulse"></span>
                Bitaxus · Instagram
              </span>
            </div>
            <p className="text-[11px] text-[#8b8b94] font-medium">
              Feed mensual, copys aprobados y banco de láminas
            </p>
          </div>
        </div>

        {/* Controles de vista y semana */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Selector de Semana con botones Anterior / Siguiente */}
          <div className="flex items-center bg-[#111113] p-1 rounded-xl border border-[#232327] shadow-inner">
            <button
              onClick={prevSemana}
              disabled={currentIdx <= 0}
              className="p-1.5 rounded-lg text-[#8b8b94] hover:text-white disabled:opacity-30 transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <select
              value={selectedSemana}
              onChange={(e) => setSelectedSemana(e.target.value)}
              className="bg-transparent text-white text-xs font-black rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {semanas.map((s) => (
                <option key={s} value={s} className="bg-[#111113] text-white">{s}</option>
              ))}
              <option value="todas" className="bg-[#111113] text-white">Todas las semanas</option>
            </select>
            <button
              onClick={nextSemana}
              disabled={currentIdx >= semanas.length - 1}
              className="p-1.5 rounded-lg text-[#8b8b94] hover:text-white disabled:opacity-30 transition-colors"
              title="Siguiente semana"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Selector de Vistas: Feed Semanal, Calendario Mensual, Tabla */}
          <div className="flex items-center bg-[#111113] p-1 rounded-xl border border-[#232327]">
            <button
              onClick={() => setActiveView('planner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'planner'
                  ? 'bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/30'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Planner Semanal</span>
            </button>

            <button
              onClick={() => setActiveView('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'month'
                  ? 'bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/30'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Calendario Mes</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'table'
                  ? 'bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/30'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
            >
              <Table size={14} />
              <span>Tabla</span>
            </button>
          </div>

          {/* Botón Sincronizar con Notion */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] text-xs font-bold text-white transition-all shadow-sm disabled:opacity-50"
            title="Sincronizar posts con Notion"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-[#ff4d57]' : 'text-[#8b8b94]'} />
            <span className="hidden sm:inline">
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </span>
          </button>

          {/* Botón Nueva Pieza */}
          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#c1121f] to-[#d61a28] hover:from-[#d61a28] hover:to-[#e0202e] text-white text-xs font-black shadow-lg shadow-[#c1121f]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>Nueva Pieza</span>
          </button>

        </div>

      </div>
    </header>
  );
}

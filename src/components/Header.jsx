import React from 'react';
import { Calendar, Table, RefreshCw, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

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
  return (
    <header className="bg-black/60 backdrop-blur-md border-b border-[#232327] sticky top-0 z-30 px-6 py-3.5">
      <div className="max-w-[1750px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Logo y título de marca Bitaxus */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center">
            <img
              src="./logo.png"
              alt="Bitaxus"
              className="h-7 w-auto object-contain"
              onError={(e) => {
                // Fallback si no carga el logo
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-8 h-8 rounded-lg bg-[#c1121f] text-white font-extrabold items-center justify-center text-base">
              B
            </div>
          </div>
          <div className="h-5 w-[1px] bg-[#2e2e33]"></div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-extrabold tracking-wider text-white uppercase font-sans">
                PLANNER CONTENIDO FEED
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c1121f]/15 text-[#ff4d57] border border-[#c1121f]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57] animate-pulse"></span>
                Bitaxus & Notion
              </span>
            </div>
            <p className="text-[11px] text-[#8b8b94] font-medium">
              Calendario de publicación, guiones y banco de referentes
            </p>
          </div>
        </div>

        {/* Controles y botones de acción estilo Bitaxus */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Selector de Semana */}
          <div className="flex items-center gap-2 bg-[#18181b] p-1 rounded-xl border border-[#2e2e33]">
            <span className="text-[11px] font-semibold text-[#8b8b94] pl-2 uppercase tracking-wide">Semana:</span>
            <select
              value={selectedSemana}
              onChange={(e) => setSelectedSemana(e.target.value)}
              className="bg-[#111113] text-white text-xs font-semibold rounded-lg px-3 py-1.5 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
            >
              {semanas.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="todas">Todas las semanas</option>
            </select>
          </div>

          {/* Toggle de vistas: Calendario vs Tabla */}
          <div className="flex items-center bg-[#18181b] p-1 rounded-xl border border-[#2e2e33]">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeView === 'calendar'
                  ? 'bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/20'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Matriz Feed</span>
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeView === 'table'
                  ? 'bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/20'
                  : 'text-[#8b8b94] hover:text-white'
              }`}
            >
              <Table size={13} />
              <span>Tabla Completa</span>
            </button>
          </div>

          {/* Botón Sincronizar Notion */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
            title="Sincronizar publicaciones desde Notion"
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin text-[#ff4d57]" : "text-[#8b8b94]"} />
            <span className="hidden sm:inline">{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
          </button>

          {/* Botón Nuevo Post */}
          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#c1121f]/25 transition-all hover:scale-[1.02] uppercase tracking-wide"
          >
            <Plus size={14} />
            <span>+ Nuevo Post</span>
          </button>

        </div>
      </div>
    </header>
  );
}

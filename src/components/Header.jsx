import React from 'react';
import { Calendar, Table, RefreshCw, Plus, CheckCircle2, AlertCircle, Instagram } from 'lucide-react';

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
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold text-xl">
            <Instagram size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                PLANNER CONTENIDO FEED INSTAGRAM
              </h1>
              {notionStatus?.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Notion Sync
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle size={12} />
                  Modo Local / Demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Sincronizado con base de datos de Notion & Banco de Referentes
            </p>
          </div>
        </div>

        {/* Controles de vista, semana y acciones */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Selector de Semana */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400 pl-2">Semana:</span>
            <select
              value={selectedSemana}
              onChange={(e) => setSelectedSemana(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {semanas.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="todas">Todas las semanas</option>
            </select>
          </div>

          {/* Toggle de vistas: Calendario vs Tabla */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'calendar'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar size={14} />
              <span>Matriz Feed</span>
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'table'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table size={14} />
              <span>Tabla Completa</span>
            </button>
          </div>

          {/* Botón Sincronizar Notion */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
            title="Sincronizar cambios desde Notion"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-rose-400" : ""} />
            <span className="hidden sm:inline">{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
          </button>

          {/* Botón Nuevo Post */}
          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={15} />
            <span>+ Nuevo Post / Referente</span>
          </button>

        </div>
      </div>
    </header>
  );
}

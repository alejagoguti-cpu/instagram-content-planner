import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Copy, Check } from 'lucide-react';

export default function CalendarMonthView({ posts, onPreviewReferente }) {
  // Encontrar el mes de los posts (Octubre / Noviembre 2026)
  const [currentDate, setCurrentDate] = useState(() => {
    const dates = posts.map(p => p.fecha).filter(Boolean).sort();
    return dates.length > 0 ? new Date(dates[0] + 'T00:00:00') : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Días del mes
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  
  // Día de la semana en que inicia el mes (0: Dom, 1: Lun, etc.)
  let startDay = firstDayOfMonth.getDay();
  // Ajustar para que inicie en Lunes (0: Lun, 6: Dom)
  startDay = (startDay + 6) % 7;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysArray = [];
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  const getPostsForDay = (day) => {
    if (!day) return [];
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const dateQuery = `${year}-${monthStr}-${dayStr}`;
    return posts.filter(p => p.fecha === dateQuery);
  };

  const getEtapaDot = (etapa) => {
    const e = etapa?.toLowerCase() || '';
    if (e.includes('atrac')) return 'bg-amber-400';
    if (e.includes('vent')) return 'bg-[#c1121f]';
    if (e.includes('valid')) return 'bg-sky-400';
    return 'bg-purple-400';
  };

  return (
    <div className="bg-[#111113] rounded-2xl border border-[#232327] overflow-hidden shadow-2xl">
      
      {/* Barra de Navegación del Mes */}
      <div className="p-4 sm:p-5 bg-[#18181b] border-b border-[#232327] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 rounded-full bg-[#c1121f]"></div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider font-sans">
            {monthNames[month]} {year}
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c1121f]/15 text-[#ff4d57] border border-[#c1121f]/30">
            Vista Calendario
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#111113] hover:bg-[#202024] border border-[#232327] text-white transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#111113] hover:bg-[#202024] border border-[#232327] text-white transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-[#232327] bg-[#141416] text-center text-xs font-black text-[#8b8b94] py-3 uppercase tracking-wider">
        <div>Lunes</div>
        <div>Martes</div>
        <div>Miércoles</div>
        <div>Jueves</div>
        <div>Viernes</div>
        <div>Sábado</div>
        <div>Domingo</div>
      </div>

      {/* Cuadrícula de Días */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#232327]">
        {daysArray.map((day, idx) => {
          const dayPosts = getPostsForDay(day);

          return (
            <div
              key={idx}
              className={`min-h-[190px] p-2.5 flex flex-col justify-between ${
                day ? 'bg-[#0c0c0e] hover:bg-[#141416]/60' : 'bg-[#09090a]/40'
              } transition-colors`}
            >
              {day ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white font-mono bg-[#18181b] w-6 h-6 rounded-lg flex items-center justify-center border border-[#2e2e33]">
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#c1121f]/20 text-[#ff4d57] border border-[#c1121f]/40">
                        {dayPosts.length} {dayPosts.length === 1 ? 'post' : 'posts'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px] pr-0.5">
                    {dayPosts.map((p) => {
                      const isMañana = p.turno?.includes('1');
                      const dot = getEtapaDot(p.etapa);

                      return (
                        <div
                          key={p.id}
                          onClick={() => onPreviewReferente(p)}
                          className="group relative p-2 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] hover:border-[#c1121f] cursor-pointer transition-all flex items-start gap-2.5 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                        >
                          {p.coverImage && (
                            <img
                              src={p.coverImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#2e2e33]"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                              <span className="text-[9px] font-bold text-[#8b8b94] uppercase tracking-wider">
                                {isMañana ? '☀️ T1' : '🌙 T2'}
                              </span>
                              {p.pilar && (
                                <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-black/40 text-slate-300 truncate max-w-[90px]">
                                  {p.pilar.replace('Bitaxus ', '').replace(' y ', '/')}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-white block truncate group-hover:text-[#ff4d57] leading-tight">
                              {p.hook || p.pieza}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

    </div>
  );
}

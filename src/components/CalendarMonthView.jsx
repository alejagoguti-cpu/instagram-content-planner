import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

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

  return (
    <div className="bg-[#111113] rounded-2xl border border-[#2e2e33] overflow-hidden shadow-2xl">
      
      {/* Barra de Navegación del Mes */}
      <div className="p-4 bg-[#18181b] border-b border-[#232327] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-sans">
            {monthNames[month]} {year}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c1121f]/20 text-[#ff4d57] border border-[#c1121f]/30">
            Vista Calendario Mensual
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-[#111113] hover:bg-[#202024] border border-[#2e2e33] text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-[#111113] hover:bg-[#202024] border border-[#2e2e33] text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-[#232327] bg-[#141416] text-center text-xs font-bold text-[#8b8b94] py-2.5 uppercase">
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
              className={`min-h-[160px] p-2 flex flex-col justify-between ${
                day ? 'bg-[#0c0c0e] hover:bg-[#141416]/50' : 'bg-[#09090a]/50'
              } transition-colors`}
            >
              {day ? (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white font-mono">
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#c1121f] text-white">
                        {dayPosts.length} posts
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[140px]">
                    {dayPosts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onPreviewReferente(p)}
                        className="p-1.5 rounded bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] hover:border-[#c1121f] cursor-pointer transition-all flex items-center gap-2 group shadow-sm"
                      >
                        {p.coverImage && (
                          <img
                            src={p.coverImage}
                            alt=""
                            className="w-7 h-7 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-white block truncate group-hover:text-[#ff4d57]">
                            {p.pieza}
                          </span>
                          <span className="text-[9px] text-[#8b8b94] block truncate">
                            {p.turno.includes('1') ? '☀️ Mañana' : '🌙 Tarde'} · {p.tipo}
                          </span>
                        </div>
                      </div>
                    ))}
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

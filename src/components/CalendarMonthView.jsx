import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarMonthView({ posts, onPreviewReferente }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const dates = posts.map(p => p.fecha).filter(Boolean).sort();
    return dates.length > 0 ? new Date(dates[0] + 'T00:00:00') : new Date('2026-10-16T00:00:00');
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  let startDay = (firstDayOfMonth.getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysArray = [];
  for (let i = 0; i < startDay; i++) daysArray.push(null);
  for (let d = 1; d <= totalDays; d++) daysArray.push(d);

  const getPostsForDay = (day) => {
    if (!day) return [];
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const dateQuery = `${year}-${monthStr}-${dayStr}`;
    return posts.filter(p => p.fecha === dateQuery);
  };

  return (
    <div className="bg-[#111114] rounded-md border border-white/[0.08] overflow-hidden space-y-0">
      
      {/* Month Navigation */}
      <div className="p-3.5 bg-[#151518] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            {monthNames[month]} {year}
          </span>
        </div>

        <div className="flex items-center gap-1 border border-white/10 rounded overflow-hidden">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-[#0c0c0e] text-left px-3 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
        <div>Dom</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.06]">
        {daysArray.map((day, idx) => {
          const dayPosts = getPostsForDay(day);

          return (
            <div
              key={idx}
              className={`min-h-[140px] p-2 flex flex-col justify-between ${
                day ? 'bg-[#111114] hover:bg-[#16161a]' : 'bg-[#09090b]'
              } transition-colors`}
            >
              {day ? (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-zinc-400">
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[110px] pr-0.5">
                    {dayPosts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onPreviewReferente(p)}
                        className="p-1.5 rounded border border-white/[0.06] bg-[#151518] hover:border-white/20 cursor-pointer transition-colors space-y-0.5 text-left"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>{p.turno?.includes('1') ? 'T1' : 'T2'}</span>
                          <span className="text-zinc-300">{p.estadoAprobacion || 'Aprobado'}</span>
                        </div>
                        <h5 className="text-[11px] font-medium text-white truncate leading-tight">
                          {p.hook || p.pieza}
                        </h5>
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

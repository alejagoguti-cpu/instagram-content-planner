import React, { useState } from 'react';
import { ExternalLink, Play, Image as ImageIcon, Copy, Check, FileText } from 'lucide-react';

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function FeedMatrixView({
  posts,
  selectedSemana,
  onEditPost,
  onPreviewReferente
}) {
  const [plannerTheme, setPlannerTheme] = useState('excel'); // 'excel' (original como la foto) | 'bitaxus' (dark)
  const [copiedId, setCopiedId] = useState(null);

  const activeSemanas = selectedSemana === 'todas'
    ? Array.from(new Set(posts.map(p => p.semana))).sort()
    : [selectedSemana];

  const handleCopyCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getEtapaStyle = (etapa, isDark) => {
    const e = etapa?.toLowerCase() || '';
    if (e.includes('atrac')) {
      return isDark ? 'bg-amber-400/25 text-amber-300 font-extrabold' : 'bg-[#ffff00] text-black font-extrabold border border-black/20';
    }
    if (e.includes('vent')) {
      return isDark ? 'bg-[#c1121f] text-white font-extrabold' : 'bg-[#00e600] text-black font-extrabold border border-black/20';
    }
    if (e.includes('valid')) {
      return isDark ? 'bg-sky-500/30 text-sky-200 font-extrabold' : 'bg-[#00ffff] text-black font-extrabold border border-black/20';
    }
    return isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-800';
  };

  const isDark = plannerTheme === 'bitaxus';

  return (
    <div className="space-y-8 font-sans">
      
      {/* Selector de estilo de visualización */}
      <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-[#2e2e33]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8b8b94] uppercase tracking-wide">Estilo visual del Planner:</span>
          <div className="flex rounded-lg overflow-hidden border border-[#2e2e33]">
            <button
              onClick={() => setPlannerTheme('excel')}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                plannerTheme === 'excel'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#18181b] text-[#8b8b94] hover:text-white'
              }`}
            >
              📊 Diseño Hoja Excel (Original)
            </button>
            <button
              onClick={() => setPlannerTheme('bitaxus')}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                plannerTheme === 'bitaxus'
                  ? 'bg-[#c1121f] text-white'
                  : 'bg-[#18181b] text-[#8b8b94] hover:text-white'
              }`}
            >
              🔥 Bitaxus Dark Mode
            </button>
          </div>
        </div>
        <div className="text-xs text-[#8b8b94]">
          Mostrando <span className="font-bold text-white">{activeSemanas.length}</span> semana(s)
        </div>
      </div>

      {activeSemanas.map((semana) => {
        const semanaPosts = posts.filter(p => p.semana === semana);
        
        // Extraer rango de fechas de la semana
        const fechas = semanaPosts.map(p => p.fecha).filter(Boolean).sort();
        const fechaRango = fechas.length > 0
          ? `${fechas[0]} — ${fechas[fechas.length - 1]}`
          : semana;

        return (
          <div
            key={semana}
            className={`rounded-xl border overflow-hidden shadow-2xl transition-all ${
              isDark ? 'bg-[#09090a] border-[#2e2e33]' : 'bg-[#fffde7] border-slate-400 text-slate-900'
            }`}
          >
            
            {/* 1. TÍTULO PRINCIPAL EXACTO A LA FOTO */}
            <div className={`py-2 px-4 text-center border-b font-extrabold text-sm sm:text-base uppercase tracking-widest ${
              isDark ? 'bg-[#111113] text-white border-[#2e2e33]' : 'bg-[#fff9c4] text-slate-900 border-slate-400 font-serif italic'
            }`}>
              PLANNER CONTENIDO FEED INSTAGRAM — {semana.toUpperCase()} ({fechaRango})
            </div>

            {/* 2. TABLA TIPO HOJA DE CÁLCULO */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1450px]">
                
                {/* ENCABEZADOS DE COLUMNA */}
                <thead>
                  <tr className={`text-center text-xs font-extrabold uppercase border-b ${
                    isDark ? 'bg-[#18181b] text-white border-[#2e2e33]' : 'bg-[#90caf9] text-slate-900 border-slate-400'
                  }`}>
                    <th className={`w-28 py-2.5 px-2 border-r ${isDark ? 'border-[#2e2e33] bg-[#111113]' : 'border-slate-400 bg-[#81d4fa]'}`}>
                      RED SOCIAL
                    </th>
                    <th className={`w-36 py-2.5 px-2 border-r ${isDark ? 'border-[#2e2e33] bg-[#111113]' : 'border-slate-400 bg-[#455a64] text-white'}`}>
                      SEMANA
                    </th>
                    {DIAS_ORDEN.map((dia) => {
                      const postDia = semanaPosts.find(p => p.dia === dia);
                      const fechaDia = postDia?.fecha ? postDia.fecha.slice(5) : '';
                      return (
                        <th
                          key={dia}
                          className={`py-2 px-2 border-r last:border-r-0 ${
                            isDark ? 'border-[#2e2e33]' : 'border-slate-400'
                          }`}
                        >
                          <div className="text-[11px] opacity-80">{fechaDia}</div>
                          <div className="text-xs font-black">{dia.toUpperCase()}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  
                  {/* FILA 1: PUBLICACIÓN 1 (MAÑANA) */}
                  <tr>
                    
                    {/* COLUMNA LATERAL RED SOCIAL */}
                    <td
                      rowSpan={3}
                      className={`text-center align-middle border-r font-black tracking-widest uppercase select-none ${
                        isDark ? 'bg-[#111113] text-[#c1121f] border-[#2e2e33]' : 'bg-[#90caf9] text-pink-600 border-slate-400 italic'
                      }`}
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '20px', letterSpacing: '8px' }}
                    >
                      INSTAGRAM
                    </td>

                    {/* COLUMNA LATERAL SEMANA */}
                    <td
                      rowSpan={3}
                      className={`text-center align-middle border-r p-3 font-extrabold text-xs uppercase leading-relaxed ${
                        isDark ? 'bg-[#18181b] text-white border-[#2e2e33]' : 'bg-[#37474f] text-white border-slate-400'
                      }`}
                    >
                      <div className="text-base font-black mb-1">{semana.toUpperCase()}</div>
                      <div className="text-[10px] text-slate-300 font-mono">{fechaRango}</div>
                    </td>

                    {/* CELDAS DE CADA DÍA: TURNO 1 */}
                    {DIAS_ORDEN.map((dia) => {
                      const post = semanaPosts.find(p => p.dia === dia && p.turno.includes('1'));
                      return (
                        <td
                          key={`turno1-${dia}`}
                          className={`p-1.5 align-top border-r last:border-r-0 w-[14.28%] ${
                            isDark ? 'border-[#2e2e33] bg-[#0c0c0e]' : 'border-slate-400 bg-white'
                          }`}
                        >
                          {renderCell(post, dia, '☀️ Publicación 1', isDark, onEditPost, onPreviewReferente, handleCopyCopy, copiedId)}
                        </td>
                      );
                    })}

                  </tr>

                  {/* SEPARADOR HORIZONTAL ENTRE TURNOS (COMO LA LÍNEA NARANJA DEL EXCEL) */}
                  <tr className={`h-2 ${isDark ? 'bg-[#c1121f]' : 'bg-[#ff9800]'}`}>
                    <td colSpan={7} className="p-0"></td>
                  </tr>

                  {/* FILA 2: PUBLICACIÓN 2 (TARDE) */}
                  <tr>
                    {DIAS_ORDEN.map((dia) => {
                      const post = semanaPosts.find(p => p.dia === dia && p.turno.includes('2'));
                      return (
                        <td
                          key={`turno2-${dia}`}
                          className={`p-1.5 align-top border-r last:border-r-0 w-[14.28%] ${
                            isDark ? 'border-[#2e2e33] bg-[#0c0c0e]' : 'border-slate-400 bg-white'
                          }`}
                        >
                          {renderCell(post, dia, '🌙 Publicación 2', isDark, onEditPost, onPreviewReferente, handleCopyCopy, copiedId)}
                        </td>
                      );
                    })}
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        );
      })}
    </div>
  );
}

// Función auxiliar para renderizar cada celda exactamente como en la plantilla
function renderCell(post, dia, turnoLabel, isDark, onEditPost, onPreviewReferente, onCopy, copiedId) {
  if (!post) {
    return (
      <div className={`h-full min-h-[260px] rounded flex flex-col items-center justify-center p-3 text-center border border-dashed ${
        isDark ? 'border-[#232327] text-[#8b8b94]' : 'border-gray-300 text-gray-400'
      }`}>
        <span className="text-[11px] font-semibold">Sin post ({turnoLabel})</span>
      </div>
    );
  }

  const copyText = post.copyAprobado || post.guionCopy || post.hook || '';

  return (
    <div className={`flex flex-col h-full rounded border overflow-hidden shadow-sm transition-all ${
      isDark ? 'bg-[#141416] border-[#2e2e33]' : 'bg-white border-slate-400 text-slate-900'
    }`}>
      
      {/* 1. ENCABEZADO DE IMAGEN / MINIATURA (VERDE NEÓN EN EL EXCEL) */}
      <div className={`p-1 flex flex-col items-center justify-center relative ${
        isDark ? 'bg-[#18181b]' : 'bg-[#00e676]'
      }`}>
        <div
          onClick={() => onPreviewReferente(post)}
          className="relative w-full aspect-[4/3] bg-black rounded overflow-hidden cursor-pointer group shadow"
        >
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.pieza}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={22} />
              <span className="text-[9px] mt-1">Sin portada</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 text-white">
            <span className="text-[10px] font-bold bg-[#c1121f] px-2 py-0.5 rounded shadow">
              Ver Láminas & Copy
            </span>
          </div>
        </div>
      </div>

      {/* 2. SUB-TABLA DE CLASIFICACIÓN (EXACTA AL EXCEL DE LA FOTO) */}
      <div className="flex-1 text-[10px] divide-y divide-slate-300 dark:divide-[#2e2e33]">
        
        {/* CONTENIDO FEED */}
        <div className="grid grid-cols-[85px_1fr] bg-white dark:bg-[#111113]">
          <div className={`p-1.5 font-bold uppercase tracking-tight flex items-center ${
            isDark ? 'text-[#ff4d57] bg-[#18181b]' : 'text-red-600 bg-red-50 border-r border-slate-300 font-extrabold'
          }`}>
            Contenido Feed:
          </div>
          <div
            onClick={() => onPreviewReferente(post)}
            className="p-1.5 font-bold text-slate-900 dark:text-white line-clamp-3 cursor-pointer hover:underline leading-tight"
            title={post.hook || post.pieza}
          >
            "{post.hook || post.pieza}"
          </div>
        </div>

        {/* TIPO DE CONTENIDO */}
        <div className="grid grid-cols-[85px_1fr] bg-white dark:bg-[#111113]">
          <div className={`p-1 font-bold uppercase text-[9px] flex items-center ${
            isDark ? 'text-[#ff4d57] bg-[#18181b]' : 'text-red-600 bg-red-50 border-r border-slate-300'
          }`}>
            Tipo Contenido:
          </div>
          <div className="p-1 font-semibold text-slate-800 dark:text-slate-200">
            {post.tipo || post.formato || 'Carrusel'}
          </div>
        </div>

        {/* ETAPA */}
        <div className="grid grid-cols-[85px_1fr] bg-white dark:bg-[#111113]">
          <div className={`p-1 font-bold uppercase text-[9px] flex items-center ${
            isDark ? 'text-[#ff4d57] bg-[#18181b]' : 'text-red-600 bg-red-50 border-r border-slate-300'
          }`}>
            Etapa:
          </div>
          <div className="p-1">
            <span className={`px-2 py-0.5 rounded text-[9px] uppercase inline-block ${
              post.etapa?.toLowerCase().includes('atrac')
                ? 'bg-[#ffff00] text-black font-black'
                : post.etapa?.toLowerCase().includes('vent')
                ? 'bg-[#00e600] text-black font-black'
                : 'bg-[#00ffff] text-black font-black'
            }`}>
              {post.etapa || 'ATRACCIÓN'}
            </span>
          </div>
        </div>

        {/* PRODUCTO */}
        <div className="grid grid-cols-[85px_1fr] bg-white dark:bg-[#111113]">
          <div className={`p-1 font-bold uppercase text-[9px] flex items-center ${
            isDark ? 'text-[#ff4d57] bg-[#18181b]' : 'text-red-600 bg-red-50 border-r border-slate-300'
          }`}>
            Producto:
          </div>
          <div className="p-1 font-bold text-slate-800 dark:text-slate-200 truncate" title={post.producto}>
            {post.producto || 'Bitaxus'}
          </div>
        </div>

        {/* HISTORIAS */}
        <div className="grid grid-cols-[85px_1fr] bg-white dark:bg-[#111113]">
          <div className={`p-1 font-bold uppercase text-[9px] flex items-center ${
            isDark ? 'text-[#ff4d57] bg-[#18181b]' : 'text-red-600 bg-red-50 border-r border-slate-300'
          }`}>
            Historias:
          </div>
          <div className="p-1 text-slate-700 dark:text-slate-300 text-[9px] truncate" title={post.historias}>
            {post.historias || 'Historias de apoyo'}
          </div>
        </div>

      </div>

      {/* 3. BOTONES DE ACCIÓN RÁPIDA: COPIAR COPY & VER DETALLES */}
      <div className={`p-1.5 flex items-center justify-between gap-1 border-t ${
        isDark ? 'bg-[#18181b] border-[#2e2e33]' : 'bg-slate-100 border-slate-300'
      }`}>
        <button
          onClick={() => onPreviewReferente(post)}
          className={`flex-1 py-1 px-1.5 rounded text-[9px] font-extrabold uppercase flex items-center justify-center gap-1 transition-all ${
            isDark
              ? 'bg-[#c1121f] text-white hover:bg-[#d61a28]'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
          title="Ver board y copy completo"
        >
          <Play size={10} />
          <span>Ver Copy</span>
        </button>

        {copyText && (
          <button
            onClick={() => onCopy(copyText, post.id)}
            className={`py-1 px-2 rounded text-[9px] font-bold flex items-center gap-1 transition-all ${
              copiedId === post.id
                ? 'bg-emerald-600 text-white'
                : isDark
                ? 'bg-[#202024] text-slate-200 hover:text-white border border-[#2e2e33]'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
            title="Copiar texto de esta pieza"
          >
            {copiedId === post.id ? <Check size={10} /> : <Copy size={10} />}
            <span>{copiedId === post.id ? 'Copiado' : 'Copiar'}</span>
          </button>
        )}
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Save, Film, Image as ImageIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';

const ETAPAS = ['Atracción', 'Validación', 'Venta', 'Fidelización'];
const ESTADOS = ['Aprobado (Copy y Board)', 'Editable cargado', 'Programado', 'Publicado'];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TURNOS = ['☀️ Publicación 1 (Mañana)', '🌙 Publicación 2 (Tarde)'];
const ANGULOS = ['Voz en Off', 'A cámara', 'Foto', 'Tendencia'];
const CATEGORIAS = ['Aspiracional', 'Unboxing', 'Tutorial / Educativo', 'Portada'];
const FORMATOS = ['Carrusel', 'Carrusel animado', 'Carrusel híbrido', 'Post animado', 'Animación', 'Post estático'];

export default function PostModal({ post, isOpen, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    pieza: '',
    estado: 'Aprobado (Copy y Board)',
    fecha: '',
    turno: '☀️ Publicación 1 (Mañana)',
    dia: 'Lunes',
    semana: 'Semana 01',
    etapa: 'Atracción',
    producto: '',
    anguloVenta: 'Voz en Off',
    categoria: 'Aspiracional',
    formato: 'Carrusel',
    tipo: 'Carrusel',
    hook: '',
    guionCopy: '',
    storytelling: '',
    historias: '',
    linkReferente: '',
    notasReferentes: '',
    fechaEntrega: '',
    linkEntrega: '',
    responsable: 'Gabi',
    observaciones: '',
    coverImage: ''
  });

  useEffect(() => {
    if (post) {
      setFormData({
        ...formData,
        ...post
      });
    } else {
      setFormData({
        pieza: '',
        estado: 'Aprobado (Copy y Board)',
        fecha: new Date().toISOString().split('T')[0],
        turno: '☀️ Publicación 1 (Mañana)',
        dia: 'Lunes',
        semana: 'Semana 01',
        etapa: 'Atracción',
        producto: '',
        anguloVenta: 'Voz en Off',
        categoria: 'Aspiracional',
        formato: 'Carrusel',
        tipo: 'Carrusel',
        hook: '',
        guionCopy: '',
        storytelling: '',
        historias: '',
        linkReferente: '',
        notasReferentes: '',
        fechaEntrega: '',
        linkEntrega: '',
        responsable: 'Gabi',
        observaciones: '',
        coverImage: ''
      });
    }
  }, [post, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111113] border border-[#2e2e33] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#232327] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c1121f] text-white shadow-md">
              <Film size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide font-sans">
                {post?.id ? 'Editar Publicación & Referente' : 'Nueva Publicación Bitaxus'}
              </h2>
              <p className="text-xs text-[#8b8b94]">
                Guarda los cambios y sincroniza automáticamente con Notion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8b8b94] hover:text-white hover:bg-[#202024] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* SECCIÓN 1: LINK DE REFERENTE Y MINIATURA */}
          <div className="p-4 rounded-xl bg-black border border-[#232327] space-y-4">
            <div className="flex items-center gap-2 text-[#ff4d57] font-bold text-xs uppercase tracking-wider">
              <LinkIcon size={14} />
              <span>Link del Referente e Imagen del Post</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enlace del Referente (Instagram / TikTok / Drive)
                </label>
                <input
                  type="url"
                  name="linkReferente"
                  value={formData.linkReferente}
                  onChange={handleChange}
                  placeholder="https://www.instagram.com/reel/... o TikTok"
                  className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3.5 py-2.5 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Miniatura / Portada (Cover)
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/... o enlace de imagen"
                  className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3.5 py-2.5 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
                />
              </div>
            </div>

            {formData.coverImage && (
              <div className="flex items-center gap-4 p-2.5 bg-[#18181b] rounded-xl border border-[#2e2e33]">
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white">Vista previa de la miniatura</span>
                  <p className="text-[#8b8b94] text-[11px]">Esta imagen aparecerá en el encabezado de la tarjeta en el calendario</p>
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: DATOS PRINCIPALES (HOOK, TÍTULO, PRODUCTO) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título / Nombre de la Pieza *
                </label>
                <input
                  type="text"
                  name="pieza"
                  required
                  value={formData.pieza}
                  onChange={handleChange}
                  placeholder="Ej: 07. Vender es apenas el primer paso"
                  className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3.5 py-2.5 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Producto / Pilar Promocionado
                </label>
                <input
                  type="text"
                  name="producto"
                  value={formData.producto}
                  onChange={handleChange}
                  placeholder="Ej: Bitaxus Global / Dólares Digitales"
                  className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3.5 py-2.5 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                Hook / Gancho inicial (Primeros 3 segundos)
              </label>
              <textarea
                name="hook"
                rows={2}
                value={formData.hook}
                onChange={handleChange}
                placeholder="El texto o frase con la que abre el video o carrusel para enganchar..."
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl p-3 border border-[#2e2e33] focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* SECCIÓN 3: ESTRATEGIA (ETAPA, ESTADO, CALENDARIO) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Etapa</label>
              <select
                name="etapa"
                value={formData.etapa}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Día</label>
              <select
                name="dia"
                value={formData.dia}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Turno del Día</label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN 4: DETALLES DE FORMATO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ángulo de Venta</label>
              <select
                name="anguloVenta"
                value={formData.anguloVenta}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {ANGULOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Formato</label>
              <select
                name="formato"
                value={formData.formato}
                onChange={handleChange}
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              >
                {FORMATOS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Semana</label>
              <input
                type="text"
                name="semana"
                value={formData.semana}
                onChange={handleChange}
                placeholder="Semana 01"
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl px-3 py-2 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              />
            </div>
          </div>

          {/* SECCIÓN 5: GUIÓN Y NOTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guión / Copy Completo
              </label>
              <textarea
                name="guionCopy"
                rows={3}
                value={formData.guionCopy}
                onChange={handleChange}
                placeholder="Escribe el copy o pega el link del documento..."
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl p-3 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Storytelling & Enfoque
              </label>
              <textarea
                name="storytelling"
                rows={3}
                value={formData.storytelling}
                onChange={handleChange}
                placeholder="¿Qué emoción o historia se cuenta en esta pieza?"
                className="w-full bg-[#0c0c0e] text-white text-xs rounded-xl p-3 border border-[#2e2e33] focus:outline-none focus:border-[#c1121f]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#232327] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#2e2e33] text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c1121f] hover:bg-[#d61a28] text-white text-xs font-bold shadow-lg shadow-[#c1121f]/30 transition-all disabled:opacity-50 uppercase tracking-wide"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Sincronizando con Notion...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Guardar y Sincronizar</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

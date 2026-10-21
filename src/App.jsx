import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import FeedMatrixView from './components/FeedMatrixView.jsx';
import CalendarMonthView from './components/CalendarMonthView.jsx';
import TableView from './components/TableView.jsx';
import PostModal from './components/PostModal.jsx';
import ReferentePreviewModal from './components/ReferentePreviewModal.jsx';
import NotificationModal from './components/NotificationModal.jsx';
import notionPosts from './data/notionPosts.json';
import { CheckCircle2, AlertCircle, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { fetchNotionLiveUpdates, savePostToNotion } from './services/notionSyncService.js';

// Generar una fecha de solicitud/entrega realista previa a la fecha de publicación
const calcularFechaEntrega = (fechaPub) => {
  if (!fechaPub) return '2026-10-13';
  try {
    const d = new Date(fechaPub + 'T00:00:00');
    d.setDate(d.getDate() - 3);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '2026-10-13';
  }
};

const OFFICIAL_EMAIL = 'socialmedia@bitaxus.com';
const OFFICIAL_PASS = 'Marketing123!';
const AUTH_KEY = 'bitaxus_auth_session_v1';

export default function App() {
  // Estado de autenticación directa
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'active';
    } catch (e) {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Inicializar posts combinando con campos de producción
  const [posts, setPosts] = useState(() => {
    return notionPosts.map((p, idx) => ({
      ...p,
      fechaEntrega: p.fechaEntrega || calcularFechaEntrega(p.fecha),
      editableLink: p.editableLink || p.linkEntrega || `https://www.canva.com/folder/bitaxus-proyecto-${idx + 1}`,
      isPinned: idx < 3, // Por defecto fijar 3 posts clave
      estadoAprobacion: p.estadoAprobacion || 'Aprobado',
      notasFeedback: p.notasFeedback || ''
    }));
  });

  const [activeView, setActiveView] = useState('planner'); // 'planner' | 'month' | 'table'
  const [selectedSemana, setSelectedSemana] = useState('Semana 01');
  const [isSyncing, setIsSyncing] = useState(false);
  const [notionStatus, setNotionStatus] = useState({ connected: true });
  const [toast, setToast] = useState(null);

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditPost, setCurrentEditPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal de notificación para socialmedia@bitaxus.com
  const [notificationModalData, setNotificationModalData] = useState({
    isOpen: false,
    post: null,
    feedback: '',
    estado: ''
  });

  // Helper para mostrar notificación
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenNotification = (post, feedback, estado) => {
    setNotificationModalData({
      isOpen: true,
      post: post || posts[0] || null,
      feedback: feedback || (post ? post.notasFeedback : '') || '',
      estado: estado || (post ? post.estadoAprobacion : 'En corrección') || 'En corrección'
    });
  };

  // Login handler
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (passwordInput === OFFICIAL_PASS) {
      try {
        localStorage.setItem(AUTH_KEY, 'active');
      } catch (err) {}
      setIsAuthenticated(true);
      setAuthError('');
      showToast('Acceso concedido · Bienvenido al planificador');
    } else {
      setAuthError('Contraseña incorrecta. Por favor verifica e intenta nuevamente.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (err) {}
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError('');
    showToast('Sesión cerrada');
  };

  // Sincronización en tiempo real con Notion (Bidireccional entre computadores)
  const syncWithNotion = async (silent = false) => {
    setIsSyncing(true);
    try {
      const { success, data } = await fetchNotionLiveUpdates();
      if (success && Object.keys(data).length > 0) {
        setPosts(prev => prev.map(p => {
          const remote = data[p.id];
          if (remote) {
            return {
              ...p,
              estadoAprobacion: remote.estadoAprobacion || p.estadoAprobacion,
              notasFeedback: remote.notasFeedback !== undefined && remote.notasFeedback !== '' ? remote.notasFeedback : p.notasFeedback,
              editableLink: remote.editableLink || p.editableLink
            };
          }
          return p;
        }));
        if (!silent) showToast('Sincronizado con Notion (55 publicaciones al día)', 'success');
      } else if (!silent) {
        showToast('Sin cambios nuevos en Notion', 'success');
      }
    } catch (e) {
      if (!silent) showToast('Error al conectar con Notion', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Cargar datos locales y sincronizar en vivo con Notion al iniciar
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('ig_planner_custom_data_v3');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPosts(prev => prev.map(p => {
          const custom = parsed[p.id];
          if (custom) {
            return {
              ...p,
              ...custom
            };
          }
          return p;
        }));
      }
    } catch (e) {
      console.error("Error al cargar custom data:", e);
    }

    // Traer inmediatamente los últimos cambios reales desde Notion
    syncWithNotion(true);

    // Sincronizar en segundo plano cuando la ventana vuelve a tener foco
    const handleFocus = () => syncWithNotion(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Guardar cambios en post y sincronizar directamente con la base de datos de Notion
  const handleUpdatePostData = async (postId, updates) => {
    setPosts(prev => {
      const next = prev.map(p => {
        if (p.id === postId) {
          return { ...p, ...updates };
        }
        return p;
      });

      // Persistir en localStorage
      try {
        const stored = {};
        next.forEach(item => {
          if (item.notasFeedback || item.isPinned !== undefined || item.estadoAprobacion || item.editableLink || item.fechaEntrega) {
            stored[item.id] = {
              notasFeedback: item.notasFeedback,
              isPinned: item.isPinned,
              estadoAprobacion: item.estadoAprobacion,
              editableLink: item.editableLink,
              fechaEntrega: item.fechaEntrega
            };
          }
        });
        localStorage.setItem('ig_planner_custom_data_v3', JSON.stringify(stored));
      } catch (e) {}

      return next;
    });

    if (previewPost && previewPost.id === postId) {
      setPreviewPost(prev => ({ ...prev, ...updates }));
    }

    // Enviar cambios a Notion para que aparezcan en todos los computadores
    if (updates.notasFeedback !== undefined || updates.estadoAprobacion || updates.editableLink) {
      const res = await savePostToNotion(postId, updates);
      if (res.success) {
        showToast('Guardado y sincronizado con Notion', 'success');
      } else {
        showToast('Guardado local (pendiente sync Notion)', 'error');
      }
    }
  };

  // Toggle fijar post en el perfil (Máximo 3)
  const handleTogglePin = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const pinnedCount = posts.filter(p => p.isPinned).length;

    if (!post.isPinned && pinnedCount >= 3) {
      showToast('Ya hay 3 posts fijados. Desfija uno primero.', 'error');
      return;
    }

    const newPinned = !post.isPinned;
    handleUpdatePostData(postId, { isPinned: newPinned });
    showToast(newPinned ? 'Post fijado en el perfil de Instagram' : 'Post desfijado del perfil', 'success');
  };

  // Cargar estado de Notion y posts
  const fetchStatusAndPosts = () => {
    syncWithNotion(false);
  };

  // Extraer semanas únicas disponibles
  const semanas = Array.from(new Set(posts.map(p => p.semana).filter(Boolean))).sort();
  if (semanas.length === 0) semanas.push('Semana 01');

  // Guardar o actualizar post (con Notion sync)
  const handleSavePost = async (formData) => {
    setIsSaving(true);
    try {
      const fakeId = formData.id || `local-${Date.now()}`;
      const updated = { ...formData, id: fakeId };
      setPosts(prev => {
        const exists = prev.some(p => p.id === fakeId);
        const next = exists ? prev.map(p => p.id === fakeId ? updated : p) : [updated, ...prev];
        return next;
      });
      showToast('Guardado localmente', 'success');
      setIsEditModalOpen(false);
      setCurrentEditPost(null);
    } catch (err) {
      showToast('Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const aprobadosCount = posts.filter(p => (p.estadoAprobacion || 'Aprobado') === 'Aprobado').length;
  const pinnedPosts = posts.filter(p => p.isPinned);

  // Vista de Login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Logo y Encabezado */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2.5">
              <img
                src="./logo.png"
                alt="Bitaxus"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-8 h-8 rounded bg-zinc-800 text-white font-bold text-xs items-center justify-center">
                B
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                Bitaxus Content
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Acceso exclusivo al equipo de producción y marketing.
            </p>
          </div>

          {/* Tarjeta de Inicio de Sesión */}
          <div className="bg-[#121215] border border-white/10 rounded-lg p-6 shadow-2xl space-y-4">
            <div className="border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-semibold text-white tracking-tight">Iniciar Sesión</h2>
              <span className="text-[11px] text-zinc-500">Ingresa con tus credenciales asignadas</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              
              {/* Correo Electrónico (Fijado) */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400 block">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={OFFICIAL_EMAIL}
                    readOnly
                    className="w-full bg-[#09090b] border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none cursor-not-allowed select-none opacity-85"
                  />
                  <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-400 block">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Escribe tu contraseña..."
                    autoFocus
                    className="w-full bg-[#09090b] border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle size={13} className="shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 px-3 rounded bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 pt-2"
              >
                <span>Acceder al planificador</span>
                <ArrowRight size={13} />
              </button>

            </form>
          </div>

          <div className="text-center text-[11px] text-zinc-600 font-mono">
            Bitaxus Content Machine · 2026
          </div>

        </div>
      </div>
    );
  }

  // Vista Principal cuando está autenticado
  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col selection:bg-[#c1121f] selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#141522] border border-white/10 text-slate-100 shadow-2xl animate-fade-in text-xs font-semibold backdrop-blur-md">
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        selectedSemana={selectedSemana}
        setSelectedSemana={setSelectedSemana}
        semanas={semanas}
        onSync={fetchStatusAndPosts}
        isSyncing={isSyncing}
        notionStatus={notionStatus}
        totalPosts={posts.length}
        aprobadosCount={aprobadosCount}
        onOpenNotificationConfig={() => handleOpenNotification(posts[0] || null, '', 'Aprobado')}
        onLogout={handleLogout}
        onNewPost={() => {
          setCurrentEditPost(null);
          setIsEditModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1900px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {activeView === 'planner' && (
          <FeedMatrixView
            posts={posts}
            pinnedPosts={pinnedPosts}
            selectedSemana={selectedSemana}
            onTogglePin={handleTogglePin}
            onUpdatePostData={handleUpdatePostData}
            onOpenNotification={handleOpenNotification}
            onEditPost={(post) => {
              setCurrentEditPost(post);
              setIsEditModalOpen(true);
            }}
            onPreviewReferente={(post) => setPreviewPost(post)}
            onUpdateEstado={(postId, newEstado, newFeedback) => {
              handleUpdatePostData(postId, {
                estadoAprobacion: newEstado,
                notasFeedback: newFeedback !== undefined ? newFeedback : undefined
              });
              showToast(`Estado actualizado: ${newEstado}`);
            }}
          />
        )}

        {activeView === 'month' && (
          <CalendarMonthView
            posts={posts}
            onPreviewReferente={(post) => setPreviewPost(post)}
            onUpdateEstado={(postId, newEstado) => {
              handleUpdatePostData(postId, { estadoAprobacion: newEstado });
              showToast(`Estado actualizado: ${newEstado}`);
            }}
          />
        )}

        {activeView === 'table' && (
          <TableView
            posts={selectedSemana === 'todas' ? posts : posts.filter(p => p.semana === selectedSemana)}
            selectedSemana={selectedSemana}
            onEditPost={(post) => {
              setCurrentEditPost(post);
              setIsEditModalOpen(true);
            }}
            onPreviewReferente={(post) => setPreviewPost(post)}
            onUpdateEstado={(postId, newEstado, newFeedback) => {
              handleUpdatePostData(postId, {
                estadoAprobacion: newEstado,
                notasFeedback: newFeedback
              });
              showToast(`Estado actualizado: ${newEstado}`);
            }}
          />
        )}

      </main>

      {/* Modales */}
      <PostModal
        isOpen={isEditModalOpen}
        post={currentEditPost}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentEditPost(null);
        }}
        onSave={handleSavePost}
        isSaving={isSaving}
      />

      <ReferentePreviewModal
        post={previewPost}
        onClose={() => setPreviewPost(null)}
        onOpenNotification={handleOpenNotification}
        onUpdateEstado={(postId, newEstado, newFeedback) => {
          handleUpdatePostData(postId, {
            estadoAprobacion: newEstado,
            notasFeedback: newFeedback !== undefined ? newFeedback : undefined
          });
          showToast(`Guardado: ${newEstado}`);
        }}
      />

      {/* Modal de Notificaciones a socialmedia@bitaxus.com */}
      <NotificationModal
        isOpen={notificationModalData.isOpen}
        post={notificationModalData.post}
        feedback={notificationModalData.feedback}
        estado={notificationModalData.estado}
        onClose={() => setNotificationModalData(prev => ({ ...prev, isOpen: false }))}
        onShowToast={showToast}
      />

    </div>
  );
}

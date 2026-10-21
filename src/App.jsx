import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import FeedMatrixView from './components/FeedMatrixView.jsx';
import CalendarMonthView from './components/CalendarMonthView.jsx';
import TableView from './components/TableView.jsx';
import PostModal from './components/PostModal.jsx';
import ReferentePreviewModal from './components/ReferentePreviewModal.jsx';
import notionPosts from './data/notionPosts.json';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Siempre usar los datos empaquetados frescos de Notion
  const [posts, setPosts] = useState(notionPosts);
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

  // Helper para mostrar notificación
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar estado de Notion y posts
  const fetchStatusAndPosts = async () => {
    setIsSyncing(true);
    try {
      localStorage.clear();
      // 1. Status
      const statusRes = await fetch('/api/status').catch(() => null);
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setNotionStatus(statusData);
      } else {
        setNotionStatus({ connected: false, isStatic: true });
      }

      // 2. Posts (si el backend local está corriendo)
      const postsRes = await fetch('/api/posts').catch(() => null);
      if (postsRes && postsRes.ok) {
        const postsData = await postsRes.json();
        if (Array.isArray(postsData) && postsData.length > 0) {
          setPosts(postsData);
          showToast(`Sincronizadas ${postsData.length} piezas desde Notion`);
          setIsSyncing(false);
          return;
        }
      }

      setPosts(notionPosts);
      showToast("Datos de producción cargados correctamente");
    } catch (err) {
      console.warn("Usando datos locales:", err);
      setPosts(notionPosts);
    } finally {
      setIsSyncing(false);
    }
  };

  // Cargar estado guardado de aprobaciones si existe
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem('ig_planner_custom_status');
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus);
        if (Array.isArray(parsed)) {
          setPosts(prev => prev.map(p => {
            const found = parsed.find(item => item.id === p.id);
            if (found) {
              return { ...p, estadoAprobacion: found.estadoAprobacion, notasFeedback: found.notasFeedback };
            }
            return p;
          }));
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchStatusAndPosts();
  }, []);

  // Extraer semanas únicas disponibles
  const semanas = Array.from(new Set(posts.map(p => p.semana).filter(Boolean))).sort();
  if (semanas.length === 0) semanas.push('Semana 01');

  // Guardar o actualizar post (con Notion sync)
  const handleSavePost = async (formData) => {
    setIsSaving(true);
    try {
      const isUpdate = !!formData.id && !formData.id.startsWith('mock-');
      const url = isUpdate ? `/api/posts/${formData.id}` : '/api/posts';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res && res.ok) {
        const savedPost = await res.json();
        setPosts(prev => {
          const next = isUpdate ? prev.map(p => p.id === savedPost.id ? savedPost : p) : [savedPost, ...prev];
          localStorage.setItem('ig_planner_posts', JSON.stringify(next));
          return next;
        });
        showToast('Guardado y sincronizado con Notion con éxito');
      } else {
        // Fallback actualización local / GitHub Pages
        const fakeId = formData.id || `local-${Date.now()}`;
        const updated = { ...formData, id: fakeId };
        setPosts(prev => {
          const exists = prev.some(p => p.id === fakeId);
          const next = exists ? prev.map(p => p.id === fakeId ? updated : p) : [updated, ...prev];
          localStorage.setItem('ig_planner_posts', JSON.stringify(next));
          return next;
        });
        showToast('Guardado localmente en tu navegador', 'success');
      }

      setIsEditModalOpen(false);
      setCurrentEditPost(null);
    } catch (err) {
      console.error("Error al guardar:", err);
      showToast('Error al conectar con Notion, guardado en memoria', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir modal con valores por defecto al hacer clic en celda vacía
  const handleNewPostWithDefaults = (defaults) => {
    setCurrentEditPost({
      pieza: '',
      ...defaults
    });
    setIsEditModalOpen(true);
  };

  const aprobadosCount = posts.filter(p => (p.estadoAprobacion || 'Aprobado') === 'Aprobado').length;

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
        onNewPost={() => {
          setCurrentEditPost(null);
          setIsEditModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1850px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {activeView === 'planner' && (
          <FeedMatrixView
            posts={posts}
            selectedSemana={selectedSemana}
            onEditPost={(post) => {
              setCurrentEditPost(post);
              setIsEditModalOpen(true);
            }}
            onPreviewReferente={(post) => setPreviewPost(post)}
            onUpdateEstado={(postId, newEstado, newFeedback) => {
              setPosts(prev => {
                const updated = prev.map(p => {
                  if (p.id === postId) {
                    return {
                      ...p,
                      estadoAprobacion: newEstado,
                      notasFeedback: newFeedback !== undefined ? newFeedback : (p.notasFeedback || '')
                    };
                  }
                  return p;
                });
                try {
                  localStorage.setItem('ig_planner_custom_status', JSON.stringify(updated.map(u => ({ id: u.id, estadoAprobacion: u.estadoAprobacion, notasFeedback: u.notasFeedback }))));
                } catch (e) {}
                return updated;
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
              setPosts(prev => prev.map(p => p.id === postId ? { ...p, estadoAprobacion: newEstado } : p));
              showToast(`Estado actualizado: ${newEstado}`);
            }}
          />
        )}

        {activeView === 'table' && (
          <TableView
            posts={posts}
            onEditPost={(post) => {
              setCurrentEditPost(post);
              setIsEditModalOpen(true);
            }}
            onPreviewReferente={(post) => setPreviewPost(post)}
            onUpdateEstado={(postId, newEstado, newFeedback) => {
              setPosts(prev => prev.map(p => p.id === postId ? { ...p, estadoAprobacion: newEstado, notasFeedback: newFeedback ?? p.notasFeedback } : p));
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
        onUpdateEstado={(postId, newEstado, newFeedback) => {
          setPosts(prev => {
            const updated = prev.map(p => {
              if (p.id === postId) {
                return {
                  ...p,
                  estadoAprobacion: newEstado,
                  notasFeedback: newFeedback !== undefined ? newFeedback : (p.notasFeedback || '')
                };
              }
              return p;
            });
            try {
              localStorage.setItem('ig_planner_custom_status', JSON.stringify(updated.map(u => ({ id: u.id, estadoAprobacion: u.estadoAprobacion, notasFeedback: u.notasFeedback }))));
            } catch (e) {}
            return updated;
          });
          if (previewPost && previewPost.id === postId) {
            setPreviewPost(prev => ({ ...prev, estadoAprobacion: newEstado, notasFeedback: newFeedback !== undefined ? newFeedback : (prev.notasFeedback || '') }));
          }
          showToast(`Estado guardado: ${newEstado}`);
        }}
      />

    </div>
  );
}

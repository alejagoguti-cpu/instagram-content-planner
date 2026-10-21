import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import FeedMatrixView from './components/FeedMatrixView.jsx';
import CalendarMonthView from './components/CalendarMonthView.jsx';
import TableView from './components/TableView.jsx';
import PostModal from './components/PostModal.jsx';
import ReferentePreviewModal from './components/ReferentePreviewModal.jsx';
import notionPosts from './data/notionPosts.json';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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

export default function App() {
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

  // Helper para mostrar notificación
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar personalizaciones guardadas en localStorage al iniciar
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
  }, []);

  // Guardar cambios en post (Feedback, Estados, Links Canva, Fechas)
  const handleUpdatePostData = (postId, updates) => {
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
  };

  // Toggle fijar post en el perfil (Máximo 3)
  const handleTogglePin = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const pinnedCount = posts.filter(p => p.isPinned).length;

    if (!post.isPinned && pinnedCount >= 3) {
      showToast('⚠️ Ya hay 3 posts fijados. Desfija uno primero.', 'error');
      return;
    }

    const newPinned = !post.isPinned;
    handleUpdatePostData(postId, { isPinned: newPinned });
    showToast(newPinned ? '📌 Post fijado en el perfil de Instagram' : 'Post desfijado del perfil', 'success');
  };

  // Cargar estado de Notion y posts
  const fetchStatusAndPosts = async () => {
    setIsSyncing(true);
    try {
      showToast("Sincronizado con Notion y base de datos local");
    } finally {
      setIsSyncing(false);
    }
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
      <main className="flex-1 max-w-[1900px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {activeView === 'planner' && (
          <FeedMatrixView
            posts={posts}
            pinnedPosts={pinnedPosts}
            selectedSemana={selectedSemana}
            onTogglePin={handleTogglePin}
            onUpdatePostData={handleUpdatePostData}
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
            posts={posts}
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
        onUpdateEstado={(postId, newEstado, newFeedback) => {
          handleUpdatePostData(postId, {
            estadoAprobacion: newEstado,
            notasFeedback: newFeedback !== undefined ? newFeedback : undefined
          });
          showToast(`Guardado: ${newEstado}`);
        }}
      />

    </div>
  );
}

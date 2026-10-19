import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import FeedMatrixView from './components/FeedMatrixView.jsx';
import TableView from './components/TableView.jsx';
import PostModal from './components/PostModal.jsx';
import ReferentePreviewModal from './components/ReferentePreviewModal.jsx';
import { initialMockPosts } from './data/mockPosts.js';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState(initialMockPosts);
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' | 'table'
  const [selectedSemana, setSelectedSemana] = useState('Semana 01');
  const [isSyncing, setIsSyncing] = useState(false);
  const [notionStatus, setNotionStatus] = useState({ connected: false });
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
      // 1. Status
      const statusRes = await fetch('/api/status').catch(() => null);
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setNotionStatus(statusData);
      } else {
        // En GitHub Pages / entorno estático
        setNotionStatus({ connected: false, isStatic: true });
      }

      // 2. Posts
      const postsRes = await fetch('/api/posts').catch(() => null);
      if (postsRes && postsRes.ok) {
        const postsData = await postsRes.json();
        if (Array.isArray(postsData) && postsData.length > 0) {
          setPosts(postsData);
          localStorage.setItem('ig_planner_posts', JSON.stringify(postsData));
          showToast(`Sincronizadas ${postsData.length} piezas desde Notion`);
          setIsSyncing(false);
          return;
        }
      }

      // Fallback a localStorage si estamos en GitHub Pages
      const cached = localStorage.getItem('ig_planner_posts');
      if (cached) {
        setPosts(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("Usando datos locales de respaldo:", err);
      const cached = localStorage.getItem('ig_planner_posts');
      if (cached) setPosts(JSON.parse(cached));
    } finally {
      setIsSyncing(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl animate-fade-in text-xs font-semibold">
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
        onNewPost={() => {
          setCurrentEditPost(null);
          setIsEditModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-6 space-y-6">
        
        {activeView === 'calendar' ? (
          <FeedMatrixView
            posts={posts}
            selectedSemana={selectedSemana}
            onEditPost={(post) => {
              setCurrentEditPost(post);
              setIsEditModalOpen(true);
            }}
            onNewPostWithDefaults={handleNewPostWithDefaults}
            onPreviewReferente={(post) => setPreviewPost(post)}
          />
        ) : (
          <TableView
            posts={posts}
            onEditPost={(post) => {
              setCurrentEditPost(post);
              setIsEditModalOpen(true);
            }}
            onPreviewReferente={(post) => setPreviewPost(post)}
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
      />

    </div>
  );
}

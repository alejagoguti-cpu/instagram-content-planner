# 📸 Instagram Content Planner & Banco de Referentes (Notion Synced)

Un planificador visual para feed de Instagram con matriz de calendario, miniaturas visuales, banco de enlaces referentes (Instagram Reels, TikTok, YouTube, Drive) y sincronización bidireccional en tiempo real con **Notion**.

---

## 🌟 Características Principales

1. **🗓️ Matriz Calendario Feed (Vista Planner)**
   * Organizado por columnas de días (Lunes a Domingo) y filas por turno de publicación (*☀️ Mañana* y *🌙 Tarde*).
   * **Miniatura visual grande** de cada post en portada.
   * Etiquetas dinámicas de **Etapa** (*Atracción, Validación, Venta, Fidelización*), **Producto** y **Tipo de contenido**.
   * Botón rápido para reproducir o inspeccionar el **Link del Referente**.

2. **📊 Vista Tabla Detallada (Tabla_1)**
   * Desglose completo de producción: *Etapa, Estado, Fecha, Producto, Ángulo de Venta, Categoría, Hook, Guión / Copy, Storytelling, Link de Referente, Notas del Referente, Fecha de Entrega, Link de Entrega y Responsable*.

3. **🔗 Banco y Reproductor de Referentes**
   * Agrega enlaces de videos o publicaciones de Instagram, TikTok, YouTube o Google Drive.
   * Modal interactivo para visualizar el referente, copiar enlace y revisar notas de producción antes de grabar.

4. **⚡ Sincronización Bidireccional con Notion**
   * Lectura automática de tu base de datos de Notion.
   * Creación y edición de posts con guardado directo en las propiedades de Notion.
   * Modo offline / fallback para seguir trabajando sin conexión.

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/alejagoguti-cpu/instagram-content-planner.git
cd instagram-content-planner
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` como `.env`:
```bash
cp .env.example .env
```
Y añade tus credenciales de Notion:
```env
PORT=3001
NOTION_TOKEN=ntn_tu_token_de_notion_aqui
NOTION_DATABASE_ID=3fb92105-e196-812f-9af9-da2a1aed073f
```

### 4. Iniciar la aplicación
Ejecuta el servidor backend y el frontend en un solo comando:
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:5173](http://localhost:5173)

---

## 📁 Estructura del Proyecto

```text
├── server.js                        # API Express y conexión con Notion
├── index.html                       # Entrada HTML con Tailwind CSS
├── vite.config.js                   # Configuración Vite y proxy reverso
├── package.json                     # Scripts y dependencias
├── src/
│   ├── main.jsx                     # Punto de entrada React
│   ├── App.jsx                      # Estado global y enrutador de vistas
│   ├── data/
│   │   └── mockPosts.js             # Datos de respaldo / demo inicial
│   └── components/
│       ├── Header.jsx               # Barra superior, filtros y botón sync
│       ├── FeedMatrixView.jsx       # Matriz visual del feed por días y turnos
│       ├── TableView.jsx            # Tabla completa de guiones y entregas
│       ├── PostModal.jsx            # Formulario para nuevo post y referente
│       └── ReferentePreviewModal.jsx# Visor interactivo de referentes
```

---

## 🛠️ Tecnologías

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
* **Backend:** Node.js, Express, Notion REST API
* **Base de datos:** Notion Databases

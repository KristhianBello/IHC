<template>
  <div class="forum-layout">
    <!-- Sidebar moderna -->
    <aside class="modern-sidebar">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
        <h2 class="sidebar-title">EcoVecinos</h2>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="profile-info">
          <h3>Usuario Actual</h3>
          <p>Miembro activo</p>
        </div>
        <router-link to="/perfil" class="profile-link">
          <i class="fas fa-cog"></i>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-menu">
          <li>
            <router-link to="/foro" class="nav-link active">
              <div class="nav-icon">
                <i class="fas fa-home"></i>
              </div>
              <span>Inicio</span>
            </router-link>
          </li>
          <li>
            <router-link to="/mapa" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-map-marked-alt"></i>
              </div>
              <span>Mapa de espacios</span>
            </router-link>
          </li>
          <li>
            <router-link to="/galeria" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-images"></i>
              </div>
              <span>Galería</span>
            </router-link>
          </li>
          <li>
            <router-link to="/adopciones" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-seedling"></i>
              </div>
              <span>Mis adopciones</span>
            </router-link>
          </li>
          <li>
            <router-link to="/solicitud" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-hand-holding-heart"></i>
              </div>
              <span>Solicitar adopción</span>
            </router-link>
          </li>
          <li>
            <router-link to="/reportar" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <span>Reportar problema</span>
            </router-link>
          </li>
          <li>
            <router-link to="/programar-tareas" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-calendar-plus"></i>
              </div>
              <span>Programar tareas</span>
            </router-link>
          </li>
          <li>
            <router-link to="/compañeros" class="nav-link">
              <div class="nav-icon">
                <i class="fas fa-users"></i>
              </div>
              <span>Mis compañeros</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="stats-mini">
          <div class="stat-item">
            <i class="fas fa-seedling"></i>
            <span>3 Adopciones</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-calendar-check"></i>
            <span>12 Tareas</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="forum-main">
      <div class="forum-header">
        <div class="header-content">
          <div class="header-title">
            <h1>
              <i class="fas fa-comments"></i>
              Foro Vecinal
            </h1>
            <p>Comparte, colabora y cuida tu comunidad</p>
          </div>
          <button
            class="btn btn-primary new-post-btn"
            @click="mostrarFormulario = !mostrarFormulario"
          >
            <i class="fas fa-plus"></i>
            {{ mostrarFormulario ? 'Cancelar' : 'Nueva publicación' }}
          </button>
        </div>
      </div>

      <!-- Barra de búsqueda moderna -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="busqueda"
              placeholder="Buscar publicaciones, ubicaciones o usuarios..."
              class="search-input"
            />
            <button
              v-if="busqueda"
              @click="limpiarBusqueda"
              class="clear-search-btn"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="search-filters">
            <button class="filter-btn active">
              <i class="fas fa-fire"></i>
              Populares
            </button>
            <button class="filter-btn">
              <i class="fas fa-clock"></i>
              Recientes
            </button>
            <button class="filter-btn">
              <i class="fas fa-map-marker-alt"></i>
              Cerca de mí
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario de nueva publicación -->
      <div v-if="mostrarFormulario" class="new-post-form fade-in">
        <form @submit.prevent="agregarPublicacion" class="post-form">
          <div class="form-header">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="form-title">
              <h3>Crear nueva publicación</h3>
              <p>Comparte algo interesante con tu comunidad</p>
            </div>
          </div>

          <div class="form-body">
            <div class="form-group">
              <input
                type="text"
                v-model="nueva.titulo"
                placeholder="¿Qué está pasando en tu barrio?"
                class="title-input"
                required
              />
            </div>

            <div class="form-group">
              <textarea
                v-model="nueva.contenido"
                placeholder="Comparte los detalles..."
                rows="4"
                class="content-textarea"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <div class="location-input-wrapper">
                <i class="fas fa-map-marker-alt location-icon"></i>
                <input
                  type="text"
                  v-model="nueva.ubicacion"
                  placeholder="Agregar ubicación"
                  class="location-input"
                />
              </div>
              <MapSelector
                v-model="nuevaUbicacion"
                @locationSelected="onLocationSelected"
              />
            </div>

            <div class="form-actions">
              <div class="post-options">
                <button type="button" class="option-btn">
                  <i class="fas fa-image"></i>
                  Foto
                </button>
                <button type="button" class="option-btn">
                  <i class="fas fa-poll"></i>
                  Encuesta
                </button>
                <button type="button" class="option-btn">
                  <i class="fas fa-calendar"></i>
                  Evento
                </button>
              </div>
              <button type="submit" class="btn btn-primary submit-btn">
                <i class="fas fa-paper-plane"></i>
                Publicar
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Lista de publicaciones -->
      <div class="posts-container">
        <!-- Mensaje cuando no se encuentran resultados -->
        <div v-if="publicacionesFiltradas.length === 0 && busqueda" class="no-results">
          <div class="no-results-content">
            <div class="no-results-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3>No se encontraron publicaciones</h3>
            <p>No hay publicaciones que coincidan con "<strong>{{ busqueda }}</strong>"</p>
            <button @click="limpiarBusqueda" class="btn btn-outline">
              <i class="fas fa-times"></i>
              Limpiar búsqueda
            </button>
          </div>
        </div>

        <!-- Publicaciones -->
        <article
          v-for="(post, index) in publicacionesFiltradas"
          :key="index"
          class="post-card fade-in"
        >
          <div class="post-header">
            <div class="post-author">
              <div class="author-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="author-info">
                <h4>{{ post.autor }}</h4>
                <div class="post-meta">
                  <span class="post-date">
                    <i class="fas fa-clock"></i>
                    {{ post.fecha }}
                  </span>
                  <span class="post-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ post.ubicacion }}
                  </span>
                </div>
              </div>
            </div>
            <div class="post-menu">
              <button class="menu-btn">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
          </div>

          <div class="post-content">
            <h3 class="post-title">{{ post.titulo }}</h3>
            <p class="post-text">{{ post.contenido }}</p>
          </div>

          <div class="post-actions">
            <button
              class="action-btn like-btn"
              :class="{ 'liked': post.liked }"
              @click="manejarLike(post.id, index)"
            >
              <i class="fas fa-heart"></i>
              <span>{{ post.likes_count || 0 }}</span>
            </button>
            
            <button
              class="action-btn comment-btn"
              @click="toggleComentarios(post.id, index)"
            >
              <i class="fas fa-comment"></i>
              <span>{{ post.comments_count || 0 }}</span>
            </button>
            
            <button
              class="action-btn share-btn"
              @click="toggleCompartir(post.id)"
            >
              <i class="fas fa-share"></i>
              <span>Compartir</span>
            </button>

            <button class="action-btn bookmark-btn">
              <i class="fas fa-bookmark"></i>
            </button>
          </div>

          <!-- Panel de compartir -->
          <div v-if="compartirVisible[post.id]" class="share-panel slide-in">
            <div class="share-header">
              <h4>
                <i class="fas fa-users"></i>
                Compartir con compañeros
              </h4>
              <button @click="toggleCompartir(post.id)" class="close-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="companions-grid">
              <div
                v-for="companion in compañeros"
                :key="companion.id"
                class="companion-card"
              >
                <input
                  type="checkbox"
                  :id="`companion-${companion.companion_id}`"
                  class="companion-checkbox"
                />
                <label :for="`companion-${companion.companion_id}`" class="companion-label">
                  <div class="companion-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <span>{{ companion.companion_name }}</span>
                </label>
              </div>
            </div>
            
            <div class="share-message">
              <textarea
                v-model="mensajeCompartir[post.id]"
                placeholder="Agregar un mensaje (opcional)..."
                class="message-input"
                rows="2"
              ></textarea>
            </div>
            
            <div class="share-actions">
              <button @click="compartirPost(post.id)" class="btn btn-primary">
                <i class="fas fa-paper-plane"></i>
                Enviar
              </button>
            </div>
          </div>

          <!-- Comentarios -->
          <div v-if="comentariosVisibles[post.id]" class="comments-section slide-in">
            <div class="comments-header">
              <h4>Comentarios</h4>
              <button @click="toggleComentarios(post.id, index)" class="close-comments-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="comments-list">
              <div
                v-for="comentario in post.comentarios"
                :key="comentario.id"
                class="comment-item"
              >
                <div class="comment-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <h5>{{ comentario.autor }}</h5>
                    <span class="comment-date">{{ formatearFecha(comentario.created_at) }}</span>
                  </div>
                  <p>{{ comentario.content }}</p>
                  <div class="comment-actions">
                    <button class="comment-action-btn">
                      <i class="fas fa-heart"></i>
                      Me gusta
                    </button>
                    <button class="comment-action-btn">
                      <i class="fas fa-reply"></i>
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="agregarComentario(post.id, index)" class="comment-form">
              <div class="comment-input-wrapper">
                <div class="comment-user-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <input
                  type="text"
                  v-model="nuevoComentario[post.id]"
                  placeholder="Escribe un comentario..."
                  class="comment-input"
                  required
                />
                <button type="submit" class="comment-submit-btn">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
defineOptions({ name: 'ForoComponent' })
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MapSelector from './MapSelector.vue'
import {
  addPost,
  getPosts,
  toggleLike,
  addComment,
  getPostComments,
  getCompanions,
  sharePostWithCompanions,
  subscribeToPostUpdates
} from '../lib/supabaseClient.js'

const mostrarFormulario = ref(false)
const busqueda = ref('')
const nuevaUbicacion = ref(null)
const publicaciones = ref([])
const compañeros = ref([])
const subscription = ref(null)
const currentUserId = ref('user_simulado')

// Estados para comentarios
const comentariosVisibles = ref({})
const nuevoComentario = ref({})

// Estados para compartir
const compartirVisible = ref({})
const mensajeCompartir = ref({})

const nueva = ref({
  autor: 'Usuario Actual',
  titulo: '',
  contenido: '',
  ubicacion: '',
  coordenadas: null
})

// Computed property para filtrar publicaciones
const publicacionesFiltradas = computed(() => {
  if (!busqueda.value) {
    return publicaciones.value
  }

  const termino = busqueda.value.toLowerCase()
  return publicaciones.value.filter(post =>
    post.titulo.toLowerCase().includes(termino) ||
    post.contenido.toLowerCase().includes(termino) ||
    post.autor.toLowerCase().includes(termino) ||
    post.ubicacion.toLowerCase().includes(termino)
  )
})

// Cargar datos iniciales
onMounted(async () => {
  await cargarPublicaciones()
  await cargarCompañeros()
  configurarWebSocket()
})

onUnmounted(() => {
  if (subscription.value) {
    subscription.value.unsubscribe()
  }
})

async function cargarPublicaciones() {
  const { data, error } = await getPosts()
  if (!error && data) {
    publicaciones.value = data.map(post => ({
      ...post,
      fecha: formatearFecha(post.created_at),
      comentarios: []
    }))
  }
}

async function cargarCompañeros() {
  const { data, error } = await getCompanions(currentUserId.value)
  if (!error && data) {
    compañeros.value = data
  }
}

function configurarWebSocket() {
  subscription.value = subscribeToPostUpdates((payload) => {
    if (payload.eventType === 'INSERT' && payload.table === 'posts') {
      const nuevaPublicacion = {
        ...payload.new,
        fecha: formatearFecha(payload.new.created_at),
        comentarios: []
      }
      publicaciones.value.unshift(nuevaPublicacion)

      // Mostrar notificación
      mostrarNotificacion('Nueva publicación disponible')
    }
  })
}

function onLocationSelected(location) {
  nueva.value.ubicacion = location.address
  nueva.value.coordenadas = { lat: location.lat, lng: location.lng }
}

async function agregarPublicacion() {
  const publicacionData = {
    titulo: nueva.value.titulo,
    contenido: nueva.value.contenido,
    ubicacion: nueva.value.ubicacion,
    coordenadas: nueva.value.coordenadas,
    autor: nueva.value.autor,
    autor_id: currentUserId.value
  }

  const { data, error } = await addPost(publicacionData)

  if (!error && data) {
    const publicacionCompleta = {
      ...data,
      fecha: formatearFecha(data.created_at),
      comentarios: []
    }

    publicaciones.value.unshift(publicacionCompleta)

    // Limpiar formulario
    nueva.value.titulo = ''
    nueva.value.contenido = ''
    nueva.value.ubicacion = ''
    nueva.value.coordenadas = null
    nuevaUbicacion.value = null
    mostrarFormulario.value = false

    mostrarNotificacion('Publicación creada exitosamente')
  } else {
    mostrarNotificacion('Error al crear la publicación', 'error')
  }
}

async function manejarLike(postId, index) {
  const { data, error } = await toggleLike(postId, currentUserId.value)

  if (!error && data) {
    const post = publicaciones.value[index]
    if (data.liked) {
      post.likes_count = (post.likes_count || 0) + 1
    } else {
      post.likes_count = Math.max((post.likes_count || 0) - 1, 0)
    }
    post.liked = data.liked
  }
}

async function toggleComentarios(postId, index) {
  comentariosVisibles.value[postId] = !comentariosVisibles.value[postId]

  if (comentariosVisibles.value[postId] && !publicaciones.value[index].comentarios.length) {
    const { data, error } = await getPostComments(postId)
    if (!error && data) {
      publicaciones.value[index].comentarios = data
    }
  }
}

async function agregarComentario(postId, index) {
  const contenido = nuevoComentario.value[postId]
  if (!contenido || !contenido.trim()) return

  const comentarioData = {
    post_id: postId,
    content: contenido.trim(),
    user_id: currentUserId.value
  }

  const { data, error } = await addComment(comentarioData)

  if (!error && data) {
    publicaciones.value[index].comentarios.push(data)
    publicaciones.value[index].comments_count = (publicaciones.value[index].comments_count || 0) + 1
    nuevoComentario.value[postId] = ''

    mostrarNotificacion('Comentario agregado')
  }
}

function toggleCompartir(postId) {
  compartirVisible.value[postId] = !compartirVisible.value[postId]
}

async function compartirPost(postId) {
  const companionIds = Object.keys(compañeros.value).filter(id =>
    document.querySelector(`#companion-${id}`).checked
  )

  if (companionIds.length === 0) {
    mostrarNotificacion('Selecciona al menos un compañero', 'warning')
    return
  }

  const mensaje = mensajeCompartir.value[postId] || ''
  const { error } = await sharePostWithCompanions(postId, companionIds, mensaje)

  if (!error) {
    compartirVisible.value[postId] = false
    mensajeCompartir.value[postId] = ''

    // Desmarcar checkboxes
    companionIds.forEach(id => {
      const checkbox = document.querySelector(`#companion-${id}`)
      if (checkbox) checkbox.checked = false
    })

    mostrarNotificacion(`Post compartido con ${companionIds.length} compañero(s)`)
  }
}

function limpiarBusqueda() {
  busqueda.value = ''
}

function formatearFecha(fecha) {
  const ahora = new Date()
  const fechaPost = new Date(fecha)
  const diferencia = ahora - fechaPost

  const minutos = Math.floor(diferencia / (1000 * 60))
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  if (minutos < 60) {
    return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`
  } else if (horas < 24) {
    return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`
  } else {
    return `Hace ${dias} día${dias !== 1 ? 's' : ''}`
  }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
  const notificacion = document.createElement('div')
  notificacion.className = `notification notification-${tipo} slide-in`
  notificacion.innerHTML = `
    <div class="notification-content">
      <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
      <span>${mensaje}</span>
    </div>
  `
  
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 12px;
    color: white;
    background: ${tipo === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : tipo === 'warning' ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 'linear-gradient(135deg, #27ae60, #2ecc71)'};
    z-index: 1000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    min-width: 300px;
    font-weight: 500;
  `

  document.body.appendChild(notificacion)

  setTimeout(() => {
    notificacion.style.transform = 'translateX(100%)'
    notificacion.style.opacity = '0'
    setTimeout(() => notificacion.remove(), 300)
  }, 4000)
}
</script>

<style scoped>
.forum-layout {
  display: flex;
  min-height: 100vh;
  background: var(--light-bg);
}

/* Sidebar moderna */
.modern-sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-lg);
}

.sidebar-header {
  padding: var(--space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
}

.sidebar-title {
  color: var(--white-text);
  font-size: var(--text-xl);
  font-weight: 700;
  margin: 0;
}

.profile-card {
  margin: var(--space-6);
  padding: var(--space-5);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: var(--transition-base);
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.15);
}

.profile-avatar {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  color: var(--white-text);
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0 0 var(--space-1) 0;
}

.profile-info p {
  color: #bdc3c7;
  font-size: var(--text-sm);
  margin: 0;
}

.profile-link {
  color: #bdc3c7;
  padding: var(--space-2);
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.profile-link:hover {
  color: var(--white-text);
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) 0;
  overflow-y: auto;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin-bottom: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  color: #bdc3c7;
  text-decoration: none;
  transition: var(--transition-base);
  position: relative;
  font-weight: 500;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 60%;
  background: var(--primary-color);
  border-radius: 0 4px 4px 0;
  transition: var(--transition-base);
}

.nav-link:hover {
  color: var(--white-text);
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.nav-link:hover::before,
.nav-link.active::before {
  width: 4px;
}

.nav-link.active {
  color: var(--white-text);
  background: linear-gradient(135deg, rgba(22, 160, 133, 0.2), rgba(26, 188, 156, 0.1));
}

.nav-icon {
  width: 20px;
  display: flex;
  justify-content: center;
}

.sidebar-footer {
  padding: var(--space-6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-mini {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: #bdc3c7;
  font-size: var(--text-sm);
}

.stat-item i {
  color: var(--primary-color);
  width: 16px;
}

/* Contenido principal */
.forum-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

.forum-header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-8);
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h1 {
  color: var(--dark-text);
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0 0 var(--space-2) 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-title h1 i {
  color: var(--primary-color);
}

.header-title p {
  color: var(--light-text);
  margin: 0;
  font-size: var(--text-lg);
}

.new-post-btn {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

/* Sección de búsqueda */
.search-section {
  padding: var(--space-6) var(--space-8);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: var(--space-4);
}

.search-icon {
  position: absolute;
  left: var(--space-5);
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text);
  font-size: var(--text-lg);
}

.search-input {
  width: 100%;
  padding: var(--space-4) var(--space-5) var(--space-4) 3.5rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--text-base);
  background: var(--card-bg);
  transition: var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.clear-search-btn:hover {
  color: var(--error-color);
  background: rgba(231, 76, 60, 0.1);
}

.search-filters {
  display: flex;
  gap: var(--space-3);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--card-bg);
  color: var(--light-text);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: var(--white-text);
}

/* Formulario de nueva publicación */
.new-post-form {
  margin: var(--space-8);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.post-form {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.form-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-avatar {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.form-title h3 {
  color: var(--dark-text);
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0 0 var(--space-1) 0;
}

.form-title p {
  color: var(--light-text);
  margin: 0;
  font-size: var(--text-sm);
}

.form-body {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-6);
}

.title-input {
  width: 100%;
  padding: var(--space-4);
  border: none;
  font-size: var(--text-xl);
  font-weight: 600;
  background: transparent;
  color: var(--dark-text);
  resize: none;
}

.title-input:focus {
  outline: none;
}

.title-input::placeholder {
  color: var(--light-text);
  font-weight: 400;
}

.content-textarea {
  width: 100%;
  padding: var(--space-4);
  border: none;
  font-size: var(--text-base);
  background: transparent;
  color: var(--dark-text);
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.content-textarea:focus {
  outline: none;
}

.content-textarea::placeholder {
  color: var(--light-text);
}

.location-input-wrapper {
  position: relative;
  margin-bottom: var(--space-4);
}

.location-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
}

.location-input {
  width: 100%;
  padding: var(--space-4) var(--space-4) var(--space-4) 2.5rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--text-base);
  background: var(--card-bg);
  transition: var(--transition-base);
}

.location-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}

.post-options {
  display: flex;
  gap: var(--space-3);
}

.option-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--border-radius);
  background: transparent;
  color: var(--light-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: var(--transition-base);
}

.option-btn:hover {
  color: var(--primary-color);
  background: rgba(22, 160, 133, 0.1);
}

.submit-btn {
  padding: var(--space-4) var(--space-6);
  font-weight: 600;
  border-radius: var(--border-radius-lg);
}

/* Lista de publicaciones */
.posts-container {
  padding: var(--space-8);
  max-width: 800px;
  margin: 0 auto;
}

.no-results {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--space-12);
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.no-results-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-results-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-6);
  color: var(--white-text);
  font-size: var(--text-2xl);
}

.no-results h3 {
  color: var(--dark-text);
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.no-results p {
  color: var(--light-text);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

/* Tarjetas de publicaciones */
.post-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  margin-bottom: var(--space-6);
  overflow: hidden;
  transition: var(--transition-base);
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.post-header {
  padding: var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-author {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.author-avatar {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.author-info h4 {
  color: var(--dark-text);
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0 0 var(--space-2) 0;
}

.post-meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--light-text);
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.post-menu {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.menu-btn:hover {
  color: var(--dark-text);
  background: var(--border-color);
}

.post-content {
  padding: 0 var(--space-6) var(--space-6);
}

.post-title {
  color: var(--dark-text);
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-4);
  line-height: 1.4;
}

.post-text {
  color: var(--light-text);
  line-height: 1.7;
  margin: 0;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-color);
  background: rgba(248, 250, 252, 0.5);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--border-radius);
  background: transparent;
  color: var(--light-text);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
}

.action-btn:hover {
  background: rgba(22, 160, 133, 0.1);
  color: var(--primary-color);
}

.like-btn.liked {
  color: var(--error-color);
}

.like-btn.liked:hover {
  color: var(--error-color);
  background: rgba(231, 76, 60, 0.1);
}

.bookmark-btn {
  margin-left: auto;
}

/* Panel de compartir */
.share-panel {
  padding: var(--space-6);
  border-top: 1px solid var(--border-color);
  background: var(--light-bg);
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.share-header h4 {
  color: var(--dark-text);
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.close-btn {
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.close-btn:hover {
  color: var(--error-color);
  background: rgba(231, 76, 60, 0.1);
}

.companions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.companion-card {
  position: relative;
}

.companion-checkbox {
  display: none;
}

.companion-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-base);
  background: var(--card-bg);
}

.companion-label:hover {
  border-color: var(--primary-color);
  background: rgba(22, 160, 133, 0.05);
}

.companion-checkbox:checked + .companion-label {
  border-color: var(--primary-color);
  background: rgba(22, 160, 133, 0.1);
  color: var(--primary-color);
}

.companion-avatar {
  width: 40px;
  height: 40px;
  background: var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
}

.companion-checkbox:checked + .companion-label .companion-avatar {
  background: var(--primary-color);
  color: var(--white-text);
}

.share-message {
  margin-bottom: var(--space-6);
}

.message-input {
  width: 100%;
  padding: var(--space-4);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--text-base);
  background: var(--card-bg);
  resize: vertical;
  transition: var(--transition-base);
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.1);
}

.share-actions {
  display: flex;
  justify-content: flex-end;
}

/* Sección de comentarios */
.comments-section {
  border-top: 1px solid var(--border-color);
  background: var(--light-bg);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6) var(--space-6) var(--space-4);
}

.comments-header h4 {
  color: var(--dark-text);
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0;
}

.close-comments-btn {
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.close-comments-btn:hover {
  color: var(--error-color);
  background: rgba(231, 76, 60, 0.1);
}

.comments-list {
  padding: 0 var(--space-6);
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.comment-avatar {
  font-size: 2rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.comment-header h5 {
  color: var(--dark-text);
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0;
}

.comment-date {
  color: var(--light-text);
  font-size: var(--text-sm);
}

.comment-content p {
  color: var(--light-text);
  margin-bottom: var(--space-3);
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: var(--space-4);
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  color: var(--light-text);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: var(--space-1) 0;
  transition: var(--transition-base);
}

.comment-action-btn:hover {
  color: var(--primary-color);
}

.comment-form {
  padding: var(--space-6);
  border-top: 1px solid var(--border-color);
}

.comment-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-3);
  transition: var(--transition-base);
}

.comment-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.1);
}

.comment-user-avatar {
  font-size: 1.8rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--dark-text);
  padding: var(--space-2) 0;
}

.comment-input:focus {
  outline: none;
}

.comment-input::placeholder {
  color: var(--light-text);
}

.comment-submit-btn {
  background: var(--primary-color);
  border: none;
  color: var(--white-text);
  padding: var(--space-3);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-submit-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 1024px) {
  .modern-sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-base);
  }

  .modern-sidebar.open {
    transform: translateX(0);
  }

  .forum-main {
    margin-left: 0;
  }

  .header-content {
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .search-filters {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .forum-header,
  .search-section,
  .posts-container,
  .new-post-form {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .post-card {
    border-radius: var(--border-radius);
  }

  .post-header {
    padding: var(--space-4);
  }

  .post-content {
    padding: 0 var(--space-4) var(--space-4);
  }

  .post-actions {
    padding: var(--space-3) var(--space-4);
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .action-btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
  }

  .companions-grid {
    grid-template-columns: 1fr;
  }

  .comment-item {
    gap: var(--space-3);
  }

  .comment-avatar {
    font-size: 1.5rem;
  }
}

/* Animaciones y transiciones */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Notificaciones */
.notification {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.notification-content i {
  font-size: var(--text-lg);
}

/* Scrollbar personalizada para comentarios */
.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
}
</style>

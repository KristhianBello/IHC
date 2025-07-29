<template>
  <div class="app-container">
    <aside class="sidebar">
      <router-link to="/perfil" class="profile-link">
        👤 Mi perfil
      </router-link>
      <ul class="main-nav">
        <li>
          <router-link to="/HomeForum" class="nav-link" active-class="active">
            🏠 Inicio
          </router-link>
        </li>
        <li>
          <router-link to="/mapa" class="nav-link" active-class="active">
            🗺️ Mapa de espacios
          </router-link>
        </li>
        <li>
          <router-link to="/galeria" class="nav-link" active-class="active">
            🖼️ Galería
          </router-link>
        </li>
        <li>
          <router-link to="/adopciones" class="nav-link" active-class="active">
            📋 Mis adopciones
          </router-link>
        </li>
        <li>
          <router-link to="/solicitud" class="nav-link" active-class="active">
            🌲 Solicitar adopción
          </router-link>
        </li>
        <li>
          <router-link to="/reportar" class="nav-link" active-class="active">
            🚨 Reportar problema
          </router-link>
        </li>
        <li>
          <router-link to="/programar-tareas" class="nav-link" active-class="active">
            📅 Programar tareas
          </router-link>
        </li>
        <li>
          <router-link to="/compañeros" class="nav-link" active-class="active">
            👥 Mis compañeros
          </router-link>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <div class="forum-header">
        <h2>💬 Foro Vecinal</h2>
        <button
          class="btn btn-new-post"
          @click="mostrarFormulario = !mostrarFormulario"
        >
          {{ mostrarFormulario ? '× Cancelar' : '+ Nueva publicación' }}
        </button>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-container">
        <div class="search-box">
          <input
            type="text"
            v-model="busqueda"
            placeholder="🔍 Buscar publicaciones..."
            class="search-input"
          />
          <button
            v-if="busqueda"
            @click="limpiarBusqueda"
            class="btn-clear-search"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Formulario de nueva publicación -->
      <form
        v-if="mostrarFormulario"
        @submit.prevent="agregarPublicacion"
        class="post-form"
      >
        <div class="form-group">
          <input
            type="text"
            v-model="nueva.titulo"
            placeholder="Título de la publicación"
            required
          />
        </div>
        <div class="form-group">
          <textarea
            v-model="nueva.contenido"
            placeholder="Escribe el contenido..."
            rows="4"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <input
            type="text"
            v-model="nueva.ubicacion"
            placeholder="Ubicación 📍"
          />
          <MapSelector
            v-model="nuevaUbicacion"
            @locationSelected="onLocationSelected"
          />
        </div>
        <button type="submit" class="btn btn-primary btn-block">
          Publicar
        </button>
      </form>

      <!-- Lista de publicaciones -->
      <div class="posts-container">
        <!-- Mensaje cuando no se encuentran resultados -->
        <div v-if="publicacionesFiltradas.length === 0 && busqueda" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No se encontraron publicaciones</h3>
          <p>No hay publicaciones que coincidan con tu búsqueda: "<strong>{{ busqueda }}</strong>"</p>
          <button @click="limpiarBusqueda" class="btn btn-primary">
            Limpiar búsqueda
          </button>
        </div>

        <!-- Publicaciones -->
        <article
          v-for="(post, index) in publicacionesFiltradas"
          :key="index"
          class="post-card"
        >
          <div class="post-header">
            <div class="post-avatar">
              👤
            </div>
            <div class="post-user">
              <h3>{{ post.autor }}</h3>
              <span class="post-date">{{ post.fecha }}</span>
            </div>
          </div>

          <div class="post-content">
            <h4>{{ post.titulo }}</h4>
            <p>{{ post.contenido }}</p>

            <div class="post-location">
              📍 {{ post.ubicacion }}
            </div>
          </div>

          <div class="post-actions">
            <button 
              class="btn-like"
              :class="{ 'liked': post.liked }"
              @click="manejarLike(post.id, index)"
            >
              <i class="fas fa-heart"></i> {{ post.likes_count || 0 }}
            </button>
            <button 
              class="btn-comment"
              @click="toggleComentarios(post.id, index)"
            >
              <i class="fas fa-comment"></i> {{ comentariosVisibles[post.id] ? 'Ocultar' : 'Comentarios' }} ({{ post.comments_count || 0 }})
            </button>
            <button 
              class="btn-share"
              @click="toggleCompartir(post.id)"
            >
              <i class="fas fa-share"></i> Compartir
            </button>
          </div>

          <!-- Panel de compartir -->
          <div v-if="compartirVisible[post.id]" class="share-panel">
            <h4><i class="fas fa-users"></i> Compartir con compañeros</h4>
            <div class="companions-list">
              <div 
                v-for="companion in compañeros" 
                :key="companion.id" 
                class="companion-item"
              >
                <input 
                  type="checkbox" 
                  :id="`companion-${companion.companion_id}`"
                  class="companion-checkbox"
                />
                <label :for="`companion-${companion.companion_id}`" class="companion-label">
                  <i class="fas fa-user"></i> {{ companion.companion_name }}
                </label>
              </div>
            </div>
            <div class="share-message">
              <input 
                type="text" 
                v-model="mensajeCompartir[post.id]"
                placeholder="Mensaje opcional..."
                class="share-input"
              />
            </div>
            <div class="share-actions">
              <button @click="compartirPost(post.id)" class="btn btn-primary">
                <i class="fas fa-paper-plane"></i> Enviar
              </button>
              <button @click="toggleCompartir(post.id)" class="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>

          <!-- Comentarios -->
          <div v-if="comentariosVisibles[post.id]" class="post-comments">
            <div class="comments-list">
              <div 
                v-for="comentario in post.comentarios" 
                :key="comentario.id" 
                class="comment"
              >
                <div class="comment-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="comment-content">
                  <h5>{{ comentario.autor }}</h5>
                  <p>{{ comentario.content }}</p>
                  <span class="comment-date">{{ formatearFecha(comentario.created_at) }}</span>
                </div>
              </div>
            </div>

            <form @submit.prevent="agregarComentario(post.id, index)" class="comment-form">
              <input
                type="text"
                v-model="nuevoComentario[post.id]"
                placeholder="Escribe un comentario..."
                class="comment-input"
                required
              />
              <button type="submit" class="btn-comment-submit">
                <i class="fas fa-paper-plane"></i>
              </button>
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
    
    mostrarNotificación('Comentario agregado')
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
  const { data, error } = await sharePostWithCompanions(postId, companionIds, mensaje)
  
  if (!error) {
    compartirVisible.value[postId] = false
    mensajeCompartir.value[postId] = ''
    
    // Desmarcar checkboxes
    companionIds.forEach(id => {
      const checkbox = document.querySelector(`#companion-${id}`)
      if (checkbox) checkbox.checked = false
    })
    
    mostrarNotificación(`Post compartido con ${companionIds.length} compañero(s)`)
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
  // Crear notificación temporal
  const notificacion = document.createElement('div')
  notificacion.className = `notificacion notificacion-${tipo}`
  notificacion.textContent = mensaje
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    background-color: ${tipo === 'error' ? '#e74c3c' : tipo === 'warning' ? '#f39c12' : '#2ecc71'};
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `
  
  document.body.appendChild(notificacion)
  
  setTimeout(() => {
    notificacion.remove()
  }, 3000)
}
</script>

<style scoped>
/* Variables de color */
:root {
  --primary-green: #2E8B57;
  --secondary-green: #98FB98;
  --light-bg: #F5F5F5;
  --dark-text: #333333;
  --white: #FFFFFF;
  --gray-border: #E0E0E0;
  --hover-green: #3CB371;
}

/* Estructura principal */
.app-container {
  display: flex;
  min-height: calc(100vh - 80px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--light-bg);
}

.sidebar {
  width: 250px;
  background-color: var(--white);
  padding: 1.5rem;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  height: 100vh;
}

.logo {
  width: 80%;
  max-width: 180px;
  display: block;
  margin: 0 auto 1.5rem;
}

.profile-link {
  display: block;
  padding: 0.8rem 1rem;
  border-radius: 5px;
  color: var(--dark-text);
  margin-bottom: 1rem;
  background-color: var(--secondary-green);
  font-weight: 500;
  text-align: center;
}

.main-nav {
  list-style: none;
  padding: 0;
}

.main-nav li {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1rem;
  border-radius: 5px;
  color: var(--dark-text);
}

.nav-link:hover {
  background-color: var(--secondary-green);
}

.nav-link.active {
  background-color: var(--primary-green);
  color: var(--white);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.forum-header h2 {
  color: var(--primary-green);
}

.btn {
  padding: 0.7rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-green);
  color: var(--white);
}

.btn-primary:hover {
  background-color: var(--hover-green);
  transform: translateY(-2px);
}

.btn-new-post {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-green);
  color: var(--white);
}

.btn-new-post:hover {
  background-color: var(--hover-green);
}

/* Barra de búsqueda */
.search-container {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--gray-border);
  border-radius: 25px;
  font-size: 1rem;
  background-color: var(--white);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
}

.btn-clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  font-size: 1rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-clear-search:hover {
  background-color: var(--gray-border);
  color: var(--primary-green);
}

/* Formulario de publicación */
.post-form {
  background-color: var(--white);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--gray-border);
  border-radius: 5px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Tarjetas de publicaciones */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-card {
  background-color: var(--white);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 1.5rem;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--secondary-green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.post-user h3 {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.post-date {
  font-size: 0.8rem;
  color: #777;
}

.post-content h4 {
  margin-bottom: 0.8rem;
  color: var(--primary-green);
}

.post-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #777;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.post-actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--gray-border);
  border-bottom: 1px solid var(--gray-border);
}

.post-actions button {
  background: none;
  border: none;
  color: #777;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.post-actions button:hover {
  color: var(--primary-green);
}

/* Mensaje sin resultados */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--white);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  color: var(--dark-text);
  margin-bottom: 1rem;
}

.no-results p {
  color: #777;
  margin-bottom: 1.5rem;
}

.no-results strong {
  color: var(--primary-green);
}

/* Comentarios */
.post-comments {
  margin-top: 1rem;
  border-top: 1px solid var(--gray-border);
  padding-top: 1rem;
}

.comments-list {
  margin-bottom: 1rem;
}

.comment {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comment-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: var(--secondary-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 1.1rem;
}

.comment-content {
  flex: 1;
}

.comment-content h5 {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: var(--primary-green);
  font-weight: 600;
}

.comment-content p {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  line-height: 1.4;
}

.comment-date {
  font-size: 0.75rem;
  color: #777;
}

.comment-form {
  display: flex;
  gap: 0.5rem;
}

.comment-input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid var(--gray-border);
  border-radius: 20px;
  font-size: 0.9rem;
  background-color: var(--white);
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 2px rgba(46, 139, 87, 0.1);
}

.btn-comment-submit {
  padding: 0.8rem 1.2rem;
  background-color: var(--primary-green);
  color: var(--white);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-comment-submit:hover {
  background-color: var(--hover-green);
  transform: translateY(-1px);
}

/* Panel de compartir */
.share-panel {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid var(--gray-border);
}

.share-panel h4 {
  margin-bottom: 1rem;
  color: var(--primary-green);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.companions-list {
  margin-bottom: 1rem;
  max-height: 150px;
  overflow-y: auto;
}

.companion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.3rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.companion-item:hover {
  background-color: rgba(46, 139, 87, 0.05);
}

.companion-checkbox {
  margin: 0;
  transform: scale(1.1);
}

.companion-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  flex: 1;
  font-size: 0.9rem;
  color: var(--dark-text);
}

.share-message {
  margin-bottom: 1rem;
}

.share-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--gray-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: var(--white);
}

.share-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary {
  background-color: #6c757d;
  color: var(--white);
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Botones de acciones mejorados */
.post-actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--gray-border);
  border-bottom: 1px solid var(--gray-border);
}

.post-actions button {
  background: none;
  border: none;
  color: #777;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.post-actions button:hover {
  color: var(--primary-green);
  background-color: rgba(46, 139, 87, 0.05);
  transform: translateY(-1px);
}

.btn-like.liked {
  color: #e74c3c;
}

.btn-like.liked i {
  color: #e74c3c;
}

/* Notificaciones */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notificacion {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Estados de carga */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--primary-green);
}

.loading i {
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    padding: 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .forum-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>

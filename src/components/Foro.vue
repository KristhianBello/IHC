<template>
  <div class="app-container">
    <aside class="sidebar">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
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
          <router-link to="/solicitud" class="nav-link" active-class="active">
            🌲 Solicitar adopción
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
        </div>
        <button type="submit" class="btn btn-primary btn-block">
          Publicar
        </button>
      </form>

      <!-- Lista de publicaciones -->
      <div class="posts-container">
        <article 
          v-for="(post, index) in publicaciones" 
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
            <button class="btn-like">
              ❤️ {{ post.likes }}
            </button>
            <button class="btn-comment">
              💬 Comentar
            </button>
            <button class="btn-share">
              ↗️ Compartir
            </button>
          </div>
          
          <div class="post-comments">
            <div class="comment">
              <div class="comment-avatar">
                👤
              </div>
              <div class="comment-content">
                <h5>Carlos Mendoza</h5>
                <p>¡Excelente trabajo! Me encantaría unirme a la próxima jornada.</p>
              </div>
            </div>
            
            <form class="comment-form">
              <input 
                type="text" 
                placeholder="Escribe un comentario..." 
                class="comment-input"
              />
              <button type="submit" class="btn-comment-submit">
                Enviar
              </button>
            </form>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mostrarFormulario = ref(false)

const publicaciones = ref([
  {
    autor: 'María González',
    fecha: 'Hace 2 días',
    titulo: 'Limpieza en el Parque Central',
    contenido: 'Este fin de semana organizamos una jornada de limpieza en el Parque Central. Logramos recoger más de 20 bolsas de basura y podar los arbustos. ¡Gracias a todos los voluntarios!',
    ubicacion: 'Parque Central, Sector Norte',
    likes: 24,
  },
])

const nueva = ref({
  autor: 'Tú',
  fecha: 'Ahora',
  titulo: '',
  contenido: '',
  ubicacion: '',
  likes: 0,
})

function agregarPublicacion() {
  publicaciones.value.unshift({ ...nueva.value })
  nueva.value.titulo = ''
  nueva.value.contenido = ''
  nueva.value.ubicacion = ''
  mostrarFormulario.value = false
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

.btn-block {
  width: 100%;
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

/* Comentarios */
.post-comments {
  margin-top: 1rem;
}

.comment {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: var(--secondary-green);
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-content h5 {
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.comment-content p {
  font-size: 0.9rem;
}

.comment-form {
  display: flex;
  margin-top: 1rem;
}

.comment-input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid var(--gray-border);
  border-radius: 20px 0 0 20px;
  border-right: none;
}

.btn-comment-submit {
  padding: 0 1.2rem;
  background-color: var(--primary-green);
  color: var(--white);
  border: none;
  border-radius: 0 20px 20px 0;
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
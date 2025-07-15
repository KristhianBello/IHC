<template>
  <div class="forum-container">
    <aside class="sidebar">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <RouterLink to="/perfil" class="profile-link">
        <i class="fas fa-user"></i> Mi perfil
      </RouterLink>
      <ul class="nav-menu">
        <li>
          <RouterLink to="/" class="nav-link" active-class="active">
            <i class="fas fa-home"></i> Inicio
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/mapa" class="nav-link" active-class="active">
            <i class="fas fa-map-marked-alt"></i> Mapa de espacios
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/galeria" class="nav-link" active-class="active">
            <i class="fas fa-images"></i> Galería
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/solicitud" class="nav-link" active-class="active">
            <i class="fas fa-hand-holding-heart"></i> Solicitar adopción
          </RouterLink>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <div class="forum-header">
        <h2><i class="fas fa-comments"></i> Foro Vecinal</h2>
        <RouterLink to="/foro">
          <button class="btn btn-primary">
            <i class="fas fa-plus"></i> Nueva publicación
          </button>
        </RouterLink>
      </div>

      <article class="post-card">
        <div class="post-header">
          <div class="post-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="post-user">
            <h3>María González</h3>
            <span class="post-date">Hace 2 días</span>
          </div>
        </div>
        
        <div class="post-content">
          <h4>Limpieza en el Parque Central</h4>
          <p>
            Este fin de semana organizamos una jornada de limpieza en el Parque Central. 
            Logramos recoger más de 20 bolsas de basura y podar los arbustos. 
            ¡Gracias a todos los voluntarios!
          </p>
          
          <div class="post-images">
            <img :src="img1" alt="Limpieza de parque" />
            <img :src="img2" alt="Voluntarios trabajando" />
          </div>
          
          <div class="post-location">
            <i class="fas fa-map-marker-alt"></i> Parque Central, Sector Norte
          </div>
        </div>
        
        <div class="post-actions">
          <button class="btn-like">
            <i class="far fa-heart"></i> 24
          </button>
          <button class="btn-comment">
            <i class="far fa-comment"></i> Comentar
          </button>
        </div>
        
        <div class="post-comments">
          <div class="comment">
            <div class="comment-avatar">
              <i class="fas fa-user-circle"></i>
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
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
const img1 = new URL('@/assets/foro1.jpg', import.meta.url).href
const img2 = new URL('@/assets/foro2.jpg', import.meta.url).href
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
.forum-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--light-bg);
}

.sidebar {
  width: 280px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1rem;
  border-radius: 5px;
  color: var(--dark-text);
  margin-bottom: 1rem;
  background-color: var(--secondary-green);
  font-weight: 500;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
}

.nav-menu li {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1rem;
  border-radius: 5px;
  color: var(--dark-text);
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: var(--secondary-green);
}

.nav-link.active {
  background-color: var(--primary-green);
  color: var(--white);
}

.nav-link i {
  width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Encabezado del foro */
.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.forum-header h2 {
  color: var(--primary-green);
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 0.7rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: var(--primary-green);
  color: var(--white);
}

.btn-primary:hover {
  background-color: var(--hover-green);
  transform: translateY(-2px);
}

/* Tarjeta de publicación */
.post-card {
  background-color: var(--white);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.post-avatar {
  font-size: 2rem;
  color: var(--primary-green);
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

.post-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 1rem 0;
}

.post-images img {
  width: 100%;
  border-radius: 5px;
  object-fit: cover;
  max-height: 200px;
}

.post-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #777;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Acciones y comentarios */
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

.post-comments {
  margin-top: 1rem;
}

.comment {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.comment-avatar {
  font-size: 1.5rem;
  color: #777;
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
  .forum-container {
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
  
  .post-images {
    grid-template-columns: 1fr;
  }
}
</style>
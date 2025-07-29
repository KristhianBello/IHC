<template>
  <div>
    <header class="suggestion-header">
      <div class="header-content">
        <img src="@/assets/logo.png" alt="Logo" class="header-logo" />
        <RouterLink to="/foro" class="btn-back-foro">
          <i class="fas fa-arrow-left"></i> Volver al foro
        </RouterLink>
      </div>
    </header>

    <div class="suggestion-form-container">
      <div class="form-header">
        <h1><i class="fas fa-lightbulb"></i> Sugerencias y comentarios</h1>
        <p>¿Tienes una idea, sugerencia o comentario para mejorar la plataforma o tu comunidad? ¡Compártelo aquí!</p>
      </div>
      <form class="suggestion-form" @submit.prevent="handleSubmit">
      <section class="form-section">
        <h2><i class="fas fa-user"></i> Información de contacto</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input type="text" id="name" v-model="formData.name" placeholder="Ej. Juan Pérez" />
          </div>
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" v-model="formData.email" placeholder="Ej. juan@email.com" />
          </div>
        </div>
      </section>
      <section class="form-section">
        <h2><i class="fas fa-comment-dots"></i> Tu sugerencia</h2>
        <div class="form-group">
          <label for="message">Mensaje *</label>
          <textarea id="message" v-model="formData.message" rows="5" placeholder="Escribe tu sugerencia, comentario o idea..." required></textarea>
        </div>
      </section>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-lg">
          <i class="fas fa-paper-plane"></i> Enviar sugerencia
        </button>
      </div>
    </form>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const formData = ref({
  name: '',
  email: '',
  message: ''
})

function handleSubmit() {
  if (!formData.value.message.trim()) {
    alert('Por favor, escribe tu sugerencia o comentario.')
    return
  }
  // Aquí podrías enviar la sugerencia a tu backend o mostrar un mensaje de éxito
  alert('¡Gracias por tu sugerencia!')
  formData.value = { name: '', email: '', message: '' }
}
</script>

<style scoped>
.suggestion-header {
  background: var(--white, #fff);
  border-bottom: 1px solid var(--gray-border, #E0E0E0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0.5rem 0;
  margin-bottom: 2rem;
}
.header-content {
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.header-logo {
  height: 48px;
  width: auto;
}
.btn-back-foro {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-green, #2E8B57);
  color: var(--white, #fff);
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-back-foro:hover {
  background: var(--hover-green, #3CB371);
}
.suggestion-form-container {
  max-width: 600px;
  margin: 2rem auto;
  background: var(--white, #fff);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 2rem 1.5rem;
}
.form-header {
  text-align: center;
  margin-bottom: 2rem;
}
.form-header h1 {
  color: var(--primary-green, #2E8B57);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-header p {
  color: var(--dark-text, #333);
}
.suggestion-form {
  background: transparent;
}
.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-border, #E0E0E0);
}
.form-section:last-child {
  border-bottom: none;
}
.form-section h2 {
  color: var(--primary-green, #2E8B57);
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}
.form-row .form-group {
  flex: 1;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
  gap: 8px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--gray-border, #E0E0E0);
  border-radius: 5px;
  font-size: 1rem;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-green, #2E8B57);
  box-shadow: 0 0 0 2px rgba(46, 139, 87, 0.2);
}
.form-group textarea {
  resize: vertical;
  min-height: 100px;
}
.form-actions {
  text-align: center;
  margin-top: 2rem;
}
.btn-primary {
  background-color: var(--primary-green, #2E8B57);
  color: var(--white, #fff);
}
.btn-primary:hover {
  background-color: var(--hover-green, #3CB371);
  transform: translateY(-2px);
}
.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}
@media (max-width: 768px) {
  .suggestion-form-container {
    padding: 1rem 0.5rem;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>

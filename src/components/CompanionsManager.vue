<template>
  <div class="companions-manager">
    <div class="header">
      <h2><i class="fas fa-users"></i> Mis Compañeros</h2>
      <button @click="mostrarAgregarForm = !mostrarAgregarForm" class="btn btn-primary">
        <i class="fas fa-plus"></i> Agregar Compañero
      </button>
    </div>

    <!-- Formulario para agregar compañero -->
    <div v-if="mostrarAgregarForm" class="add-companion-form">
      <div class="form-group">
        <input 
          type="text" 
          v-model="buscarUsuario"
          placeholder="Buscar usuario por nombre o email..."
          class="search-input"
          @input="buscarUsuarios"
        />
      </div>
      
      <div v-if="usuariosEncontrados.length > 0" class="search-results">
        <div 
          v-for="usuario in usuariosEncontrados" 
          :key="usuario.id"
          class="user-result"
          @click="enviarSolicitudAmistad(usuario)"
        >
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-info">
            <h4>{{ usuario.username }}</h4>
            <p>{{ usuario.email }}</p>
          </div>
          <button class="btn btn-small btn-primary">
            <i class="fas fa-user-plus"></i> Agregar
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de compañeros -->
    <div class="companions-list">
      <div 
        v-for="companion in compañeros" 
        :key="companion.id"
        class="companion-card"
      >
        <div class="companion-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="companion-info">
          <h3>{{ companion.companion_name }}</h3>
          <span class="companion-status" :class="companion.status">
            {{ getStatusText(companion.status) }}
          </span>
        </div>
        <div class="companion-actions">
          <button 
            v-if="companion.status === 'pending'" 
            @click="aceptarSolicitud(companion.id)"
            class="btn btn-small btn-success"
          >
            <i class="fas fa-check"></i> Aceptar
          </button>
          <button 
            @click="eliminarCompanion(companion.id)"
            class="btn btn-small btn-danger"
          >
            <i class="fas fa-times"></i> {{ companion.status === 'pending' ? 'Rechazar' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="compañeros.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-users"></i>
      </div>
      <h3>No tienes compañeros aún</h3>
      <p>Agrega compañeros para poder compartir publicaciones y colaborar en proyectos comunitarios.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCompanions, addCompanion } from '../lib/supabaseClient.js'

const compañeros = ref([])
const mostrarAgregarForm = ref(false)
const buscarUsuario = ref('')
const usuariosEncontrados = ref([])
const currentUserId = ref('user_simulado')

onMounted(async () => {
  await cargarCompañeros()
})

async function cargarCompañeros() {
  const { data, error } = await getCompanions(currentUserId.value)
  if (!error && data) {
    compañeros.value = data
  }
}

function buscarUsuarios() {
  // Simulación de búsqueda de usuarios
  if (buscarUsuario.value.length > 2) {
    usuariosEncontrados.value = [
      {
        id: 'user_search_1',
        username: 'Ana García',
        email: 'ana.garcia@email.com'
      },
      {
        id: 'user_search_2', 
        username: 'Luis Morales',
        email: 'luis.morales@email.com'
      }
    ].filter(user => 
      user.username.toLowerCase().includes(buscarUsuario.value.toLowerCase()) ||
      user.email.toLowerCase().includes(buscarUsuario.value.toLowerCase())
    )
  } else {
    usuariosEncontrados.value = []
  }
}

async function enviarSolicitudAmistad(usuario) {
  const { data, error } = await addCompanion(usuario.id)
  
  if (!error) {
    mostrarNotificacion(`Solicitud enviada a ${usuario.username}`)
    buscarUsuario.value = ''
    usuariosEncontrados.value = []
    mostrarAgregarForm.value = false
    
    // Agregar a la lista como pendiente
    compañeros.value.push({
      id: data.id,
      companion_id: usuario.id,
      companion_name: usuario.username,
      status: 'pending'
    })
  }
}

async function aceptarSolicitud(companionId) {
  // Simular aceptación de solicitud
  const companion = compañeros.value.find(c => c.id === companionId)
  if (companion) {
    companion.status = 'accepted'
    mostrarNotificacion('Solicitud aceptada')
  }
}

async function eliminarCompanion(companionId) {
  if (confirm('¿Estás seguro de que quieres eliminar este compañero?')) {
    compañeros.value = compañeros.value.filter(c => c.id !== companionId)
    mostrarNotificacion('Compañero eliminado')
  }
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Pendiente',
    'accepted': 'Aceptado',
    'blocked': 'Bloqueado'
  }
  return statusMap[status] || status
}

function mostrarNotificacion(mensaje, tipo = 'success') {
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
.companions-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: var(--primary-green);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-companion-form {
  background-color: var(--white);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--gray-border);
  border-radius: 8px;
  font-size: 1rem;
}

.search-results {
  margin-top: 1rem;
}

.user-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--gray-border);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-result:hover {
  background-color: var(--light-bg);
  border-color: var(--primary-green);
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: var(--secondary-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 1.2rem;
}

.user-info {
  flex: 1;
}

.user-info h4 {
  margin-bottom: 0.2rem;
  color: var(--dark-text);
}

.user-info p {
  color: #777;
  font-size: 0.9rem;
}

.companions-list {
  display: grid;
  gap: 1rem;
}

.companion-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--white);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.companion-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--secondary-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 1.5rem;
}

.companion-info {
  flex: 1;
}

.companion-info h3 {
  margin-bottom: 0.3rem;
  color: var(--dark-text);
}

.companion-status {
  font-size: 0.85rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
}

.companion-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.companion-status.accepted {
  background-color: #d4edda;
  color: #155724;
}

.companion-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.7rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-primary {
  background-color: var(--primary-green);
  color: var(--white);
}

.btn-success {
  background-color: #28a745;
  color: var(--white);
}

.btn-danger {
  background-color: #dc3545;
  color: var(--white);
}

.btn-small {
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--white);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 3rem;
  color: var(--primary-green);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--dark-text);
  margin-bottom: 1rem;
}

.empty-state p {
  color: #777;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
}

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
</style>

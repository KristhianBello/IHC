<!-- Componente para probar funcionalidad de autenticación -->
<template>
  <div class="auth-test">
    <div v-if="isLoggedIn" class="user-info">
      <h3>¡Hola, {{ currentUser?.email }}!</h3>
      <p>Estás conectado correctamente.</p>
      <button @click="handleLogout" class="btn btn-danger" :disabled="loggingOut">
        <i v-if="loggingOut" class="fas fa-spinner fa-spin"></i>
        {{ loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}
      </button>
    </div>
    <div v-else class="not-logged-in">
      <p>No has iniciado sesión.</p>
      <router-link to="/" class="btn btn-primary">Ir al Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, isAuthenticated, logoutUser } from '@/stores/authStore'

const router = useRouter()
const loggingOut = ref(false)

const currentUser = computed(() => getCurrentUser())
const isLoggedIn = computed(() => isAuthenticated())

async function handleLogout() {
  loggingOut.value = true

  try {
    const result = await logoutUser()
    if (result.success) {
      console.log('Logout exitoso:', result.message)
      router.push('/')
    } else {
      console.error('Error en logout:', result.error)
      alert('Error al cerrar sesión: ' + result.error)
    }
  } catch (error) {
    console.error('Error inesperado en logout:', error)
    alert('Error inesperado al cerrar sesión')
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>
.auth-test {
  padding: 2rem;
  text-align: center;
}

.user-info {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.user-info h3 {
  color: #2E8B57;
  margin-bottom: 1rem;
}

.not-logged-in {
  background: #fff3cd;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3CB371;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

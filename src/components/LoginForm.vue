<template>
  <div>
    <header class="header">
      <!-- ##logo pendiente## -->
      <div class="auth-buttons">
        <router-link to="/registro" class="btn btn-outline">Registrarte</router-link>
      </div>
    </header>

    <main class="auth-container" id="main-content">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Iniciar sesión</h1>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              placeholder="tucorreo@ejemplo.com"
              :class="{ 'error': errors.email }"
              required
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group password-group">
            <label for="password">Contraseña</label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="formData.password"
                placeholder="••••••••"
                :class="{ 'error': errors.password }"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="togglePasswordVisibility"
                aria-label="Mostrar/Ocultar contraseña"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>

          <div class="forgot-password-container">
            <router-link to="/forgot-password" class="forgot-password">
              ¿Olvidaste la contraseña?
            </router-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/stores/authStore'

const router = useRouter()

// Reactive form data
const formData = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errors = ref({})

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function validateForm() {
  errors.value = {}

  if (!formData.value.email.trim()) {
    errors.value.email = 'El email es requerido'
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.value.email = 'El formato del email no es válido'
  }

  if (!formData.value.password) {
    errors.value.password = 'La contraseña es requerida'
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

async function handleLogin() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  // Limpiar errores previos
  errors.value = {}

  try {
    const result = await loginUser({
      email: formData.value.email.trim().toLowerCase(),
      password: formData.value.password
    })

    if (result.success) {
      // Reset form
      formData.value = {
        email: '',
        password: ''
      }

      // Mostrar mensaje de éxito
      alert('¡Inicio de sesión exitoso!')

      // Redirect to foro
      router.push('/foro')
    } else {
      // Manejar errores específicos de Supabase
      let errorMessage = 'Error desconocido'

      if (result.error.includes('Invalid login credentials') ||
          result.error.includes('invalid_credentials')) {
        errorMessage = 'Email o contraseña incorrectos'
      } else if (result.error.includes('Email not confirmed') ||
                 result.error.includes('email_not_confirmed')) {
        errorMessage = 'Por favor verifica tu email antes de iniciar sesión'
      } else if (result.error.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos fallidos. Intenta nuevamente en unos minutos'
      } else if (result.error.includes('User not found')) {
        errorMessage = 'No existe una cuenta con este email'
      } else {
        errorMessage = result.error
      }

      alert(errorMessage)
    }
  } catch (error) {
    console.error('Error inesperado:', error)
    alert('Ocurrió un error inesperado. Por favor intenta nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Variables de color - tema verde */
:root {
  --primary-green: #2E8B57;
  --hover-green: #3CB371;
  --light-green: rgba(46, 139, 87, 0.2);
  --error-red: #dc3545;
  --error-light: rgba(220, 53, 69, 0.2);
  --text-dark: #333;
  --text-light: #666;
  --border-light: #ddd;
  --bg-gradient-start: #f5f7fa;
  --bg-gradient-end: #c3cfe2;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

/* Container principal */
.auth-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.auth-header h1 {
  text-align: center;
  color: var(--primary-green);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

/* Formulario */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.8rem;
  border: 1px solid var(--border-light);
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 2px var(--light-green);
}

.form-group input.error {
  border-color: var(--error-red);
  box-shadow: 0 0 0 2px var(--error-light);
}

/* Password input */
.password-group .password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-group .password-input input {
  flex: 1;
  padding-right: 80px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.toggle-password:hover {
  color: var(--primary-green);
  text-decoration: underline;
}

/* Mensajes de error */
.error-message {
  color: var(--error-red);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Botones */
.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background-color: var(--primary-green);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--hover-green);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background-color: transparent;
  color: var(--primary-green);
  border: 2px solid var(--primary-green);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.btn-outline:hover {
  background-color: var(--primary-green);
  color: white;
}

.btn-block {
  width: 100%;
}

/* Enlaces */
.forgot-password-container {
  text-align: center;
  margin-top: 1rem;
}

.forgot-password {
  color: var(--primary-green);
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .auth-header h1 {
    font-size: 1.5rem;
  }
}
</style>

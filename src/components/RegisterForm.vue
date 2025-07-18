<template>
  <div class="register-card">
    <h1>Crear cuenta</h1>

    <form class="auth-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="nombre">Nombre completo</label>
        <input
          type="text"
          id="nombre"
          v-model="formData.nombre"
          placeholder="Tu nombre completo"
          :class="{ 'error': errors.nombre }"
          required
        />
        <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
      </div>

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

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          placeholder="••••••••"
          :class="{ 'error': errors.password }"
          required
        />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirmar contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="formData.confirmPassword"
          placeholder="••••••••"
          :class="{ 'error': errors.confirmPassword }"
          required
        />
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-block"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Registrando...' : 'Registrarte' }}
      </button>

      <div class="login-redirect">
        ¿Ya tienes una cuenta?
        <router-link to="/" class="link">Inicia sesión</router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-card {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-card h1 {
  text-align: center;
  color: #2E8B57;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #2E8B57;
  box-shadow: 0 0 0 2px rgba(46, 139, 87, 0.2);
}

.form-group input.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3CB371;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-block {
  width: 100%;
}

.login-redirect {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.link {
  color: #2E8B57;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .register-card {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/stores/authStore'

const router = useRouter()

// Reactive form data
const formData = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({})
const isSubmitting = ref(false)

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

function validateForm() {
  errors.value = {}

  if (!formData.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es requerido'
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'El email es requerido'
  } else if (!validateEmail(formData.value.email)) {
    errors.value.email = 'El email no es válido'
  }

  if (!formData.value.password) {
    errors.value.password = 'La contraseña es requerida'
  } else if (!validatePassword(formData.value.password)) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Confirma tu contraseña'
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
  }

  return Object.keys(errors.value).length === 0
}

async function handleRegister() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const result = await registerUser({
      nombre: formData.value.nombre.trim(),
      email: formData.value.email.trim().toLowerCase(),
      password: formData.value.password
    })

    if (result.success) {
      alert('¡Registro exitoso! ' + result.message)

      // Reset form
      formData.value = {
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
      }

      // Redirect to login
      router.push('/')
    } else {
      // Handle specific errors
      if (result.error.includes('already registered')) {
        errors.value.email = 'Este email ya está registrado'
      } else if (result.error.includes('Password')) {
        errors.value.password = 'La contraseña no cumple con los requisitos'
      } else {
        alert('Error: ' + result.error)
      }
    }
  } catch (error) {
    console.error('Error inesperado:', error)
    alert('Ocurrió un error inesperado. Por favor intenta nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}
</script>



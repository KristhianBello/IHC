<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="Logo" class="login-logo" />
        <h1 class="login-title">EcoVecinos</h1>
        <p class="login-subtitle">{{ t('welcomeMessage') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">
            <i class="fas fa-envelope"></i>
            {{ t('email') }}
          </label>
          <input
            id="email"
            v-model="loginData.email"
            type="email"
            class="form-input"
            :placeholder="t('emailPlaceholder')"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <i class="fas fa-lock"></i>
            {{ t('password') }}
          </label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="loginData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input password-input"
              :placeholder="t('passwordPlaceholder')"
              required
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="togglePasswordVisibility"
              :title="showPassword ? t('hidePassword') : t('showPassword')"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            {{ t('rememberMe') }}
          </label>
          <a href="#" class="forgot-password">{{ t('forgotPassword') }}</a>
        </div>

        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sign-in-alt"></i>
          {{ isLoading ? t('loggingIn') : t('loginButton') }}
        </button>

        <div class="login-divider">
          <span>{{ t('or') }}</span>
        </div>

        <router-link to="/registro" class="btn-register">
          <i class="fas fa-user-plus"></i>
          {{ t('registerButton') }}
        </router-link>
      </form>

      <div class="form-footer">
        <div class="language-selector">
          <button @click="changeLanguage('es')" :class="{ active: currentLanguage === 'es' }">
            <span class="flag">🇪🇸</span>
            ES
          </button>
          <button @click="changeLanguage('en')" :class="{ active: currentLanguage === 'en' }">
            <span class="flag">🇺🇸</span>
            EN
          </button>
        </div>

        <div class="theme-toggle">
          <button @click="toggleTheme" class="theme-btn">
            <i :class="currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
            {{ currentTheme === 'dark' ? t('lightMode') : t('darkMode') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n.js'
import { useTheme } from '@/composables/useTheme.js'
import { signInWithPassword } from '@/lib/supabaseClient.js'

const router = useRouter()
const { t, changeLanguage, currentLanguage } = useI18n()
const { currentTheme, toggleTheme } = useTheme()

const loginData = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

// Función para mostrar/ocultar contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!loginData.value.email || !loginData.value.password) {
    errorMessage.value = t('fillAllFields')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await signInWithPassword({
      email: loginData.value.email,
      password: loginData.value.password
    })

    if (error) {
      errorMessage.value = error.message || t('loginError')
      return
    }

    if (data?.user) {
      console.log('Login exitoso:', data.user)
      // Redirigir al foro después del login exitoso
      router.push('/foro')
    } else {
      errorMessage.value = t('loginError')
    }
  } catch (error) {
    console.error('Error en login:', error)
    errorMessage.value = t('loginError')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 20px;
}

.login-card {
  background: var(--bg-primary);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.6s ease-out;
  border: 1px solid var(--border-color);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.login-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e8ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #28a745;
  background: white;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  border: 1px solid #f5c6cb;
}

.error-message i {
  font-size: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #6c757d;
  font-size: 0.9rem;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  font-size: 1rem;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle-btn:hover {
  color: #28a745;
}

.password-toggle-btn:focus {
  outline: 2px solid #28a745;
  outline-offset: 2px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.theme-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent-color);
}

@media (max-width: 480px) {
  .form-footer {
    flex-direction: column;
    gap: 0.75rem;
  }
}

.checkbox-label input {
  margin-right: 8px;
}

.forgot-password {
  color: #28a745;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-divider {
  text-align: center;
  position: relative;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8ecef;
}

.login-divider span {
  background: white;
  padding: 0 20px;
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-register {
  width: 100%;
  background: transparent;
  color: #28a745;
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
}

.btn-register:hover {
  background: #28a745;
  color: white;
  transform: translateY(-2px);
}

.language-selector {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e8ecef;
}

.language-selector button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: 2px solid #e8ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.language-selector button.active {
  border-color: #28a745;
  color: #28a745;
}

.flag {
  font-size: 1.2em;
}
</style>

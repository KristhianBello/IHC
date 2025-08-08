<template>
  <header class="main-header">
    <div class="header-container">
      <div class="header-left">
        <router-link to="/foro" v-if="showBackToForum">
          <img src="@/assets/logo.png" alt="Logo" class="header-logo" />
        </router-link>
        <img v-else src="@/assets/logo.png" alt="Logo" class="header-logo" />
      </div>

      <div class="header-center">
        <div class="language-selector">
          <button @click="toggleLanguage" class="btn-language btn-with-icon">
            <i class="fas fa-globe"></i>
            {{ currentLanguage === 'es' ? 'ES' : 'EN' }}
          </button>
        </div>
      </div>

      <div class="header-right">
        <router-link
          v-if="showBackToForum"
          to="/foro"
          class="btn btn-outline back-btn"
        >
          <i class="fas fa-arrow-left"></i>
          {{ t('backToForum') }}
        </router-link>

        <div class="user-menu">
          <button @click="toggleUserMenu" class="user-button btn-with-icon">
            <img
              v-if="userProfile?.avatar_url"
              :src="userProfile.avatar_url"
              :alt="userProfile.username"
              class="user-avatar"
            />
            <div v-else class="user-avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
            <span class="user-name">{{ userProfile?.username || 'Usuario' }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>

          <div v-if="showUserMenu" class="user-dropdown">
            <router-link to="/perfil" class="dropdown-item btn-with-icon">
              <i class="fas fa-user-cog"></i>
              {{ t('editProfile') }}
            </router-link>
            <button @click="toggleTheme" class="dropdown-item btn-with-icon">
              <i :class="currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
              {{ currentTheme === 'dark' ? t('lightMode') : t('darkMode') }}
            </button>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item logout btn-with-icon">
              <i class="fas fa-sign-out-alt"></i>
              {{ t('logout') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n.js'
import { useTheme } from '@/composables/useTheme.js'
import { getCurrentUser, getProfile, signOut } from '@/lib/supabaseClient.js'

defineProps({
  showBackToForum: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const { t, toggleLanguage, currentLanguage } = useI18n()
const { currentTheme, toggleTheme } = useTheme()

const showUserMenu = ref(false)
const userProfile = ref(null)
const currentUser = ref(null)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  await signOut()
  router.push('/')
}

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    if (currentUser.value) {
      const { data: profile } = await getProfile()
      userProfile.value = profile
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
})

// Cerrar menú al hacer clic fuera
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.main-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.header-logo:hover {
  transform: scale(1.05);
}

.header-center {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-selector {
  display: flex;
  align-items: center;
}

.btn-language {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-language:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.back-btn {
  margin-right: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
}

.user-menu {
  position: relative;
}

.user-button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.user-button:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--accent-color);
}

.dropdown-item.logout {
  color: #dc3545;
}

.dropdown-item.logout:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

.btn-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 0.5rem;
  }

  .user-name {
    display: none;
  }

  .back-btn span {
    display: none;
  }
}
</style>

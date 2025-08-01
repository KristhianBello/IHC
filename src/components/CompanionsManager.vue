<template>
  <div class="companions-layout">
    <!-- Header principal -->
    <HeaderWithProfile :show-back-to-forum="true" />

    <div class="companions-container">
      <!-- Sección de búsqueda y agregar compañeros -->
      <div class="search-section">
        <div class="search-header">
          <h2>
            <i class="fas fa-user-plus"></i>
            {{ findCompanions }}
          </h2>
        </div>

        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="searchTerm"
            :placeholder="searchByUsername"
            class="search-input"
            @input="debounceSearch"
          />
          <button v-if="searchTerm" @click="clearSearch" class="clear-search-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Resultados de búsqueda -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="user-result-card"
          >
            <div class="user-info">
              <img
                v-if="user.avatar_url"
                :src="user.avatar_url"
                :alt="user.username"
                class="user-avatar"
              />
              <div v-else class="user-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>

              <div class="user-details">
                <h4>{{ user.username }}</h4>
                <p>{{ user.email }}</p>
              </div>
            </div>

            <button
              @click="sendRequest(user.id)"
              :disabled="isRequesting || isAlreadyCompanion(user.id)"
              class="btn btn-primary btn-sm"
            >
              <i class="fas fa-user-plus"></i>
              {{ isAlreadyCompanion(user.id) ? alreadyCompanion : addCompanion }}
            </button>
          </div>
        </div>

        <div v-else-if="searchTerm && !isSearching" class="no-results">
          <i class="fas fa-search"></i>
          <p>{{ noUsersFound }}</p>
        </div>
      </div>

      <!-- Lista de compañeros -->
      <div class="companions-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-users"></i>
            {{ myCompanions }} ({{ companions.length }})
          </h2>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ loadingCompanions }}</p>
        </div>

        <div v-else-if="companions.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-users"></i>
          </div>
          <h3>{{ noCompanions }}</h3>
          <p>{{ noCompanionsMessage }}</p>
        </div>

        <div v-else class="companions-grid">
          <div
            v-for="companion in companions"
            :key="companion.id"
            class="companion-card"
          >
            <div class="companion-info">
              <img
                v-if="companion.companion_profile?.avatar_url"
                :src="companion.companion_profile.avatar_url"
                :alt="companion.companion_profile.username"
                class="companion-avatar"
              />
              <div v-else class="companion-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>

              <div class="companion-details">
                <h4>{{ companion.companion_profile?.username }}</h4>
                <p class="companion-status">
                  <i class="fas fa-circle status-online"></i>
                  {{ active }}
                </p>
              </div>
            </div>

            <div class="companion-actions">
              <button
                @click="viewProfile(companion.companion_id)"
                class="btn btn-outline btn-sm"
                :title="viewProfileTitle"
              >
                <i class="fas fa-eye"></i>
              </button>

              <button
                @click="removeCompanion(companion.id, companion.companion_profile?.username)"
                class="btn btn-danger btn-sm"
                :title="removeCompanionTitle"
              >
                <i class="fas fa-user-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  searchUsers,
  sendCompanionRequest,
  getCompanions,
  removeCompanion as removeCompanionAPI
} from '../lib/supabaseClient.js'
import { useI18n } from '../composables/useI18n.js'
import HeaderWithProfile from '@/components/HeaderWithProfile.vue'

const { t } = useI18n()

const myCompanions = t('myCompanions')
const findCompanions = t('findCompanions')
const searchByUsername = t('searchByUsername')
const alreadyCompanion = t('alreadyCompanion')
const addCompanion = t('addCompanion')
const noUsersFound = t('noUsersFound')
const loadingCompanions = t('loadingCompanions')
const noCompanions = t('noCompanions')
const noCompanionsMessage = t('noCompanionsMessage')
const active = t('active')
const viewProfileTitle = t('viewProfile')
const removeCompanionTitle = t('removeCompanion')

// Estados reactivos
const companions = ref([])
const searchTerm = ref('')
const searchResults = ref([])
const loading = ref(true)
const isSearching = ref(false)
const isRequesting = ref(false)
const searchTimeout = ref(null)

// Computed properties
const isAlreadyCompanion = computed(() => {
  return (userId) => {
    return companions.value.some(c => c.companion_id === userId)
  }
})

// Métodos principales
onMounted(async () => {
  await loadCompanions()
})

async function loadCompanions() {
  loading.value = true
  try {
    const { data, error } = await getCompanions()
    if (error) throw error

    companions.value = data || []
  } catch (error) {
    console.error('Error cargando compañeros:', error)
    showNotification(t('errorLoadingCompanions'), 'error')
  } finally {
    loading.value = false
  }
}

// Búsqueda con debounce
function debounceSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    if (searchTerm.value.length >= 2) {
      await performSearch()
    } else {
      searchResults.value = []
    }
  }, 500)
}

async function performSearch() {
  isSearching.value = true
  try {
    const { data, error } = await searchUsers(searchTerm.value)
    if (error) throw error

    searchResults.value = data || []
  } catch (error) {
    console.error('Error en búsqueda:', error)
    showNotification(t('errorSearching'), 'error')
  } finally {
    isSearching.value = false
  }
}

function clearSearch() {
  searchTerm.value = ''
  searchResults.value = []
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
}

async function sendRequest(userId) {
  isRequesting.value = true
  try {
    const { error } = await sendCompanionRequest(userId)
    if (error) throw error

    showNotification(t('requestSent'), 'success')

    // Limpiar búsqueda
    clearSearch()

  } catch (error) {
    console.error('Error enviando solicitud:', error)
    showNotification(t('errorSendingRequest'), 'error')
  } finally {
    isRequesting.value = false
  }
}

async function removeCompanion(companionId, username) {
  if (!confirm(t('confirmRemoveCompanion').replace('{username}', username))) {
    return
  }

  try {
    const { error } = await removeCompanionAPI(companionId)
    if (error) throw error

    companions.value = companions.value.filter(c => c.id !== companionId)
    showNotification(t('companionRemoved'), 'success')
  } catch (error) {
    console.error('Error eliminando compañero:', error)
    showNotification(t('errorRemovingCompanion'), 'error')
  }
}

function viewProfile(userId) {
  // Implementar vista de perfil
  console.log('Ver perfil de usuario:', userId)
  showNotification(t('profileViewNotImplemented'), 'info')
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
    z-index: 1000;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}
</script>

<style scoped>
/* Variables CSS para temas */
:root {
  --primary-green: #059669;
  --primary-green-hover: #047857;
  --primary-green-light: #d1fae5;
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --bg-primary: var(--white);
  --bg-secondary: var(--gray-50);
  --border-color: var(--gray-200);
  --danger-color: #ef4444;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --white: #1f2937;
  --gray-50: #374151;
  --gray-100: #4b5563;
  --gray-200: #6b7280;
  --gray-300: #9ca3af;
  --gray-400: #d1d5db;
  --gray-500: #e5e7eb;
  --gray-600: #f3f4f6;
  --gray-700: #f9fafb;
  --gray-800: #ffffff;
  --gray-900: #ffffff;
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-400);
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --border-color: #4b5563;
}

.companions-layout {
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* Header */
.main-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-logo {
  height: 40px;
  width: auto;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-green);
  margin: 0;
}

/* Contenedor principal */
.companions-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Sección de búsqueda */
.search-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.search-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 40%;
  font-size: large;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-light);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

/* Resultados de búsqueda */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-result-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.user-result-card:hover {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 1.25rem;
}

.user-details h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.user-details p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-results i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Sección de compañeros */
.companions-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Grid de compañeros */
.companions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.companion-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.companion-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.companion-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.companion-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}

.companion-avatar-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 1.5rem;
}

.companion-details h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.companion-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.status-online {
  color: #22c55e;
  font-size: 0.5rem;
}

.companion-actions {
  display: flex;
  gap: 0.5rem;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.btn-primary {
  background: var(--primary-green);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-green-hover);
}

.btn-primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.btn-danger {
  background: var(--danger-color);
  color: var(--white);
}

.btn-danger:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }

  .companions-container {
    padding: 1rem;
  }

  .search-section,
  .companions-section {
    padding: 1.5rem;
  }

  .companions-grid {
    grid-template-columns: 1fr;
  }

  .companion-card {
    padding: 1rem;
  }

  .user-result-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .companion-actions {
    align-self: flex-end;
  }
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
</style>

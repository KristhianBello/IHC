<template>
  <div class="companions-manager-container">
    <!-- Barra de búsqueda -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchTerm"
          :placeholder="t('searchUsers')"
          class="search-input"
          @input="handleSearch"
        />
        <button
          v-if="searchTerm"
          @click="clearSearch"
          class="clear-search-btn"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Resultados de búsqueda -->
    <div v-if="searchTerm && searchResults.length > 0" class="search-results">
      <h3>{{ t('searchResults') }}</h3>
      <div class="users-grid">
        <div
          v-for="user in searchResults"
          :key="user.id"
          class="user-card"
          @click="viewProfile(user.id)"
        >
          <div class="user-avatar">
            <img
              v-if="user.avatar_url"
              :src="user.avatar_url"
              :alt="user.nombre"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <div class="user-info">
            <h4 class="user-name">
              {{ user.nombre || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario' }}
            </h4>
            <p v-if="user.city" class="user-location">
              <i class="fas fa-map-marker-alt"></i>
              {{ user.city }}
            </p>
            <p v-if="user.bio" class="user-bio">{{ truncateBio(user.bio) }}</p>
          </div>
          <div class="user-actions">
            <button
              @click.stop="sendCompanionRequest(user.id)"
              class="btn btn-sm btn-primary"
              :disabled="pendingRequests.has(user.id)"
            >
              <i class="fas fa-user-plus"></i>
              {{ pendingRequests.has(user.id) ? t('sending') : t('addCompanion') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="searchTerm && !searching && searchResults.length === 0" class="no-results">
      <i class="fas fa-search"></i>
      <p>{{ t('noUsersFound') }}</p>
    </div>

    <!-- Estado de carga -->
    <div v-if="searching" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('searchingUsers') }}</p>
    </div>

    <!-- Solicitudes pendientes -->
    <div v-if="pendingCompanionRequests.length > 0" class="pending-requests-section">
      <h3>{{ t('pendingCompanionRequests') }} ({{ pendingCompanionRequests.length }})</h3>
      <div class="requests-list">
        <div
          v-for="request in pendingCompanionRequests"
          :key="request.id"
          class="request-card"
        >
          <div class="request-user">
            <div class="user-avatar">
              <img
                v-if="request.requester_avatar_url"
                :src="request.requester_avatar_url"
                :alt="request.requester_name"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="user-info">
              <h4 class="user-name">
                {{ request.requester_name || 'Usuario' }}
              </h4>
              <p class="request-date">
                {{ t('requestedOn') }} {{ formatDate(request.created_at) }}
              </p>
            </div>
          </div>
          <div class="request-actions">
            <button
              @click="acceptRequest(request.id)"
              class="btn btn-sm btn-success"
              :disabled="processingRequests.has(request.id)"
            >
              <i class="fas fa-check"></i>
              {{ t('accept') }}
            </button>
            <button
              @click="rejectRequest(request.id)"
              class="btn btn-sm btn-outline"
              :disabled="processingRequests.has(request.id)"
            >
              <i class="fas fa-times"></i>
              {{ t('reject') }}
            </button>
            <button
              @click="blockUser(request.requester_id)"
              class="btn btn-sm btn-danger"
              :disabled="processingRequests.has(request.id)"
            >
              <i class="fas fa-ban"></i>
              {{ t('block') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de compañeros -->
    <div v-if="companions.length > 0" class="companions-section">
      <h3>{{ t('myCompanions') }} ({{ companions.length }})</h3>
      <div class="companions-grid">
        <div
          v-for="companion in companions"
          :key="companion.companion_id"
          class="companion-card"
          @click="viewProfile(companion.companion_id)"
        >
          <div class="user-avatar">
            <img
              v-if="companion.companion_avatar_url"
              :src="companion.companion_avatar_url"
              :alt="companion.companion_name"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ companion.companion_name || 'Usuario' }}</h4>
            <p class="companionship-date">
              {{ t('companionsSince') }} {{ formatDate(companion.companionship_date) }}
            </p>
          </div>
          <div class="companion-actions">
            <button
              @click.stop="removeCompanion(companion.companion_id)"
              class="btn btn-sm btn-outline btn-danger"
              :title="t('removeCompanion')"
            >
              <i class="fas fa-user-minus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="!searchTerm && companions.length === 0 && pendingCompanionRequests.length === 0" class="empty-state">
      <i class="fas fa-users"></i>
      <h3>{{ t('noCompanionsYet') }}</h3>
      <p>{{ t('searchUsersToConnect') }}</p>
    </div>

    <!-- Modal de perfil -->
    <UserProfileModal
      :user-id="selectedUserId || ''"
      :is-visible="showProfileModal"
      @close="closeProfileModal"
      @companionship-updated="refreshData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n.js'
import UserProfileModal from './UserProfileModal.vue'
import {
  searchUsers,
  sendCompanionshipRequest,
  getPendingCompanionshipRequests,
  respondToCompanionshipRequest,
  getCompanions,
  removeFriend as removeFriendAPI,
  blockUser as blockUserAPI
} from '@/lib/supabaseClient.js'

const { t } = useI18n()

// Estado
const searchTerm = ref('')
const searchResults = ref([])
const searching = ref(false)
const pendingRequests = ref(new Set())
const processingRequests = ref(new Set())
const pendingCompanionRequests = ref([])
const companions = ref([])

// Modal de perfil
const showProfileModal = ref(false)
const selectedUserId = ref(null)

// Métodos de búsqueda
const handleSearch = async () => {
  if (!searchTerm.value.trim() || searchTerm.value.length < 2) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    const { data, error } = await searchUsers(searchTerm.value.trim())
    if (error) throw error

    searchResults.value = data || []
  } catch (error) {
    console.error('Error buscando usuarios:', error)
    searchResults.value = []
    showNotification(t('errorSearchingUsers'), 'error')
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchTerm.value = ''
  searchResults.value = []
}

// Métodos de compañerismo
const sendCompanionRequest = async (userId) => {
  if (pendingRequests.value.has(userId)) return

  pendingRequests.value.add(userId)
  try {
    const { error } = await sendCompanionshipRequest(userId)
    if (error) throw error

    showNotification(t('companionRequestSent') || 'Solicitud de compañerismo enviada', 'success')

    // Remover usuario de resultados de búsqueda
    searchResults.value = searchResults.value.filter(user => user.id !== userId)
  } catch (error) {
    console.error('Error enviando solicitud:', error)
    showNotification(t('errorSendingRequest') || 'Error enviando solicitud', 'error')
  } finally {
    pendingRequests.value.delete(userId)
  }
}

const acceptRequest = async (requestId) => {
  if (processingRequests.value.has(requestId)) return

  processingRequests.value.add(requestId)
  try {
    const { error } = await respondToCompanionshipRequest(requestId, 'accepted')
    if (error) throw error

    showNotification(t('companionRequestAccepted') || 'Solicitud de compañerismo aceptada', 'success')
    await refreshData()
  } catch (error) {
    console.error('Error aceptando solicitud:', error)
    showNotification(t('errorAcceptingRequest') || 'Error aceptando solicitud', 'error')
  } finally {
    processingRequests.value.delete(requestId)
  }
}

const rejectRequest = async (requestId) => {
  if (processingRequests.value.has(requestId)) return

  processingRequests.value.add(requestId)
  try {
    const { error } = await respondToCompanionshipRequest(requestId, 'rejected')
    if (error) throw error

    showNotification(t('companionRequestRejected') || 'Solicitud de compañerismo rechazada', 'success')
    await refreshData()
  } catch (error) {
    console.error('Error rechazando solicitud:', error)
    showNotification(t('errorRejectingRequest') || 'Error rechazando solicitud', 'error')
  } finally {
    processingRequests.value.delete(requestId)
  }
}

const blockUser = async (userId) => {
  try {
    const { error } = await blockUserAPI(userId)
    if (error) throw error

    showNotification(t('userBlocked') || 'Usuario bloqueado', 'success')
    await refreshData()
  } catch (error) {
    console.error('Error bloqueando usuario:', error)
    showNotification(t('errorBlockingUser') || 'Error bloqueando usuario', 'error')
  }
}

const removeCompanion = async (companionId) => {
  try {
    const { error } = await removeFriendAPI(companionId)
    if (error) throw error

    showNotification(t('companionRemoved') || 'Compañero removido', 'success')
    await refreshData()
  } catch (error) {
    console.error('Error removiendo compañero:', error)
    showNotification(t('errorRemovingCompanion') || 'Error removiendo compañero', 'error')
  }
}

// Métodos del modal
const viewProfile = (userId) => {
  if (!userId) {
    console.warn('User ID is null or undefined')
    return
  }
  selectedUserId.value = userId
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
  selectedUserId.value = null
}

// Métodos de datos
const loadPendingRequests = async () => {
  try {
    const { data, error } = await getPendingCompanionshipRequests()
    if (error) throw error

    pendingCompanionRequests.value = data || []
  } catch (error) {
    console.error('Error cargando solicitudes pendientes:', error)
  }
}

const loadCompanions = async () => {
  try {
    const { data, error } = await getCompanions()
    if (error) throw error

    companions.value = data || []
  } catch (error) {
    console.error('Error cargando compañeros:', error)
  }
}

const refreshData = async () => {
  await Promise.all([
    loadPendingRequests(),
    loadCompanions()
  ])
}

// Métodos utilitarios
const truncateBio = (bio) => {
  if (!bio) return ''
  return bio.length > 100 ? bio.substring(0, 100) + '...' : bio
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showNotification = (message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`)
  // Aquí podrías integrar un sistema de notificaciones como toast
}

// Inicialización
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.companions-manager-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 30px;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
}

.users-grid, .companions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.user-card, .companion-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-card:hover, .companion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.user-avatar {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 24px;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.user-location, .user-bio {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.user-actions, .companion-actions {
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-outline {
  background: transparent;
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pending-requests-section, .companions-section {
  margin: 40px 0;
}

.pending-requests-section h3, .companions-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 24px;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.request-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.companionship-date, .request-date {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-results i, .empty-state i {
  font-size: 48px;
  margin-bottom: 20px;
  color: #dee2e6;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
  color: #666;
}
</style>

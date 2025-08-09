<template>
  <div class="companions-layout">
    <!-- Header principal -->
    <HeaderWithProfile :show-back-to-forum="true" />

    <div class="companions-container">

      <!-- Sección de solicitudes pendientes -->
      <div v-if="pendingRequests.length > 0" class="pending-requests-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-user-clock"></i>
            {{ t('pendingRequests') || 'Solicitudes Pendientes' }} ({{ pendingRequests.length }})
          </h2>
        </div>

        <div class="requests-list">
          <div
            v-for="request in pendingRequests"
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
                <h4 class="user-name">{{ request.requester_name || 'Usuario' }}</h4>
                <p class="request-date">
                  {{ t('requestedOn') || 'Solicitado el' }} {{ formatDate(request.created_at) }}
                </p>
                <p v-if="request.requester_email" class="user-email">{{ request.requester_email }}</p>
              </div>
            </div>
            <div class="request-actions">
              <button
                @click="acceptRequest(request.id)"
                class="btn btn-success btn-sm"
                :disabled="processingRequests.has(request.id)"
                :title="t('acceptRequest') || 'Aceptar solicitud'"
              >
                <i class="fas fa-check"></i>
                {{ t('accept') || 'Aceptar' }}
              </button>
              <button
                @click="rejectRequest(request.id)"
                class="btn btn-outline btn-sm"
                :disabled="processingRequests.has(request.id)"
                :title="t('rejectRequest') || 'Rechazar solicitud'"
              >
                <i class="fas fa-times"></i>
                {{ t('reject') || 'Rechazar' }}
              </button>
              <button
                @click="viewProfile(request.requester_id)"
                class="btn btn-info btn-sm"
                :title="t('viewProfile') || 'Ver perfil'"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                @click="blockUser(request.requester_id)"
                class="btn btn-danger btn-sm"
                :disabled="processingRequests.has(request.id)"
                :title="t('blockUser') || 'Bloquear usuario'"
              >
                <i class="fas fa-ban"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de búsqueda y agregar compañeros -->
      <div class="search-section">
        <div class="search-header">
          <h2>
            <i class="fas fa-user-plus"></i>
            {{ t('findCompanions') || 'Buscar Compañeros' }}
          </h2>
        </div>

        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="searchTerm"
            :placeholder="t('searchByUsername') || 'Buscar por nombre de usuario...'"
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="searchTerm" @click="clearSearch" class="clear-search-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Estado de carga para búsqueda -->
        <div v-if="searching" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('searchingUsers') || 'Buscando usuarios...' }}</p>
        </div>

        <!-- Resultados de búsqueda -->
        <div v-else-if="searchTerm && searchResults.length > 0" class="search-results">
          <h3>{{ t('searchResults') || 'Resultados de búsqueda' }}</h3>
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
                  class="btn btn-primary btn-sm"
                  :disabled="pendingRequestsToSend.has(user.id) || isAlreadyCompanion(user.id)"
                >
                  <i class="fas fa-user-plus"></i>
                  {{ getButtonText(user.id) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="searchTerm && !searching && searchResults.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <p>{{ t('noUsersFound') || 'No se encontraron usuarios' }}</p>
        </div>
      </div>

      <!-- Lista de compañeros -->
      <div class="companions-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-users"></i>
            {{ t('myCompanions') || 'Mis Compañeros' }} ({{ companions.length }})
          </h2>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('loadingCompanions') || 'Cargando compañeros...' }}</p>
        </div>

        <div v-else-if="companions.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-users"></i>
          </div>
          <h3>{{ t('noCompanions') || 'Aún no tienes compañeros' }}</h3>
          <p>{{ t('noCompanionsMessage') || 'Busca usuarios arriba para conectarte con otros compañeros' }}</p>
        </div>

        <div v-else class="companions-grid">
          <div
            v-for="companion in companions"
            :key="companion.companion_id"
            class="companion-card"
            @click="viewProfile(companion.companion_id)"
          >
            <div class="companion-info">
              <img
                v-if="companion.companion_avatar_url"
                :src="companion.companion_avatar_url"
                :alt="companion.companion_name"
                class="companion-avatar"
              />
              <div v-else class="companion-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>

              <div class="companion-details">
                <h4>{{ companion.companion_name || 'Usuario' }}</h4>
                <p class="companionship-date">
                  <i class="fas fa-calendar"></i>
                  {{ t('companionsSince') || 'Compañeros desde' }} {{ formatDate(companion.companionship_date) }}
                </p>
                <p v-if="companion.companion_email" class="companion-email">{{ companion.companion_email }}</p>
              </div>
            </div>

            <div class="companion-actions">
              <button
                @click.stop="viewProfile(companion.companion_id)"
                class="btn btn-outline btn-sm"
                :title="t('viewProfile') || 'Ver perfil'"
              >
                <i class="fas fa-eye"></i>
              </button>

              <button
                @click.stop="removeCompanion(companion.companion_id)"
                class="btn btn-danger btn-sm"
                :title="t('removeCompanion') || 'Remover compañero'"
              >
                <i class="fas fa-user-minus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío general -->
      <div v-if="!searchTerm && companions.length === 0 && pendingRequests.length === 0 && !loading" class="general-empty-state">
        <i class="fas fa-users"></i>
        <h3>{{ t('noCompanionsYet') || '¡Comienza a conectarte!' }}</h3>
        <p>{{ t('searchUsersToConnect') || 'Busca usuarios para enviar solicitudes de compañerismo y construye tu red de colaboradores.' }}</p>
      </div>
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
import { useI18n } from '../composables/useI18n.js'
import HeaderWithProfile from '@/components/HeaderWithProfile.vue'
import UserProfileModal from '@/components/UserProfileModal.vue'
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

// Estados reactivos
const searchTerm = ref('')
const searchResults = ref([])
const searching = ref(false)
const pendingRequestsToSend = ref(new Set())
const processingRequests = ref(new Set())
const pendingRequests = ref([])
const companions = ref([])
const loading = ref(true)

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
    showNotification(t('errorSearchingUsers') || 'Error buscando usuarios', 'error')
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
  if (pendingRequestsToSend.value.has(userId)) return

  pendingRequestsToSend.value.add(userId)
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
    pendingRequestsToSend.value.delete(userId)
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

    pendingRequests.value = data || []
  } catch (error) {
    console.error('Error cargando solicitudes pendientes:', error)
    pendingRequests.value = []
  }
}

const loadCompanions = async () => {
  try {
    const { data, error } = await getCompanions()
    if (error) throw error

    companions.value = data || []
  } catch (error) {
    console.error('Error cargando compañeros:', error)
    companions.value = []
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await Promise.all([
    loadPendingRequests(),
    loadCompanions()
  ])
}

// Métodos utilitarios
const isAlreadyCompanion = (userId) => {
  return companions.value.some(c => c.companion_id === userId)
}

const getButtonText = (userId) => {
  if (pendingRequestsToSend.value.has(userId)) {
    return t('sending') || 'Enviando...'
  }
  if (isAlreadyCompanion(userId)) {
    return t('alreadyCompanion') || 'Ya es compañero'
  }
  return t('addCompanion') || 'Agregar compañero'
}

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
.companions-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.companions-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Sección de solicitudes pendientes */
.pending-requests-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.section-header i {
  color: #667eea;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.request-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.request-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.request-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar, .avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-size: 20px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.request-date, .user-email {
  margin: 2px 0;
  font-size: 14px;
  color: #718096;
}

.request-actions {
  display: flex;
  gap: 8px;
}

/* Sección de búsqueda */
.search-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-header h2 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 50px 14px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* Resultados de búsqueda */
.search-results h3 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.user-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.user-location, .user-bio {
  margin: 5px 0;
  color: #718096;
  font-size: 14px;
}

.user-actions {
  margin-top: 15px;
}

/* Sección de compañeros */
.companions-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.companions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.companion-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.companion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.companion-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.companion-avatar, .companion-avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.companion-avatar-placeholder {
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-size: 24px;
}

.companion-details h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.companionship-date, .companion-email {
  margin: 2px 0;
  font-size: 14px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 5px;
}

.companion-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
}

.btn-info {
  background: #4299e1;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #718096;
}

.btn-outline:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
  color: #4a5568;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state, .no-results, .general-empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-icon, .no-results i, .general-empty-state i {
  font-size: 48px;
  margin-bottom: 20px;
  color: #cbd5e0;
}

.empty-state h3, .general-empty-state h3 {
  margin: 0 0 10px 0;
  color: #4a5568;
  font-size: 22px;
}

.empty-state p, .general-empty-state p {
  margin: 0;
  color: #718096;
  font-size: 16px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .companions-container {
    padding: 15px;
  }

  .users-grid, .companions-grid {
    grid-template-columns: 1fr;
  }

  .request-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .request-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .companion-card {
    text-align: center;
  }

  .companion-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>

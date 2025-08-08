<template>
  <div class="user-search-container">
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
              @click.stop="sendFriendRequest(user.id)"
              class="btn btn-sm btn-primary"
              :disabled="pendingRequests.has(user.id)"
            >
              <i class="fas fa-user-plus"></i>
              {{ pendingRequests.has(user.id) ? t('sending') : t('addFriend') }}
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
    <div v-if="pendingFriendRequests.length > 0" class="pending-requests-section">
      <h3>{{ t('pendingRequests') }} ({{ pendingFriendRequests.length }})</h3>
      <div class="requests-list">
        <div
          v-for="request in pendingFriendRequests"
          :key="request.id"
          class="request-card"
        >
          <div class="request-user">
            <div class="user-avatar">
              <img
                v-if="request.requester?.avatar_url"
                :src="request.requester.avatar_url"
                :alt="request.requester.nombre"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="user-info">
              <h4 class="user-name">
                {{ request.requester?.nombre || `${request.requester?.first_name || ''} ${request.requester?.last_name || ''}`.trim() || 'Usuario' }}
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

    <!-- Lista de amigos -->
    <div v-if="friends.length > 0" class="friends-section">
      <h3>{{ t('myFriends') }} ({{ friends.length }})</h3>
      <div class="friends-grid">
        <div
          v-for="friend in friends"
          :key="friend.friend_id"
          class="friend-card"
          @click="viewProfile(friend.friend_id)"
        >
          <div class="user-avatar">
            <img
              v-if="friend.friend_avatar"
              :src="friend.friend_avatar"
              :alt="friend.friend_name"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ friend.friend_name || 'Usuario' }}</h4>
            <p class="friendship-date">
              {{ t('friendsSince') }} {{ formatDate(friend.friendship_date) }}
            </p>
          </div>
          <div class="friend-actions">
            <button
              @click.stop="removeFriend(friend.friend_id)"
              class="btn btn-sm btn-outline btn-danger"
              :title="t('removeFriend')"
            >
              <i class="fas fa-user-minus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="!searchTerm && friends.length === 0 && pendingFriendRequests.length === 0" class="empty-state">
      <i class="fas fa-users"></i>
      <h3>{{ t('noFriendsYet') }}</h3>
      <p>{{ t('searchUsersToConnect') }}</p>
    </div>

    <!-- Modal de perfil -->
    <UserProfileModal
      :user-id="selectedUserId"
      :is-visible="showProfileModal"
      @close="closeProfileModal"
      @friendship-updated="refreshData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n.js'
import UserProfileModal from './UserProfileModal.vue'
import {
  searchUsers,
  sendFriendRequest as sendFriendRequestAPI,
  getPendingFriendRequests,
  respondToFriendRequest,
  getFriends,
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
const pendingFriendRequests = ref([])
const friends = ref([])

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

// Métodos de amistad
const sendFriendRequest = async (userId) => {
  if (pendingRequests.value.has(userId)) return

  pendingRequests.value.add(userId)
  try {
    const { error } = await sendFriendRequestAPI(userId)
    if (error) throw error

    showNotification(t('friendRequestSent'), 'success')

    // Remover usuario de resultados de búsqueda
    searchResults.value = searchResults.value.filter(user => user.id !== userId)
  } catch (error) {
    console.error('Error enviando solicitud:', error)
    showNotification(t('errorSendingRequest'), 'error')
  } finally {
    pendingRequests.value.delete(userId)
  }
}

const acceptRequest = async (requestId) => {
  if (processingRequests.value.has(requestId)) return

  processingRequests.value.add(requestId)
  try {
    const { error } = await respondToFriendRequest(requestId, 'accepted')
    if (error) throw error

    showNotification(t('friendRequestAccepted'), 'success')
    await refreshData()
  } catch (error) {
    console.error('Error aceptando solicitud:', error)
    showNotification(t('errorAcceptingRequest'), 'error')
  } finally {
    processingRequests.value.delete(requestId)
  }
}

const rejectRequest = async (requestId) => {
  if (processingRequests.value.has(requestId)) return

  processingRequests.value.add(requestId)
  try {
    const { error } = await respondToFriendRequest(requestId, 'rejected')
    if (error) throw error

    showNotification(t('friendRequestRejected'), 'success')
    await refreshData()
  } catch (error) {
    console.error('Error rechazando solicitud:', error)
    showNotification(t('errorRejectingRequest'), 'error')
  } finally {
    processingRequests.value.delete(requestId)
  }
}

const removeFriend = async (friendId) => {
  if (!confirm(t('confirmRemoveFriend'))) return

  try {
    const { error } = await removeFriendAPI(friendId)
    if (error) throw error

    showNotification(t('friendRemoved'), 'success')
    await refreshData()
  } catch (error) {
    console.error('Error eliminando amigo:', error)
    showNotification(t('errorRemovingFriend'), 'error')
  }
}

const blockUser = async (userId) => {
  if (!confirm(t('confirmBlockUser'))) return

  try {
    const { error } = await blockUserAPI(userId)
    if (error) throw error

    showNotification(t('userBlockedSuccess'), 'success')
    await refreshData()
  } catch (error) {
    console.error('Error bloqueando usuario:', error)
    showNotification(t('errorBlockingUser'), 'error')
  }
}

// Métodos del modal
const viewProfile = (userId) => {
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
    const { data, error } = await getPendingFriendRequests()
    if (error) throw error

    pendingFriendRequests.value = data || []
  } catch (error) {
    console.error('Error cargando solicitudes pendientes:', error)
  }
}

const loadFriends = async () => {
  try {
    const { data, error } = await getFriends()
    if (error) throw error

    friends.value = data || []
  } catch (error) {
    console.error('Error cargando amigos:', error)
  }
}

const refreshData = async () => {
  await Promise.all([
    loadPendingRequests(),
    loadFriends()
  ])
}

// Métodos de utilidad
const truncateBio = (bio) => {
  if (!bio) return ''
  return bio.length > 100 ? bio.substring(0, 100) + '...' : bio
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message

  let backgroundColor = '#3b82f6'
  if (type === 'error') backgroundColor = '#ef4444'
  if (type === 'success') backgroundColor = '#22c55e'

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    background: ${backgroundColor};
    z-index: 1001;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.user-search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-light);
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1rem;
}

.clear-search-btn {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.search-results,
.pending-requests-section,
.friends-section {
  margin-bottom: 2rem;
}

.search-results h3,
.pending-requests-section h3,
.friends-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.users-grid,
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.user-card,
.friend-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card:hover,
.friend-card:hover {
  border-color: var(--primary-green);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.request-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
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

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-location,
.user-bio,
.request-date,
.friendship-date {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.user-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.user-bio {
  margin-top: 0.25rem;
}

.user-actions,
.friend-actions {
  display: flex;
  gap: 0.5rem;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
}

.btn-primary {
  background: var(--primary-green);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-green-hover);
}

.btn-primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #16a34a;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover:not(:disabled) {
  background: var(--bg-secondary);
}

.btn-danger {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
}

.loading-state,
.no-results,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
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

.empty-state i,
.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

/* Variables CSS */
:root {
  --primary-green: #059669;
  --primary-green-hover: #047857;
  --primary-green-light: #d1fae5;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --gray-300: #d1d5db;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --border-color: #4b5563;
  --gray-300: #6b7280;
}

@media (max-width: 768px) {
  .users-grid,
  .friends-grid {
    grid-template-columns: 1fr;
  }

  .request-card {
    flex-direction: column;
    align-items: stretch;
  }

  .request-actions {
    justify-content: stretch;
  }

  .request-actions .btn {
    flex: 1;
  }
}
</style>

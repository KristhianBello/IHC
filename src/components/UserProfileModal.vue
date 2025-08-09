<template>
  <div class="user-profile-modal" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ t('userProfile') }}</h2>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('loadingProfile') }}</p>
        </div>

        <div v-else-if="profile" class="profile-content">
          <!-- Avatar y nombre -->
          <div class="profile-header">
            <div class="profile-avatar">
              <img
                v-if="profile.avatar_url"
                :src="profile.avatar_url"
                :alt="profile.nombre || profile.first_name"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="profile-info">
              <h3 class="profile-name">
                {{ profile.nombre || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario' }}
              </h3>
              <p v-if="profile.city" class="profile-location">
                <i class="fas fa-map-marker-alt"></i>
                {{ profile.city }}
              </p>
            </div>
          </div>

          <!-- Biografía -->
          <div v-if="profile.bio" class="profile-section">
            <h4>{{ t('about') }}</h4>
            <p class="profile-bio">{{ profile.bio }}</p>
          </div>

          <!-- Intereses -->
          <div v-if="profile.interests && profile.interests.length > 0" class="profile-section">
            <h4>{{ t('interests') }}</h4>
            <div class="tags-container">
              <span
                v-for="interest in profile.interests"
                :key="interest"
                class="tag tag-interest"
              >
                {{ interest }}
              </span>
            </div>
          </div>

          <!-- Habilidades -->
          <div v-if="profile.skills && profile.skills.length > 0" class="profile-section">
            <h4>{{ t('skills') }}</h4>
            <div class="tags-container">
              <span
                v-for="skill in profile.skills"
                :key="skill"
                class="tag tag-skill"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Organización -->
          <div v-if="profile.organization" class="profile-section">
            <h4>{{ t('organization') }}</h4>
            <p>{{ profile.organization }}</p>
          </div>

          <!-- Acciones de amistad -->
          <div class="friendship-actions">
            <div v-if="friendshipStatus === 'none'" class="action-buttons">
              <button
                @click="sendFriendRequest"
                class="btn btn-primary"
                :disabled="sendingRequest"
              >
                <i class="fas fa-user-plus"></i>
                {{ sendingRequest ? t('sending') : t('sendFriendRequest') }}
              </button>
              <button @click="blockUser" class="btn btn-outline btn-danger">
                <i class="fas fa-ban"></i>
                {{ t('blockUser') }}
              </button>
            </div>

            <div v-else-if="friendshipStatus === 'pending'" class="status-badge pending">
              <i class="fas fa-clock"></i>
              {{ t('requestPending') }}
            </div>

            <div v-else-if="friendshipStatus === 'accepted'" class="action-buttons">
              <button class="btn btn-success disabled">
                <i class="fas fa-check"></i>
                {{ t('friends') }}
              </button>
              <button @click="removeFriend" class="btn btn-outline btn-danger">
                <i class="fas fa-user-minus"></i>
                {{ t('removeFriend') }}
              </button>
            </div>

            <div v-else-if="friendshipStatus === 'blocked'" class="status-badge blocked">
              <i class="fas fa-ban"></i>
              {{ t('userBlocked') }}
            </div>
          </div>
        </div>

        <div v-else class="error-state">
          <p>{{ t('errorLoadingProfile') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n.js'
import {
  getPublicProfile,
  getFriendshipStatus,
  sendFriendRequest as sendFriendRequestAPI,
  removeFriend as removeFriendAPI,
  blockUser as blockUserAPI
} from '@/lib/supabaseClient.js'

const { t } = useI18n()

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'friendship-updated', 'companionship-updated'])

// Estado
const loading = ref(false)
const profile = ref(null)
const friendshipStatus = ref('none')
const sendingRequest = ref(false)

// Métodos
const loadProfile = async () => {
  if (!props.userId) return

  loading.value = true
  try {
    const { data: profileData, error: profileError } = await getPublicProfile(props.userId)
    if (profileError) throw profileError

    const { data: statusData } = await getFriendshipStatus(props.userId)

    profile.value = profileData
    friendshipStatus.value = statusData || 'none'
  } catch (error) {
    console.error('Error cargando perfil:', error)
    profile.value = null
  } finally {
    loading.value = false
  }
}

const sendFriendRequest = async () => {
  sendingRequest.value = true
  try {
    const { error } = await sendFriendRequestAPI(props.userId)
    if (error) throw error

    friendshipStatus.value = 'pending'
    emit('friendship-updated')
    emit('companionship-updated')
    showNotification(t('friendRequestSent'), 'success')
  } catch (error) {
    console.error('Error enviando solicitud:', error)
    showNotification(t('errorSendingRequest'), 'error')
  } finally {
    sendingRequest.value = false
  }
}

const removeFriend = async () => {
  if (!confirm(t('confirmRemoveFriend'))) return

  try {
    const { error } = await removeFriendAPI(props.userId)
    if (error) throw error

    friendshipStatus.value = 'none'
    emit('friendship-updated')
    emit('companionship-updated')
    showNotification(t('friendRemoved'), 'success')
  } catch (error) {
    console.error('Error eliminando amigo:', error)
    showNotification(t('errorRemovingFriend'), 'error')
  }
}

const blockUser = async () => {
  if (!confirm(t('confirmBlockUser'))) return

  try {
    const { error } = await blockUserAPI(props.userId)
    if (error) throw error

    friendshipStatus.value = 'blocked'
    emit('friendship-updated')
    emit('companionship-updated')
    showNotification(t('userBlockedSuccess'), 'success')
  } catch (error) {
    console.error('Error bloqueando usuario:', error)
    showNotification(t('errorBlockingUser'), 'error')
  }
}

const closeModal = () => {
  emit('close')
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

// Watchers
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.userId) {
    loadProfile()
  }
})

watch(() => props.userId, (newValue) => {
  if (newValue && props.isVisible) {
    loadProfile()
  }
})
</script>

<style scoped>
.user-profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 2rem;
}

.profile-info {
  flex: 1;
}

.profile-name {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.375rem;
  font-weight: 600;
}

.profile-location {
  margin: 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.profile-section {
  padding: 0.5rem 0;
}

.profile-section h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.profile-bio {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-interest {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tag-skill {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.friendship-actions {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  flex: 1;
  justify-content: center;
  min-width: 120px;
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

.btn-success.disabled {
  opacity: 0.7;
  cursor: default;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: var(--bg-secondary);
}

.btn-danger {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  justify-content: center;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.blocked {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

/* Variables CSS para compatibilidad */
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

@media (max-width: 640px) {
  .modal-content {
    margin: 0.5rem;
    max-width: none;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    min-width: auto;
  }
}
</style>

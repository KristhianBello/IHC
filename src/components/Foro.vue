<template>
  <div class="forum-layout">
    <!-- Header principal -->
    <header class="main-header">
      <div class="header-container">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="header-logo" />
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
              <span class="user-name">
                {{ userProfile?.nombre || (userProfile?.first_name && userProfile?.last_name) ? `${userProfile.first_name} ${userProfile.last_name}` : (userProfile?.first_name || userProfile?.username || 'Usuario') }}
              </span>
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

    <!-- Sidebar moderna -->
    <aside class="modern-sidebar">
      <nav class="sidebar-nav">
        <ul class="nav-menu">
          <li>
            <router-link to="/foro" class="nav-link active btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-home"></i>
              </div>
              <span>{{ t('home') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/mapa" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-map-marked-alt"></i>
              </div>
              <span>{{ t('spaceMap') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/galeria" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-images"></i>
              </div>
              <span>{{ t('gallery') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/adopciones" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-seedling"></i>
              </div>
              <span>{{ t('myAdoptions') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/solicitud" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-hand-holding-heart"></i>
              </div>
              <span>{{ t('requestAdoption') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/reportar" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <span>{{ t('reportProblem') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/sugerencias" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-lightbulb"></i>
              </div>
              <span>{{ t('suggestions') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/programar-tareas" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-calendar-plus"></i>
              </div>
              <span>{{ t('scheduleTasks') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/compañeros" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-users"></i>
              </div>
              <span>{{ t('myCompanions') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/amigos" class="nav-link btn-with-icon">
              <div class="nav-icon icon-hover-animate">
                <i class="fas fa-user-friends"></i>
              </div>
              <span>{{ t('friendsAndConnections') }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <main class="forum-main">
      <!-- Sección de búsqueda -->
      <div class="search-section">
  <div class="search-container">
    <div class="search-input-wrapper relative">
      <i class="fas fa-search search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      <input
        type="text"
        v-model="searchTerm"
        :placeholder="t('searchPlaceholder')"
        class="search-input pl-10"
      />
      <button
        v-if="searchTerm"
        @click="clearSearch"
        class="clear-search-btn absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</div>


      <!-- Formulario de nueva publicación -->
      <div class="new-post-section">
        <button
          @click="togglePostForm"
          class="btn-new-post btn-with-icon"
          :class="{ active: showPostForm }"
        >
          <i :class="showPostForm ? 'fas fa-times' : 'fas fa-plus'"></i>
          {{ showPostForm ? t('cancel') : t('newPost') }}
        </button>

        <div v-if="showPostForm" class="new-post-form slide-in">
          <form @submit.prevent="submitPost" class="post-form">
            <div class="form-header">
              <div class="user-info">
                <img
                  v-if="userProfile?.avatar_url"
                  :src="userProfile.avatar_url"
                  :alt="userProfile.username"
                  class="form-user-avatar"
                />
                <div v-else class="form-user-avatar-placeholder">
                  <i class="fas fa-user"></i>
                </div>
                <span class="form-username">{{ userProfile?.nombre || (userProfile?.first_name && userProfile?.last_name) ? `${userProfile.first_name} ${userProfile.last_name}` : (userProfile?.username || 'Usuario') }}</span>
              </div>
            </div>

            <div class="form-body">
              <input
                type="text"
                v-model="newPost.title"
                :placeholder="t('postTitlePlaceholder')"
                class="title-input"
                required
              />

              <textarea
                v-model="newPost.content"
                :placeholder="t('postContentPlaceholder')"
                rows="4"
                class="content-textarea"
                required
              ></textarea>

              <div class="location-section">
                <button
                  type="button"
                  @click="showMapSelector = !showMapSelector"
                  class="btn-map-toggle btn-with-icon"
                >
                  <i class="fas fa-map-marked-alt"></i>
                  {{ showMapSelector ? t('hideMap') : t('selectLocation') }}
                </button>

                <div v-if="showMapSelector" class="map-selector-container">
                  <MapSelector
                    v-model="selectedMapLocation"
                    @locationSelected="onLocationSelected"
                  />
                </div>

                <div class="location-input-wrapper">
                  <i class="fas fa-map-marker-alt location-icon"></i>
                  <input
                    type="text"
                    v-model="newPost.location"
                    :placeholder="t('addLocation')"
                    class="location-input"
                  />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-with-icon" :disabled="isSubmitting">
                  <i class="fas fa-paper-plane"></i>
                  {{ isSubmitting ? t('publishing') : t('publish') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de publicaciones -->
      <div class="posts-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('loadingPosts') }}</p>
        </div>

        <div v-else-if="filteredPosts.length === 0" class="no-posts">
          <div class="no-posts-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h3>{{ t('noPosts') }}</h3>
          <p>{{ t('noPostsMessage') }}</p>
        </div>

        <article
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-card fade-in"
        >
          <div class="post-header">
            <div class="post-author">
              <img
                v-if="post.profiles?.avatar_url"
                :src="post.profiles.avatar_url"
                :alt="post.profiles.username"
                class="author-avatar"
              />
              <div v-else class="author-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
              <div class="author-info">
                <h4>{{
                  post.profiles?.first_name && post.profiles?.last_name
                    ? `${post.profiles.first_name} ${post.profiles.last_name}`
                    : post.profiles?.username || 'Usuario desconocido'
                }}</h4>
                <div class="post-meta">
                  <span class="post-date">
                    <i class="fas fa-clock"></i>
                    {{ formatDate(post.created_at) }}
                  </span>
                  <span v-if="post.location" class="post-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ post.location }}
                  </span>
                </div>
              </div>
            </div>

            <div class="post-menu">
              <button
                v-if="canEditPost(post)"
                @click="editPost(post)"
                class="post-action-btn edit-btn"
                :title="t('editPost')"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                v-if="canDeletePost(post)"
                @click="deletePost(post.id)"
                class="post-action-btn delete-btn"
                :title="t('deletePost')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-text">{{ post.content }}</p>
          </div>

          <div class="post-actions">
            <button
              @click="handleLike(post.id)"
              class="action-btn like-btn btn-with-icon"
              :class="{ liked: post.user_liked }"
              :disabled="likingPosts.has(post.id)"
            >
              <i class="fas fa-heart"></i>
              <span>{{ post.likes_count || 0 }}</span>
            </button>

            <button
              @click="toggleComments(post.id)"
              class="action-btn comment-btn btn-with-icon"
            >
              <i class="fas fa-comment"></i>
              <span>{{ post.comments_count || 0 }}</span>
            </button>

            <!-- Botón de solicitud de amistad -->
            <button
              v-if="canSendFriendRequestToAuthor(post)"
              @click="sendFriendRequestToAuthor(post)"
              class="action-btn friend-request-btn btn-with-icon"
              :disabled="sendingFriendRequest.has(post.author_id)"
              :title="t('sendFriendRequest')"
            >
              <i class="fas fa-user-plus"></i>
              <span>{{ t('addFriend') }}</span>
            </button>

            <!-- Indicador de amistad existente -->
            <div
              v-else-if="post.friendship_status === 'accepted'"
              class="friendship-indicator friend"
              :title="t('alreadyFriends')"
            >
              <i class="fas fa-user-friends"></i>
              <span>{{ t('friends') }}</span>
            </div>

            <!-- Indicador de solicitud pendiente -->
            <div
              v-else-if="post.friendship_status === 'pending'"
              class="friendship-indicator pending"
              :title="t('friendRequestPending')"
            >
              <i class="fas fa-clock"></i>
              <span>{{ t('pending') }}</span>
            </div>
          </div>

          <!-- Sección de comentarios -->
          <div v-if="visibleComments.has(post.id)" class="comments-section slide-in">
            <div class="comments-header">
              <h4>{{ t('comments') }}</h4>
              <button @click="toggleComments(post.id)" class="close-comments-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="comments-list">
              <div
                v-for="comment in postComments[post.id] || []"
                :key="comment.id"
                class="comment-item"
                :class="{ 'is-reply': comment.parent_id }"
              >
                <img
                  v-if="comment.profiles?.avatar_url"
                  :src="comment.profiles.avatar_url"
                  :alt="comment.profiles.username"
                  class="comment-avatar"
                />
                <div v-else class="comment-avatar-placeholder">
                  <i class="fas fa-user"></i>
                </div>

                <div class="comment-content">
                  <div class="comment-header">
                    <h5>{{
                      comment.profiles?.first_name && comment.profiles?.last_name
                        ? `${comment.profiles.first_name} ${comment.profiles.last_name}`
                        : comment.profiles?.username || 'Usuario'
                    }}</h5>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>

                  <div v-if="comment.parent_comment" class="comment-reply-to">
                    {{ t('replyingTo') }} @{{
                      comment.parent_comment.profiles?.first_name && comment.parent_comment.profiles?.last_name
                        ? `${comment.parent_comment.profiles.first_name} ${comment.parent_comment.profiles.last_name}`
                        : comment.parent_comment.profiles?.username
                    }}
                  </div>

                  <p class="comment-text">{{ comment.content }}</p>

                  <div class="comment-actions">
                    <button
                      @click="startReply(post.id, comment)"
                      class="comment-action-btn btn-with-icon"
                    >
                      <i class="fas fa-reply"></i>
                      {{ t('reply') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario de comentario -->
            <form @submit.prevent="submitComment(post.id)" class="comment-form">
              <div class="comment-input-wrapper">
                <img
                  v-if="userProfile?.avatar_url"
                  :src="userProfile.avatar_url"
                  :alt="userProfile.username"
                  class="comment-user-avatar"
                />
                <div v-else class="comment-user-avatar-placeholder">
                  <i class="fas fa-user"></i>
                </div>

                <div class="comment-input-container">
                  <div v-if="replyingTo[post.id]" class="reply-indicator">
                    <span>{{ t('replyingTo') }} @{{
                      replyingTo[post.id].profiles?.first_name && replyingTo[post.id].profiles?.last_name
                        ? `${replyingTo[post.id].profiles.first_name} ${replyingTo[post.id].profiles.last_name}`
                        : replyingTo[post.id].profiles?.username
                    }}</span>
                    <button
                      type="button"
                      @click="cancelReply(post.id)"
                      class="cancel-reply-btn"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <input
                    type="text"
                    v-model="newComments[post.id]"
                    :placeholder="replyingTo[post.id] ? t('writeReply') : t('writeComment')"
                    class="comment-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="comment-submit-btn"
                  :disabled="!newComments[post.id]?.trim()"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </main>
  </div>

  <!-- Modal de edición -->
  <div v-if="editingPost" class="modal-overlay" @click="cancelEdit">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ t('editPost') }}</h3>
        <button @click="cancelEdit" class="close-modal-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="updatePost" class="edit-form">
        <input
          type="text"
          v-model="editForm.title"
          :placeholder="t('postTitlePlaceholder')"
          class="edit-title-input"
          required
        />

        <textarea
          v-model="editForm.content"
          :placeholder="t('postContentPlaceholder')"
          rows="4"
          class="edit-content-textarea"
          required
        ></textarea>

        <input
          type="text"
          v-model="editForm.location"
          :placeholder="t('addLocation')"
          class="edit-location-input"
        />

        <div class="modal-actions">
          <button type="button" @click="cancelEdit" class="btn btn-outline btn-with-icon">
            {{ t('cancel') }}
          </button>
          <button type="submit" class="btn btn-primary btn-with-icon" :disabled="isUpdating">
            <i class="fas fa-save"></i>
            {{ isUpdating ? t('updating') : t('update') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MapSelector from './MapSelector.vue'

import {
  createPost,
  getPosts,
  // getPrioritizedPosts, // Temporalmente comentado
  toggleLike,
  checkUserLike,
  updatePost as updatePostAPI,
  deletePost as deletePostAPI,
  createComment,
  getPostComments,
  subscribeToPostUpdates,
  getCurrentUser,
  getProfile,
  signOut,
  sendFriendRequest,
  canSendFriendRequest,
  getFriendshipStatus
} from '../lib/supabaseClient.js'
import { useI18n } from '../composables/useI18n.js'
import { useTheme } from '../composables/useTheme.js'
const { currentTheme, toggleTheme, setTheme } = useTheme()
const router = useRouter()
const { t, currentLanguage, toggleLanguage } = useI18n()


// Inicializar tema desde localStorage si existe
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && savedTheme !== currentTheme.value) {
    setTheme(savedTheme)
  }
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})

// Actualizar el DOM y localStorage al cambiar el tema
watch(currentTheme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
})

// Estado principal
const posts = ref([])
const loading = ref(true)
const currentUser = ref(null)
const userProfile = ref(null)
const showUserMenu = ref(false)
const showPostForm = ref(false)
const searchTerm = ref('')
const isSubmitting = ref(false)
const isUpdating = ref(false)
const likingPosts = ref(new Set())
const sendingFriendRequest = ref(new Set())
const subscription = ref(null)

// Estados para comentarios
const visibleComments = ref(new Set())
const postComments = ref({})
const newComments = ref({})
const replyingTo = ref({})

// Estados para edición
const editingPost = ref(null)
const editForm = ref({
  title: '',
  content: '',
  location: ''
})

// Formulario de nueva publicación
const newPost = ref({
  title: '',
  content: '',
  location: ''
})

// Variables para el selector de mapas
const showMapSelector = ref(false)
const selectedMapLocation = ref(null)

// Función para manejar la selección de ubicación en el mapa
const onLocationSelected = (location) => {
  selectedMapLocation.value = location
  if (location && location.address) {
    newPost.value.location = location.address
  }
}

// Computed properties
const filteredPosts = computed(() => {
  if (!searchTerm.value) return posts.value

  const term = searchTerm.value.toLowerCase()
  return posts.value.filter(post =>
    post.title?.toLowerCase().includes(term) ||
    post.content?.toLowerCase().includes(term) ||
    post.location?.toLowerCase().includes(term) ||
    post.profiles?.username?.toLowerCase().includes(term)
  )
})

// Métodos principales
const initializeUser = async () => {
  try {
    currentUser.value = await getCurrentUser()
    if (currentUser.value) {
      const { data: profile, error } = await getProfile()
      if (profile) {
        userProfile.value = profile
        console.log('Perfil de usuario cargado:', profile) // Para debug
      } else {
        console.error('Error cargando perfil:', error)
        // Usar información básica del usuario si no hay perfil
        userProfile.value = {
          username: currentUser.value.email.split('@')[0],
          first_name: currentUser.value.email.split('@')[0],
          last_name: '',
          email: currentUser.value.email,
          avatar_url: null
        }
      }
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Error inicializando usuario:', error)
    router.push('/')
  }
}

const loadPosts = async () => {
  loading.value = true
  try {
    console.log('=== Cargando posts ===')
    // Temporalmente usar siempre getPosts() hasta verificar las funciones RPC
    const { data, error } = await getPosts()

    console.log('Respuesta de getPosts:', { data: data?.length, error })

    if (error) throw error

    posts.value = data || []
    console.log('Posts cargados en el componente:', posts.value.length)

    // Verificar likes del usuario para cada post
    for (const post of posts.value) {
      const { data: likeData } = await checkUserLike(post.id)
      post.user_liked = likeData?.liked || false

      // Si el post viene de la función priorizadas, ya tiene toda la info
      if (!post.author_info && post.author_id) {
        // Para posts que no tienen info de autor, cargarla
        try {
          const { data: authorData } = await getProfile(post.author_id)
          if (authorData) {
            post.author_info = {
              id: authorData.id,
              nombre: authorData.nombre,
              first_name: authorData.first_name,
              last_name: authorData.last_name,
              username: authorData.nombre || `${authorData.first_name || ''} ${authorData.last_name || ''}`.trim() || authorData.email,
              avatar_url: authorData.avatar_url,
              city: authorData.city
            }
          }
        } catch (err) {
          console.error('Error cargando autor del post:', err)
        }
      }
    }
  } catch (error) {
    console.error('Error cargando publicaciones:', error)
    showNotification(t('errorLoadingPosts'), 'error')
  } finally {
    loading.value = false
  }
}

const setupWebSocket = () => {
  subscription.value = subscribeToPostUpdates((payload) => {
    if (payload.table === 'posts') {
      if (payload.eventType === 'INSERT') {
        loadPosts() // Recargar para obtener datos completos
      } else if (payload.eventType === 'DELETE') {
        posts.value = posts.value.filter(p => p.id !== payload.old.id)
      } else if (payload.eventType === 'UPDATE') {
        const index = posts.value.findIndex(p => p.id === payload.new.id)
        if (index !== -1) {
          posts.value[index] = { ...posts.value[index], ...payload.new }
        }
      }
    }

    if (payload.table === 'post_comments') {
      const postId = payload.new?.post_id || payload.old?.post_id
      if (visibleComments.value.has(postId)) {
        loadComments(postId)
      }
      // Actualizar contador de comentarios
      updateCommentsCount(postId)
    }

    if (payload.table === 'post_likes') {
      const postId = payload.new?.post_id || payload.old?.post_id
      updateLikesCount(postId)
    }
  })
}

const updateLikesCount = async (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    const { data } = await getPosts()
    const updatedPost = data?.find(p => p.id === postId)
    if (updatedPost) {
      post.likes_count = updatedPost.likes_count
    }
  }
}

const updateCommentsCount = async (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    const { data } = await getPosts()
    const updatedPost = data?.find(p => p.id === postId)
    if (updatedPost) {
      post.comments_count = updatedPost.comments_count
    }
  }
}

// Métodos de publicaciones
const submitPost = async () => {
  if (!newPost.value.title?.trim() || !newPost.value.content?.trim()) {
    showNotification(t('fillRequiredFields'), 'error')
    return
  }

  isSubmitting.value = true
  try {
    const { error } = await createPost({
      titulo: newPost.value.title,
      contenido: newPost.value.content,
      ubicacion: newPost.value.location
    })

    if (error) throw error

    showNotification(t('postCreated'), 'success')

    // Limpiar formulario
    newPost.value = { title: '', content: '', location: '' }
    selectedMapLocation.value = null
    showMapSelector.value = false
    showPostForm.value = false

    // Recargar publicaciones
    await loadPosts()
  } catch (error) {
    console.error('Error creando publicación:', error)
    showNotification(t('errorCreatingPost'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

const canEditPost = (post) => {
  if (!currentUser.value || post.author_id !== currentUser.value.id) {
    return false
  }

  const postDate = new Date(post.created_at)
  const now = new Date()
  const minutesDiff = (now - postDate) / (1000 * 60)

  return minutesDiff <= 1
}

const canDeletePost = (post) => {
  return currentUser.value && post.author_id === currentUser.value.id
}

const editPost = (post) => {
  editingPost.value = post
  editForm.value = {
    title: post.title,
    content: post.content,
    location: post.location || ''
  }
}

const updatePost = async () => {
  if (!editForm.value.title?.trim() || !editForm.value.content?.trim()) {
    showNotification(t('fillRequiredFields'), 'error')
    return
  }

  isUpdating.value = true
  try {
    const { error } = await updatePostAPI(editingPost.value.id, {
      titulo: editForm.value.title,
      contenido: editForm.value.content,
      ubicacion: editForm.value.location
    })

    if (error) throw error

    showNotification(t('postUpdated'), 'success')
    cancelEdit()
    await loadPosts()
  } catch (error) {
    console.error('Error actualizando publicación:', error)
    showNotification(t('errorUpdatingPost'), 'error')
  } finally {
    isUpdating.value = false
  }
}

const cancelEdit = () => {
  editingPost.value = null
  editForm.value = { title: '', content: '', location: '' }
}

const deletePost = async (postId) => {
  if (!confirm(t('confirmDeletePost'))) return

  try {
    const { error } = await deletePostAPI(postId)
    if (error) throw error

    posts.value = posts.value.filter(p => p.id !== postId)
    showNotification(t('postDeleted'), 'success')
  } catch (error) {
    console.error('Error eliminando publicación:', error)
    showNotification(t('errorDeletingPost'), 'error')
  }
}

// Métodos de likes
const handleLike = async (postId) => {
  if (likingPosts.value.has(postId)) return

  likingPosts.value.add(postId)

  try {
    const { data, error } = await toggleLike(postId)
    if (error) throw error

    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.user_liked = data.liked
      if (data.liked) {
        post.likes_count = (post.likes_count || 0) + 1
      } else {
        post.likes_count = Math.max((post.likes_count || 0) - 1, 0)
      }
    }
  } catch (error) {
    console.error('Error en like:', error)
    showNotification(t('errorLiking'), 'error')
  } finally {
    likingPosts.value.delete(postId)
  }
}

// Métodos de comentarios
const toggleComments = async (postId) => {
  if (visibleComments.value.has(postId)) {
    visibleComments.value.delete(postId)
  } else {
    visibleComments.value.add(postId)
    await loadComments(postId)
  }
}

const loadComments = async (postId) => {
  try {
    const { data, error } = await getPostComments(postId)
    if (error) throw error

    postComments.value[postId] = data || []
  } catch (error) {
    console.error('Error cargando comentarios:', error)
    showNotification(t('errorLoadingComments'), 'error')
  }
}

const submitComment = async (postId) => {
  const content = newComments.value[postId]?.trim()
  if (!content) return

  try {
    const parentId = replyingTo.value[postId]?.id || null
    const { data, error } = await createComment(postId, content, parentId)
    if (error) throw error

    // Actualizar comentarios localmente
    if (!postComments.value[postId]) {
      postComments.value[postId] = []
    }
    postComments.value[postId].push(data)

    // Limpiar formulario
    newComments.value[postId] = ''
    if (replyingTo.value[postId]) {
      delete replyingTo.value[postId]
    }

    showNotification(t('commentAdded'), 'success')
  } catch (error) {
    console.error('Error agregando comentario:', error)
    showNotification(t('errorAddingComment'), 'error')
  }
}

const startReply = (postId, comment) => {
  replyingTo.value[postId] = comment
}

const cancelReply = (postId) => {
  delete replyingTo.value[postId]
}

// Métodos de utilidad
const togglePostForm = () => {
  showPostForm.value = !showPostForm.value
  if (!showPostForm.value) {
    newPost.value = { title: '', content: '', location: '' }
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = (event) => {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

const clearSearch = () => {
  searchTerm.value = ''
}

// Métodos para solicitudes de amistad
const canSendFriendRequestToAuthor = (post) => {
  if (!currentUser.value) return false
  if (!post.author_id) return false
  if (post.author_id === currentUser.value.id) return false

  // Si ya hay un estado de amistad conocido, verificar
  if (post.friendship_status) {
    return post.friendship_status === 'none'
  }

  return true
}

const sendFriendRequestToAuthor = async (post) => {
  if (!post.author_id || sendingFriendRequest.value.has(post.author_id)) return

  sendingFriendRequest.value.add(post.author_id)

  try {
    const { error } = await sendFriendRequest(post.author_id)
    if (error) throw error

    // Actualizar el estado del post
    const postIndex = posts.value.findIndex(p => p.id === post.id)
    if (postIndex !== -1) {
      posts.value[postIndex].friendship_status = 'pending'
    }

    // Mostrar notificación de éxito
    showNotification(t('friendRequestSent'), 'success')
  } catch (error) {
    console.error('Error enviando solicitud de amistad:', error)
    showNotification(t('errorSendingFriendRequest'), 'error')
  } finally {
    sendingFriendRequest.value.delete(post.author_id)
  }
}

const handleLogout = async () => {
  try {
    await signOut()
    router.push('/')
  } catch (error) {
    console.error('Error en logout:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}m`
  } else if (hours < 24) {
    return `${hours}h`
  } else {
    return `${days}d`
  }
}

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message

  let backgroundColor = '#3b82f6' // default info color
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

// Watch para aplicar tema
watch(currentTheme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
})

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  await initializeUser()
  await loadPosts()
  setupWebSocket()

  // Cerrar menú de usuario al hacer click fuera
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  if (subscription.value) {
    subscription.value.unsubscribe()
  }
  document.removeEventListener('click', closeUserMenu)
})
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

/* Layout principal */
.forum-layout {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

/* Header principal */
.main-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.5rem 0 0.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-start;
  flex: 0 0 auto;
}


.header-logo {
  height: 56px;
  width: auto;
  margin-right: 12px;
}


.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-green);
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.language-selector .btn-language {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.language-selector .btn-language:hover {
  background: var(--primary-green-light);
  color: var(--primary-green);
}

.header-right {
  display: flex;
  align-items: center;
}

/* Menú de usuario */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-button:hover {
  background: var(--bg-secondary);
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
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 200px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}

/* Sidebar */
.modern-sidebar {
  width: 240px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  z-index: 50;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  border-right: 3px solid transparent;
}

.nav-link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-link.active {
  background: var(--primary-green-light);
  color: var(--primary-green);
  border-right-color: var(--primary-green);
  font-weight: 600;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: inherit;
  transition: all 0.2s;
}

.nav-link:hover .nav-icon,
.nav-link.active .nav-icon {
  transform: scale(1.1);
}

/* Contenido principal */
.forum-main {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  padding-left: 260px;
  padding-right: 20px;
}

/* Sección de búsqueda */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
}


.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem; /* derecha-izquierda para íconos */
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  transition: 0.2s;
}

.search-icon {
  position: absolute;
  right: 0.50rem;
  top: 40%;
  transform: translateY(-50%);
  font-size: large;
  color: #999;
}

.clear-search-btn {
  background: none;
  border: none;
  cursor: pointer;
}

/* Nueva publicación */
.new-post-section {
  margin-bottom: 2rem;
}

.btn-new-post {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-green);
  color: var(--white);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.btn-new-post:hover {
  background: var(--primary-green-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-new-post.active {
  background: var(--gray-500);
}

.btn-new-post i {
  transition: transform 0.2s;
}

.btn-new-post:hover i {
  transform: scale(1.1);
}

.new-post-form {
  margin-top: 1rem;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.form-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.form-user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
}

.form-username {
  font-weight: 600;
  color: var(--text-primary);
}

.form-body {
  padding: 1.5rem;
}

.title-input,
.content-textarea,
.location-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.title-input:focus,
.content-textarea:focus,
.location-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-light);
}

.title-input {
  font-weight: 600;
  font-size: 1.125rem;
}

.content-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.location-input-wrapper {
  position: relative;
}

.location-icon {
  position: absolute;
  right: 0.75rem;
  top: 40%;
  transform: translateY(-50%);
  color: var(--primary-green);
  font-size: 1.5rem;
  z-index: 10;
  opacity: 0.8;
}

.location-input:focus ~ .location-icon {
  opacity: 1;
}

.location-input {
  padding-left: 2.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
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
}

/* Estados de carga */
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

.no-posts {
  text-align: center;
  padding: 3rem;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.no-posts-icon {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.no-posts h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-posts p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Publicaciones */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-card {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.2s;
}

.post-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.post-header {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.author-avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  font-size: 1.25rem;
}

.author-info h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-meta i {
  font-size: 0.9rem;
}

.post-menu {
  display: flex;
  gap: 0.5rem;
}

.post-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.post-action-btn:hover {
  background: var(--primary-green-light);
  color: var(--primary-green);
}

.post-action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.post-content {
  padding: 0 1.5rem 1.5rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.post-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-btn i {
  font-size: 0.9rem;
  transition: all 0.2s;
}

.action-btn:hover i {
  transform: scale(1.1);
}

.action-btn:hover {
  background: var(--bg-primary);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.action-btn.liked {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botones específicos de amistad */
.friend-request-btn {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

.friend-request-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: #16a34a;
  color: #16a34a;
}

.friendship-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
}

.friendship-indicator.friend {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

.friendship-indicator.pending {
  background: rgba(251, 191, 36, 0.1);
  border-color: #fbbf24;
  color: #f59e0b;
}

/* Comentarios */
.comments-section {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.comments-header h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-comments-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-comments-btn:hover {
  color: var(--text-primary);
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-left: 0;
}

.comment-item.is-reply {
  margin-left: 2rem;
  margin-top: 1rem;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.comment-header h5 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.875rem;
}

.comment-date {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.comment-reply-to {
  font-size: 0.875rem;
  color: var(--primary-green);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.comment-text {
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0 0 0.5rem 0;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0;
  transition: all 0.2s;
}

.comment-action-btn i {
  font-size: 0.8rem;
  margin-right: 0.25rem;
  transition: all 0.2s;
}

.comment-action-btn:hover i {
  transform: scale(1.1);
}

.comment-action-btn:hover {
  color: var(--primary-green);
}

.comment-form {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.comment-input-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.comment-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-user-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  flex-shrink: 0;
}

.comment-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reply-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--primary-green-light);
  color: var(--primary-green);
  padding: 0.5rem 0.75rem;
  border-radius: 6px 6px 0 0;
  font-size: 0.875rem;
  margin-bottom: -1px;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: var(--primary-green);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.cancel-reply-btn:hover {
  background: rgba(5, 150, 105, 0.2);
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary);
  resize: none;
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-light);
}

.comment-submit-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--primary-green);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  align-self: flex-end;
}

.comment-submit-btn:hover:not(:disabled) {
  background: var(--primary-green-hover);
}

.comment-submit-btn:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
}

/* Modal de edición */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-modal-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-modal-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.edit-form {
  padding: 1.5rem;
}

.edit-title-input,
.edit-content-textarea,
.edit-location-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.edit-title-input:focus,
.edit-content-textarea:focus,
.edit-location-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-light);
}

.edit-title-input {
  font-weight: 600;
}

.edit-content-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Clases utilitarias para iconos */
.btn-with-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-with-icon i {
  transition: transform 0.2s;
}

.btn-with-icon:hover i {
  transform: translateX(2px);
}

.icon-hover-animate:hover i {
  animation: iconPulse 0.5s ease;
}

@keyframes iconPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Asegurar consistencia en todos los iconos */
i[class^="fas"] {
  vertical-align: middle;
  line-height: 1;
}

/* Animaciones */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .modern-sidebar {
    display: none;
  }

  .forum-main {
    margin-left: 0;
    padding-left: 2rem;
  }

  .header-container {
    padding: 0 1rem;
  }

  .header-title {
    display: none;
  }
}

@media (max-width: 768px) {
  .forum-main {
    padding: 1rem;
    padding-left: 1rem;
  }

  .header-container {
    padding: 0 0.5rem;
  }

  .header-center {
    display: none;
  }

  .post-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .post-menu {
    align-self: flex-end;
  }

  .post-actions {
    flex-wrap: wrap;
  }

  .comment-item.is-reply {
    margin-left: 1rem;
  }

  .comment-input-wrapper {
    align-items: flex-end;
  }

  .modal-overlay {
    padding: 0.5rem;
  }
}

/* Notificaciones */
.notification {
  font-weight: 500;
  border-radius: 8px;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Estilos para el selector de mapas */
.location-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-map-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  align-self: flex-start;
}

.btn-map-toggle:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.map-selector-container {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.map-selector-container .map-selector {
  border: none;
}

.map-selector-container .map-container {
  height: 300px;
}
</style>

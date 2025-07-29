<template>
  <div class="gallery-layout">
    <!-- Header principal -->
    <header class="main-header">
      <div class="header-container">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="header-logo" />
          <h1 class="header-title">{{ t('gallery') }}</h1>
        </div>
        
        <div class="header-right">
          <button @click="showUploadModal = true" class="btn btn-primary">
            <i class="fas fa-cloud-upload-alt"></i>
            {{ t('uploadImage') }}
          </button>
          <router-link to="/foro" class="btn btn-outline">
            <i class="fas fa-arrow-left"></i>
            {{ t('backToForum') }}
          </router-link>
        </div>
      </div>
    </header>

    <div class="gallery-container">
      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-buttons">
          <button 
            @click="activeFilter = 'all'"
            :class="['filter-btn', { active: activeFilter === 'all' }]"
          >
            <i class="fas fa-images"></i>
            {{ t('allImages') }}
          </button>
          <button 
            @click="activeFilter = 'my'"
            :class="['filter-btn', { active: activeFilter === 'my' }]"
          >
            <i class="fas fa-user"></i>
            {{ t('myImages') }}
          </button>
          <button 
            @click="activeFilter = 'posts'"
            :class="['filter-btn', { active: activeFilter === 'posts' }]"
          >
            <i class="fas fa-newspaper"></i>
            {{ t('fromPosts') }}
          </button>
        </div>

        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="searchTerm"
            :placeholder="t('searchImages')"
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('loadingImages') }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredImages.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-images"></i>
        </div>
        <h3>{{ t('noImages') }}</h3>
        <p>{{ t('noImagesMessage') }}</p>
        <button @click="showUploadModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ t('uploadFirstImage') }}
        </button>
      </div>

      <!-- Grid de imágenes -->
      <div v-else class="images-grid">
        <div
          v-for="image in filteredImages"
          :key="image.id"
          class="image-card"
          @click="openImage(image)"
        >
          <div class="image-wrapper">
            <img :src="image.image_url" :alt="image.description" class="gallery-image" />
            <div class="image-overlay">
              <div class="image-actions">
                <button @click.stop="downloadImage(image)" class="action-btn">
                  <i class="fas fa-download"></i>
                </button>
                <button v-if="canDeleteImage(image)" @click.stop="deleteImage(image.id)" class="action-btn delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="image-info">
            <h4>{{ image.description || t('noDescription') }}</h4>
            <div class="image-meta">
              <span class="image-author">
                <i class="fas fa-user"></i>
                {{ image.profiles?.username || 'Usuario' }}
              </span>
              <span class="image-date">
                <i class="fas fa-clock"></i>
                {{ formatDate(image.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de subida -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal-content upload-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ t('uploadImage') }}</h3>
          <button @click="closeUploadModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div 
            class="upload-zone"
            :class="{ 'drag-over': isDragOver }"
            @drop="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @click="triggerFileInput"
          >
            <div v-if="!selectedFile" class="upload-placeholder">
              <i class="fas fa-cloud-upload-alt"></i>
              <h4>{{ t('dropImageHere') }}</h4>
              <p>{{ t('orClickToSelect') }}</p>
              <span class="file-types">{{ t('supportedFormats') }}</span>
            </div>
            
            <div v-else class="upload-preview">
              <img :src="previewUrl" alt="Preview" class="preview-image" />
              <button @click.stop="removeSelectedFile" class="remove-file-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />

          <div class="upload-form">
            <div class="form-group">
              <label for="imageDescription">{{ t('imageDescription') }}</label>
              <textarea
                id="imageDescription"
                v-model="uploadForm.description"
                :placeholder="t('imageDescriptionPlaceholder')"
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeUploadModal" class="btn btn-outline">
            {{ t('cancel') }}
          </button>
          <button 
            @click="uploadImage" 
            :disabled="!selectedFile || isUploading"
            class="btn btn-primary"
          >
            <i v-if="isUploading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-upload"></i>
            {{ isUploading ? t('uploading') : t('upload') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de visualización -->
    <div v-if="selectedImage" class="modal-overlay image-viewer-overlay" @click="closeImageViewer">
      <div class="image-viewer" @click.stop>
        <button @click="closeImageViewer" class="viewer-close-btn">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="viewer-image-container">
          <img :src="selectedImage.image_url" :alt="selectedImage.description" class="viewer-image" />
        </div>
        
        <div class="viewer-info">
          <h3>{{ selectedImage.description || t('noDescription') }}</h3>
          <div class="viewer-meta">
            <span>
              <i class="fas fa-user"></i>
              {{ selectedImage.profiles?.username || 'Usuario' }}
            </span>
            <span>
              <i class="fas fa-clock"></i>
              {{ formatDate(selectedImage.created_at) }}
            </span>
          </div>
          
          <div class="viewer-actions">
            <button @click="downloadImage(selectedImage)" class="btn btn-outline">
              <i class="fas fa-download"></i>
              {{ t('download') }}
            </button>
            <button v-if="canDeleteImage(selectedImage)" @click="deleteImage(selectedImage.id)" class="btn btn-danger">
              <i class="fas fa-trash"></i>
              {{ t('delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getGalleryImages, 
  addToGallery, 
  uploadFile, 
  getCurrentUser 
} from '../lib/supabaseClient.js'
import { useI18n } from '../composables/useI18n.js'

const router = useRouter()
const { t } = useI18n()

// Estados reactivos
const images = ref([])
const loading = ref(true)
const activeFilter = ref('all')
const searchTerm = ref('')
const currentUser = ref(null)

// Modal states
const showUploadModal = ref(false)
const selectedImage = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const isDragOver = ref(false)
const isUploading = ref(false)

// Form data
const uploadForm = ref({
  description: ''
})

// Computed properties
const filteredImages = computed(() => {
  let filtered = images.value

  // Filtro por tipo
  if (activeFilter.value === 'my' && currentUser.value) {
    filtered = filtered.filter(img => img.user_id === currentUser.value.id)
  } else if (activeFilter.value === 'posts') {
    filtered = filtered.filter(img => img.post_id !== null)
  }

  // Filtro por búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(img =>
      img.description?.toLowerCase().includes(term) ||
      img.profiles?.username?.toLowerCase().includes(term)
    )
  }

  return filtered
})

const canDeleteImage = (image) => {
  return currentUser.value && image.user_id === currentUser.value.id
}

// Métodos principales
const initializeUser = async () => {
  try {
    currentUser.value = await getCurrentUser()
  } catch (error) {
    console.error('Error inicializando usuario:', error)
  }
}

const loadImages = async () => {
  loading.value = true
  try {
    const { data, error } = await getGalleryImages()
    if (error) throw error
    
    images.value = data || []
  } catch (error) {
    console.error('Error cargando imágenes:', error)
    showNotification(t('errorLoadingImages'), 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await initializeUser()
  await loadImages()
})

// Métodos de upload
const triggerFileInput = () => {
  document.querySelector('input[type="file"]').click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file) => {
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeSelectedFile = () => {
  selectedFile.value = null
  previewUrl.value = ''
  document.querySelector('input[type="file"]').value = ''
}

const uploadImage = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  try {
    // Subir archivo
    const { data: fileData, error: uploadError } = await uploadFile(selectedFile.value, 'gallery')
    if (uploadError) throw uploadError

    // Agregar a galería
    const { data, error } = await addToGallery(
      fileData.url,
      uploadForm.value.description.trim()
    )
    if (error) throw error

    showNotification(t('imageUploaded'), 'success')
    
    // Recargar imágenes y cerrar modal
    await loadImages()
    closeUploadModal()
    
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    showNotification(t('errorUploadingImage'), 'error')
  } finally {
    isUploading.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  removeSelectedFile()
  uploadForm.value.description = ''
  isDragOver.value = false
}

// Métodos de visualización
const openImage = (image) => {
  selectedImage.value = image
}

const closeImageViewer = () => {
  selectedImage.value = null
}

// Métodos de acciones
const downloadImage = (image) => {
  const link = document.createElement('a')
  link.href = image.image_url
  link.download = `image-${image.id}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showNotification(t('imageDownloaded'), 'success')
}

const deleteImage = async (imageId) => {
  if (!confirm(t('confirmDeleteImage'))) return

  try {
    // Aquí iría la función de eliminar imagen
    images.value = images.value.filter(img => img.id !== imageId)
    showNotification(t('imageDeleted'), 'success')
    
    if (selectedImage.value?.id === imageId) {
      closeImageViewer()
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    showNotification(t('errorDeletingImage'), 'error')
  }
}

// Utilidades
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showNotification = (message, type = 'info') => {
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

.gallery-layout {
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

.header-right {
  display: flex;
  gap: 1rem;
}

/* Contenedor principal */
.gallery-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Filtros */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.filter-buttons {
  display: flex;
  gap: 1rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.filter-btn:hover {
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.filter-btn.active {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: var(--white);
}

.search-wrapper {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
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

/* Estados de carga y vacío */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
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

.empty-icon {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Grid de imágenes */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.image-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.image-card:hover .gallery-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--white);
  transform: scale(1.1);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.9);
  color: var(--white);
}

.action-btn.delete:hover {
  background: #ef4444;
}

.image-info {
  padding: 1rem;
}

.image-info h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  line-height: 1.4;
}

.image-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.image-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

/* Modales */
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

.upload-modal {
  max-width: 600px;
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

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Upload zone */
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
}

.upload-placeholder i {
  font-size: 3rem;
  color: var(--primary-green);
  margin-bottom: 1rem;
}

.upload-placeholder h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.upload-placeholder p {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.file-types {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.remove-file-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--danger-color);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.upload-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-light);
}

/* Visor de imágenes */
.image-viewer-overlay {
  background: rgba(0, 0, 0, 0.9);
}

.image-viewer {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
}

.viewer-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.2s;
}

.viewer-close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.viewer-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.viewer-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.viewer-info {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.viewer-info h3 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.viewer-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.viewer-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.viewer-actions {
  display: flex;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }

  .gallery-container {
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filter-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .search-wrapper {
    width: 100%;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .header-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-content {
    margin: 1rem;
  }

  .image-viewer {
    max-width: 95vw;
    max-height: 95vh;
  }

  .viewer-actions {
    flex-direction: column;
  }
}

/* Animaciones */
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

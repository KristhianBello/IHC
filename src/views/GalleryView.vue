<template>
  <div class="gallery-layout">
    <!-- Header -->
    <HeaderWithProfile :show-back-to-forum="true" />

    <div class="gallery-content">
      <div class="gallery-header-section">
        <h1 class="page-title">
          <i class="fas fa-images"></i>
          {{ t('gallery') }}
        </h1>

        <div class="header-actions">
          <div class="upload-section">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileUpload"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="btn btn-primary">
              <i class="fas fa-cloud-upload-alt"></i>
              {{ t('upload') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <select v-model="currentFilter" class="filter-select">
            <option value="all">{{ t('allImages') }}</option>
            <option value="my">{{ t('myImages') }}</option>
            <option value="forum">{{ t('forumImages') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Galería -->
    <main class="gallery-main">
      <div class="images-grid" v-if="filteredImages.length > 0">
        <div
          v-for="image in filteredImages"
          :key="image.id"
          class="image-card"
          @click="openImageModal(image)"
        >
          <div class="image-container">
            <img :src="image.url" :alt="image.title || 'Item'" />
            <div class="image-overlay">
              <div class="image-actions">
                <button @click.stop="downloadImage(image)" class="action-btn">
                  <i class="fas fa-download"></i>
                </button>
                <button
                  v-if="image.canDelete"
                  @click.stop="deleteImage(image.id)"
                  class="action-btn delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="image-info">
            <h3 class="image-title">{{ image.title || t('untitled') }}</h3>
            <p class="image-description">{{ image.description }}</p>
            <div class="image-meta">
              <span class="author">{{ image.author }}</span>
              <span class="date">{{ formatDate(image.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-content">
          <i class="fas fa-images"></i>
          <h3>{{ t('noImages') }}</h3>
          <p>{{ t('noImagesMessage') }}</p>
          <button @click="$refs.fileInput.click()" class="btn btn-primary">
            <i class="fas fa-cloud-upload-alt"></i>
            {{ t('uploadFirst') }}
          </button>
        </div>
      </div>
    </main>

    <!-- Modal de imagen -->
    <div v-if="selectedImage" class="image-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button @click="closeModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>

        <div class="modal-image">
          <img :src="selectedImage.url" :alt="selectedImage.title || 'Content'" />
        </div>

        <div class="modal-info">
          <h2>{{ selectedImage.title || t('untitled') }}</h2>
          <p>{{ selectedImage.description }}</p>
          <div class="modal-meta">
            <span>{{ t('by') }} {{ selectedImage.author }}</span>
            <span>{{ formatDate(selectedImage.created_at) }}</span>
          </div>

          <div class="modal-actions">
            <button @click="downloadImage(selectedImage)" class="btn btn-primary">
              <i class="fas fa-download"></i>
              {{ t('download') }}
            </button>
            <button
              v-if="selectedImage.canDelete"
              @click="deleteImage(selectedImage.id)"
              class="btn btn-danger"
            >
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
import { useI18n } from '@/composables/useI18n.js'
import HeaderWithProfile from '@/components/HeaderWithProfile.vue'

const { t } = useI18n()

const images = ref([])
const currentFilter = ref('all')
const searchTerm = ref('')
const selectedImage = ref(null)
const isLoading = ref(false)

const filteredImages = computed(() => {
  let filtered = images.value

  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(img => img.source === currentFilter.value)
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(img =>
      img.title?.toLowerCase().includes(term) ||
      img.description?.toLowerCase().includes(term) ||
      img.author?.toLowerCase().includes(term)
    )
  }

  return filtered
})

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      isLoading.value = true

      // Simular subida
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newImage = {
        id: Date.now() + Math.random(),
        title: file.name.split('.')[0],
        description: 'Imagen subida por el usuario',
        url: URL.createObjectURL(file),
        author: 'Usuario Actual',
        created_at: new Date().toISOString(),
        canDelete: true,
        source: 'my'
      }

      images.value.unshift(newImage)
    }
  }

  isLoading.value = false
  event.target.value = ''
}

const downloadImage = async (image) => {
  try {
    const response = await fetch(image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${image.title || 'image'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar:', error)
  }
}

const deleteImage = (imageId) => {
  if (confirm(t('confirmDeleteImage'))) {
    images.value = images.value.filter(img => img.id !== imageId)
    if (selectedImage.value?.id === imageId) {
      selectedImage.value = null
    }
  }
}

const openImageModal = (image) => {
  selectedImage.value = image
}

const closeModal = () => {
  selectedImage.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  // Iniciar con array vacío - sin imágenes simuladas
  images.value = []
})
</script>

<style scoped>
.gallery-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.gallery-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.gallery-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: var(--accent-color);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.gallery-header {
  background: white;
  border-bottom: 1px solid #e8ecef;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.btn-outline {
  background: transparent;
  color: #28a745;
  border: 2px solid #28a745;
}

.btn-outline:hover {
  background: #28a745;
  color: white;
}

.filters-section {
  padding: 20px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8ecef;
  display: flex;
  gap: 20px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-select {
  padding: 10px 15px;
  border: 2px solid #e8ecef;
  border-radius: 8px;
  font-weight: 500;
  background: white;
}

.search-group {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-group i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}


.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #e8ecef;
  border-radius: 25px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #28a745;
}

.gallery-main {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.image-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-card:hover .image-container img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
}

.action-btn.delete {
  color: #dc3545;
}

.image-info {
  padding: 20px;
}

.image-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.image-description {
  color: #6c757d;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-content {
  text-align: center;
}

.empty-content i {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 20px;
}

.empty-content h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-content p {
  color: #6c757d;
  margin-bottom: 20px;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
}

.modal-image img {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.modal-info {
  padding: 30px;
}

.modal-info h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.modal-info p {
  color: #6c757d;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  color: #6c757d;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
}
</style>

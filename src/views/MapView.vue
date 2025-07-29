<template>
  <div class="map-layout">
    <!-- Header principal -->
    <header class="main-header">
      <div class="header-container">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="header-logo" />
          <h1 class="header-title">{{ t('spaceMap') }}</h1>
        </div>
        
        <div class="header-right">
          <router-link to="/foro" class="btn btn-outline">
            <i class="fas fa-arrow-left"></i>
            {{ t('backToForum') }}
          </router-link>
        </div>
      </div>
    </header>

    <div class="map-container">
      <!-- Panel lateral -->
      <div class="map-sidebar">
        <div class="sidebar-header">
          <h2>
            <i class="fas fa-map-marker-alt"></i>
            {{ t('mySpaces') }}
          </h2>
          <div class="spaces-count">
            {{ userSpaces.length }} {{ t('spaces') }}
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-section">
          <div class="filter-group">
            <label>{{ t('spaceType') }}</label>
            <select v-model="selectedType" class="filter-select">
              <option value="">{{ t('allTypes') }}</option>
              <option value="adoption">{{ t('adoptions') }}</option>
              <option value="task">{{ t('tasks') }}</option>
              <option value="report">{{ t('reports') }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>{{ t('status') }}</label>
            <select v-model="selectedStatus" class="filter-select">
              <option value="">{{ t('allStatuses') }}</option>
              <option value="active">{{ t('active') }}</option>
              <option value="pending">{{ t('pending') }}</option>
              <option value="completed">{{ t('completed') }}</option>
            </select>
          </div>
        </div>

        <!-- Lista de espacios -->
        <div class="spaces-list">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>{{ t('loadingSpaces') }}</p>
          </div>

          <div v-else-if="filteredSpaces.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h4>{{ t('noSpaces') }}</h4>
            <p>{{ t('noSpacesMessage') }}</p>
          </div>

          <div
            v-for="space in filteredSpaces"
            :key="`${space.type}-${space.id}`"
            class="space-card"
            :class="{ active: selectedSpace?.id === space.id }"
            @click="selectSpace(space)"
          >
            <div class="space-header">
              <div class="space-type" :class="space.type">
                <i :class="getSpaceIcon(space.type)"></i>
              </div>
              <div class="space-info">
                <h4>{{ space.title }}</h4>
                <p class="space-location">{{ space.location }}</p>
              </div>
              <div class="space-status" :class="space.status">
                {{ getStatusText(space.status) }}
              </div>
            </div>

            <div class="space-meta">
              <span class="space-date">
                <i class="fas fa-calendar"></i>
                {{ formatDate(space.date) }}
              </span>
              <span v-if="space.type === 'task'" class="space-participants">
                <i class="fas fa-users"></i>
                {{ space.participants || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mapa principal -->
      <div class="map-main">
        <div class="map-wrapper">
          <div ref="mapContainer" class="leaflet-map"></div>
        </div>

        <!-- Panel de información del espacio seleccionado -->
        <div v-if="selectedSpace" class="space-detail-panel">
          <div class="panel-header">
            <div class="space-title">
              <div class="space-type-icon" :class="selectedSpace.type">
                <i :class="getSpaceIcon(selectedSpace.type)"></i>
              </div>
              <div>
                <h3>{{ selectedSpace.title }}</h3>
                <p>{{ selectedSpace.location }}</p>
              </div>
            </div>
            <button @click="closeSpaceDetail" class="close-panel-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="panel-content">
            <div class="detail-section">
              <h4>{{ t('description') }}</h4>
              <p>{{ selectedSpace.description || t('noDescription') }}</p>
            </div>

            <div class="detail-section" v-if="selectedSpace.type === 'adoption'">
              <h4>{{ t('adoptionDetails') }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">{{ t('frequency') }}</span>
                  <span class="detail-value">{{ selectedSpace.frequency }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ t('volunteers') }}</span>
                  <span class="detail-value">{{ selectedSpace.volunteers }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ t('activities') }}</span>
                  <span class="detail-value">{{ selectedSpace.activities?.join(', ') }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedSpace.type === 'task'">
              <h4>{{ t('taskDetails') }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">{{ t('startTime') }}</span>
                  <span class="detail-value">{{ selectedSpace.startTime }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ t('duration') }}</span>
                  <span class="detail-value">{{ selectedSpace.duration }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ t('participants') }}</span>
                  <span class="detail-value">{{ selectedSpace.participants || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedSpace.type === 'report'">
              <h4>{{ t('reportDetails') }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">{{ t('priority') }}</span>
                  <span class="detail-value priority" :class="selectedSpace.priority">
                    {{ getPriorityText(selectedSpace.priority) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ t('category') }}</span>
                  <span class="detail-value">{{ selectedSpace.category }}</span>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <button 
                v-if="selectedSpace.type === 'adoption'"
                @click="viewAdoption(selectedSpace.id)"
                class="btn btn-primary btn-sm"
              >
                <i class="fas fa-eye"></i>
                {{ t('viewDetails') }}
              </button>
              <button 
                v-if="selectedSpace.type === 'task'"
                @click="viewTask(selectedSpace.id)"
                class="btn btn-primary btn-sm"
              >
                <i class="fas fa-calendar"></i>
                {{ t('viewTask') }}
              </button>
              <button 
                v-if="selectedSpace.type === 'report'"
                @click="viewReport(selectedSpace.id)"
                class="btn btn-primary btn-sm"
              >
                <i class="fas fa-exclamation-triangle"></i>
                {{ t('viewReport') }}
              </button>
              <button @click="centerOnSpace(selectedSpace)" class="btn btn-outline btn-sm">
                <i class="fas fa-crosshairs"></i>
                {{ t('centerMap') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '../composables/useI18n.js'

const router = useRouter()
const { t } = useI18n()

// Estados reactivos
const mapContainer = ref(null)
const map = ref(null)
const markers = ref([])
const userSpaces = ref([])
const selectedSpace = ref(null)
const selectedType = ref('')
const selectedStatus = ref('')
const loading = ref(true)

// Computed properties
const filteredSpaces = computed(() => {
  let filtered = userSpaces.value

  if (selectedType.value) {
    filtered = filtered.filter(space => space.type === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(space => space.status === selectedStatus.value)
  }

  return filtered
})

// Métodos principales
const initializeMap = () => {
  // Inicializar mapa en Guayaquil, Ecuador
  map.value = L.map(mapContainer.value).setView([-2.1499, -79.9663], 12)

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  // Configurar iconos personalizados
  setupCustomIcons()
}

const setupCustomIcons = () => {
  // Crear iconos personalizados para diferentes tipos de espacios
  window.adoptionIcon = L.divIcon({
    html: '<div class="custom-marker adoption"><i class="fas fa-seedling"></i></div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  window.taskIcon = L.divIcon({
    html: '<div class="custom-marker task"><i class="fas fa-calendar-plus"></i></div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  window.reportIcon = L.divIcon({
    html: '<div class="custom-marker report"><i class="fas fa-exclamation-triangle"></i></div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

const loadUserSpaces = async () => {
  loading.value = true
  try {
    // Simular datos de espacios del usuario
    const mockSpaces = [
      {
        id: 1,
        type: 'adoption',
        title: 'Parque Central Norte',
        location: 'Av. 9 de Octubre y Malecón',
        coordinates: [-2.1699, -79.9263],
        status: 'active',
        date: '2024-01-15',
        description: 'Adopción del área de juegos infantiles del parque central.',
        frequency: 'Semanal',
        volunteers: 8,
        activities: ['Limpieza', 'Jardinería', 'Pintura']
      },
      {
        id: 2,
        type: 'task',
        title: 'Limpieza Plaza San Martín',
        location: 'Plaza San Martín, Centro',
        coordinates: [-2.1899, -79.8863],
        status: 'pending',
        date: '2024-02-20',
        description: 'Jornada de limpieza y mantenimiento de la plaza.',
        startTime: '08:00',
        duration: '4 horas',
        participants: 12
      },
      {
        id: 3,
        type: 'report',
        title: 'Luminaria dañada',
        location: 'Av. Kennedy y Rodríguez',
        coordinates: [-2.1299, -79.9463],
        status: 'pending',
        date: '2024-02-18',
        description: 'Reporte de luminaria pública dañada que requiere reparación.',
        priority: 'high',
        category: 'Iluminación'
      }
    ]

    userSpaces.value = mockSpaces
    addMarkersToMap(mockSpaces)
  } catch (error) {
    console.error('Error cargando espacios:', error)
  } finally {
    loading.value = false
  }
}

const addMarkersToMap = (spaces) => {
  // Limpiar marcadores existentes
  clearMarkers()

  spaces.forEach(space => {
    const icon = getMarkerIcon(space.type)
    const marker = L.marker(space.coordinates, { icon })
      .addTo(map.value)
      .bindPopup(`
        <div class="marker-popup">
          <h4>${space.title}</h4>
          <p>${space.location}</p>
          <div class="popup-actions">
            <button onclick="window.selectSpaceFromMarker(${space.id})" class="popup-btn">
              Ver detalles
            </button>
          </div>
        </div>
      `)

    markers.value.push({ id: space.id, marker })
  })

  // Agregar función global para seleccionar desde popup
  window.selectSpaceFromMarker = (spaceId) => {
    const space = userSpaces.value.find(s => s.id === spaceId)
    if (space) {
      selectSpace(space)
    }
  }
}

const getMarkerIcon = (type) => {
  switch (type) {
    case 'adoption':
      return window.adoptionIcon
    case 'task':
      return window.taskIcon
    case 'report':
      return window.reportIcon
    default:
      return window.adoptionIcon
  }
}

const clearMarkers = () => {
  markers.value.forEach(({ marker }) => {
    map.value.removeLayer(marker)
  })
  markers.value = []
}

const selectSpace = (space) => {
  selectedSpace.value = space
  
  // Centrar mapa en el espacio seleccionado
  if (map.value && space.coordinates) {
    map.value.setView(space.coordinates, 16)
  }

  // Resaltar marcador
  highlightMarker(space.id)
}

const highlightMarker = (spaceId) => {
  const markerData = markers.value.find(m => m.id === spaceId)
  if (markerData) {
    markerData.marker.openPopup()
  }
}

const closeSpaceDetail = () => {
  selectedSpace.value = null
}

const centerOnSpace = (space) => {
  if (map.value && space.coordinates) {
    map.value.setView(space.coordinates, 18)
  }
}

// Métodos de utilidad
const getSpaceIcon = (type) => {
  const icons = {
    adoption: 'fas fa-seedling',
    task: 'fas fa-calendar-plus',
    report: 'fas fa-exclamation-triangle'
  }
  return icons[type] || 'fas fa-map-marker-alt'
}

const getStatusText = (status) => {
  const statuses = {
    active: t('active'),
    pending: t('pending'),
    completed: t('completed'),
    approved: t('approved'),
    rejected: t('rejected')
  }
  return statuses[status] || status
}

const getPriorityText = (priority) => {
  const priorities = {
    low: t('lowPriority'),
    medium: t('mediumPriority'),
    high: t('highPriority'),
    critical: t('criticalPriority')
  }
  return priorities[priority] || priority
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Métodos de navegación
const viewAdoption = (id) => {
  router.push(`/adopciones/${id}`)
}

const viewTask = (id) => {
  router.push(`/programar-tareas/${id}`)
}

const viewReport = (id) => {
  router.push(`/reportar/${id}`)
}

onMounted(async () => {
  await nextTick()
  initializeMap()
  await loadUserSpaces()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
/* Variables CSS */
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

.map-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

/* Header */
.main-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.header-container {
  max-width: 1400px;
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

/* Contenedor del mapa */
.map-container {
  flex: 1;
  display: flex;
  height: calc(100vh - 64px);
}

/* Sidebar */
.map-sidebar {
  width: 400px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spaces-count {
  background: var(--primary-green-light);
  color: var(--primary-green);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Filtros */
.filters-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-green);
}

/* Lista de espacios */
.spaces-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.space-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.space-card:hover {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
}

.space-card.active {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
  box-shadow: var(--shadow-sm);
}

.space-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.space-type {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
}

.space-type.adoption {
  background: var(--primary-green);
}

.space-type.task {
  background: #3b82f6;
}

.space-type.report {
  background: #f59e0b;
}

.space-info {
  flex: 1;
}

.space-info h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.space-location {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin: 0;
}

.space-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.space-status.active {
  background: #dcfce7;
  color: #166534;
}

.space-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.space-status.completed {
  background: #dbeafe;
  color: #1e40af;
}

.space-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.space-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Área del mapa */
.map-main {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

/* Panel de detalles */
.space-detail-panel {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 350px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  z-index: 1000;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.space-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.space-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 1.25rem;
}

.space-type-icon.adoption {
  background: var(--primary-green);
}

.space-type-icon.task {
  background: #3b82f6;
}

.space-type-icon.report {
  background: #f59e0b;
}

.space-title h3 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.space-title p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.close-panel-btn {
  width: 28px;
  height: 28px;
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

.close-panel-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.detail-section p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 600;
}

.detail-value.priority.high {
  color: #dc2626;
}

.detail-value.priority.medium {
  color: #f59e0b;
}

.detail-value.priority.low {
  color: var(--primary-green);
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
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

.btn-primary:hover {
  background: var(--primary-green-hover);
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

/* Estilos para marcadores personalizados */
:global(.custom-marker) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:global(.custom-marker.adoption) {
  background: var(--primary-green);
}

:global(.custom-marker.task) {
  background: #3b82f6;
}

:global(.custom-marker.report) {
  background: #f59e0b;
}

/* Popup del marcador */
:global(.marker-popup) {
  min-width: 200px;
}

:global(.marker-popup h4) {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--text-primary);
}

:global(.marker-popup p) {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

:global(.popup-actions) {
  text-align: center;
}

:global(.popup-btn) {
  background: var(--primary-green);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 600;
}

:global(.popup-btn:hover) {
  background: var(--primary-green-hover);
}

/* Responsive */
@media (max-width: 1024px) {
  .map-container {
    flex-direction: column;
  }

  .map-sidebar {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .space-detail-panel {
    position: static;
    width: 100%;
    margin: 1rem;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }

  .map-sidebar {
    height: 250px;
  }

  .space-card {
    padding: 0.75rem;
  }

  .space-detail-panel {
    margin: 0.5rem;
  }

  .panel-content {
    padding: 0.75rem;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>

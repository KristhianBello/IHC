<template>
  <div class="adoptions-container">
    <div class="header">
      <h2><i class="fas fa-seedling"></i> Mis Adopciones</h2>
      <RouterLink to="/solicitud" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nueva Adopción
      </RouterLink>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h3>{{ stats.total }}</h3>
          <p>Total</p>
        </div>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <h3>{{ stats.pending }}</h3>
          <p>Pendientes</p>
        </div>
      </div>
      <div class="stat-card approved">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>{{ stats.approved }}</h3>
          <p>Aprobadas</p>
        </div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <h3>{{ stats.rejected }}</h3>
          <p>Rechazadas</p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <select v-model="selectedStatus" class="filter-select">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendientes</option>
        <option value="aprobada">Aprobadas</option>
        <option value="rechazada">Rechazadas</option>
      </select>
      <input
        v-model="searchTerm"
        placeholder="Buscar por nombre de espacio..."
        class="search-input"
      />
    </div>

    <!-- Lista de adopciones -->
    <div class="adoptions-list">
      <div v-if="filteredAdoptions.length === 0" class="empty-state">
        <div class="empty-icon">🌱</div>
        <h3>No tienes adopciones aún</h3>
        <p>Comienza a cuidar tu comunidad adoptando un espacio público</p>
        <RouterLink to="/solicitud" class="btn btn-primary">
          Solicitar adopción
        </RouterLink>
      </div>

      <div
        v-for="adoption in filteredAdoptions"
        :key="adoption.id"
        class="adoption-card"
      >
        <div class="adoption-header">
          <div class="adoption-info">
            <h3>{{ adoption.nombre_espacio }}</h3>
            <p class="location">📍 {{ adoption.ubicacion_espacio }}</p>
            <p class="date">📅 {{ formatDate(adoption.created_at) }}</p>
          </div>
          <div class="adoption-status">
            <span :class="['status-badge', adoption.estado]">
              {{ getStatusText(adoption.estado) }}
            </span>
          </div>
        </div>

        <div class="adoption-details">
          <div class="detail-item">
            <strong>Frecuencia:</strong> {{ getFrequencyText(adoption.frecuencia) }}
          </div>
          <div class="detail-item">
            <strong>Voluntarios:</strong> {{ adoption.num_voluntarios }} personas
          </div>
          <div class="detail-item">
            <strong>Descripción:</strong> {{ adoption.descripcion }}
          </div>
          <div v-if="adoption.coordenadas" class="detail-item">
            <strong>Coordenadas:</strong> {{ adoption.coordenadas.lat?.toFixed(6) }}, {{ adoption.coordenadas.lng?.toFixed(6) }}
          </div>
        </div>

        <div class="adoption-actions">
          <button
            @click="viewDetails(adoption)"
            class="btn btn-outline btn-sm"
          >
            <i class="fas fa-eye"></i> Ver detalles
          </button>
          <button
            @click="editAdoption(adoption)"
            class="btn btn-secondary btn-sm"
            :disabled="adoption.estado === 'aprobada'"
          >
            <i class="fas fa-edit"></i> Editar
          </button>
          <button
            @click="deleteAdoption(adoption.id)"
            class="btn btn-danger btn-sm"
            :disabled="adoption.estado === 'aprobada'"
          >
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  loadAdoptions,
  deleteAdoption as removeAdoption,
  adoptionsStats,
  adoptions
} from '@/stores/adoptionsStore'

// Reactive data
const selectedStatus = ref('')
const searchTerm = ref('')
const isLoading = ref(false)

// Computed properties
const stats = computed(() => adoptionsStats.value)

const filteredAdoptions = computed(() => {
  let filtered = adoptions.value

  // Filter by status
  if (selectedStatus.value) {
    filtered = filtered.filter(adoption => adoption.estado === selectedStatus.value)
  }

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(adoption =>
      adoption.nombre_espacio.toLowerCase().includes(term) ||
      adoption.ubicacion_espacio.toLowerCase().includes(term)
    )
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Methods
async function loadUserAdoptions() {
  isLoading.value = true
  try {
    await loadAdoptions()
  } catch (error) {
    console.error('Error al cargar adopciones:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteAdoption(id) {
  if (confirm('¿Estás seguro de que quieres eliminar esta adopción?')) {
    isLoading.value = true
    try {
      const result = await removeAdoption(id)
      if (result.success) {
        alert('Adopción eliminada exitosamente')
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error al eliminar adopción:', error)
      alert('Error al eliminar la adopción')
    } finally {
      isLoading.value = false
    }
  }
}

function viewDetails(adoption) {
  // Implementar modal o página de detalles
  const details = `
    Espacio: ${adoption.nombre_espacio}
    Ubicación: ${adoption.ubicacion_espacio}
    Descripción: ${adoption.descripcion}
    Actividades: ${adoption.actividades.join(', ')}
    Frecuencia: ${getFrequencyText(adoption.frecuencia)}
    Voluntarios: ${adoption.num_voluntarios}
    Estado: ${getStatusText(adoption.estado)}
    Creado: ${formatDate(adoption.created_at)}
  `
  alert(details)
}

function editAdoption(adoption) {
  // Implementar edición
  alert(`Editar: ${adoption.nombre_espacio}`)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStatusText(status) {
  const statusTexts = {
    'pendiente': 'Pendiente',
    'aprobada': 'Aprobada',
    'rechazada': 'Rechazada'
  }
  return statusTexts[status] || status
}

function getFrequencyText(frequency) {
  const frequencyTexts = {
    'weekly': 'Semanal',
    'biweekly': 'Quincenal',
    'monthly': 'Mensual',
    'quarterly': 'Trimestral',
    'punctual': 'Evento único'
  }
  return frequencyTexts[frequency] || frequency
}

// Lifecycle
onMounted(() => {
  loadUserAdoptions()
})
</script>

<style scoped>
.adoptions-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #2E8B57;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3CB371;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #2E8B57;
  color: #2E8B57;
}

.btn-outline:hover {
  background-color: #2E8B57;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card.pending {
  border-left: 4px solid #ffc107;
}

.stat-card.approved {
  border-left: 4px solid #28a745;
}

.stat-card.rejected {
  border-left: 4px solid #dc3545;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #2E8B57;
}

.stat-info p {
  margin: 0;
  color: #666;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  flex: 1;
}

.adoptions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.adoption-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.adoption-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.adoption-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2E8B57;
}

.adoption-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.aprobada {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rechazada {
  background-color: #f8d7da;
  color: #721c24;
}

.adoption-details {
  margin-bottom: 1rem;
}

.detail-item {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.adoption-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .adoptions-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .adoption-header {
    flex-direction: column;
    gap: 1rem;
  }

  .adoption-actions {
    justify-content: center;
  }
}
</style>

<template>
  <div class="my-adoptions-list-view">
    <h2 class="adoptions-title">
      <i class="fas fa-seedling"></i> Mis Adopciones
    </h2>
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando adopciones...</p>
    </div>
    <div v-else-if="adoptions.length === 0" class="empty-state">
      <div class="empty-icon">🌱</div>
      <h3>No tienes adopciones aún</h3>
      <p>Comienza a cuidar tu comunidad adoptando un espacio público</p>
    </div>
    <div v-else class="adoptions-list">
      <div v-for="adoption in adoptions" :key="adoption.id" class="adoption-card">
        <div class="adoption-header">
          <h3>{{ adoption.nombre_espacio }}</h3>
          <span class="status-badge" :class="adoption.status">{{ getStatusText(adoption.status) }}</span>
        </div>
        <div class="adoption-details">
          <p><strong>Ubicación:</strong> {{ adoption.ubicacion_espacio }}</p>
          <p><strong>Descripción:</strong> {{ adoption.descripcion }}</p>
          <p><strong>Voluntarios:</strong> {{ adoption.num_voluntarios }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(adoption.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { adoptions, loading, loadAdoptions } from '@/stores/adoptionsStore.js'

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
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'rejected': 'Rechazada'
  }
  return statusTexts[status] || status
}
onMounted(() => {
  loadAdoptions()
})
</script>

<style scoped>
.my-adoptions-list-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}
.adoptions-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-green, #16a085);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2rem;
}
.adoptions-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.adoption-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.adoption-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.status-badge {
  padding: 0.3rem 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
}
.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}
.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}
.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}
.loading-state {
  text-align: center;
  padding: 2rem;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-top: 3px solid var(--primary-green, #16a085);
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
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>

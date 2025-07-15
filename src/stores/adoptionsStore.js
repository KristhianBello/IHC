import { ref, computed } from 'vue'

// Estado global para las adopciones
const adoptions = ref([])

// Función para agregar una nueva adopción
export function addAdoption(adoption) {
  const newAdoption = {
    id: Date.now(), // ID único basado en timestamp
    ...adoption,
    status: 'pendiente', // Estados: pendiente, aprobada, rechazada
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  adoptions.value.push(newAdoption)
  
  // Guardar en localStorage para persistencia
  localStorage.setItem('adoptions', JSON.stringify(adoptions.value))
  
  return newAdoption
}

// Función para obtener todas las adopciones
export function getAdoptions() {
  return adoptions.value
}

// Función para obtener adopciones por usuario
export function getAdoptionsByUser(userEmail) {
  return adoptions.value.filter(adoption => adoption.email === userEmail)
}

// Función para obtener adopción por ID
export function getAdoptionById(id) {
  return adoptions.value.find(adoption => adoption.id === id)
}

// Función para actualizar el estado de una adopción
export function updateAdoptionStatus(id, newStatus) {
  const adoption = adoptions.value.find(a => a.id === id)
  if (adoption) {
    adoption.status = newStatus
    adoption.updatedAt = new Date().toISOString()
    localStorage.setItem('adoptions', JSON.stringify(adoptions.value))
    return adoption
  }
  return null
}

// Función para eliminar una adopción
export function deleteAdoption(id) {
  const index = adoptions.value.findIndex(a => a.id === id)
  if (index > -1) {
    const deleted = adoptions.value.splice(index, 1)[0]
    localStorage.setItem('adoptions', JSON.stringify(adoptions.value))
    return deleted
  }
  return null
}

// Computed properties para estadísticas
export const adoptionsStats = computed(() => {
  const total = adoptions.value.length
  const pending = adoptions.value.filter(a => a.status === 'pendiente').length
  const approved = adoptions.value.filter(a => a.status === 'aprobada').length
  const rejected = adoptions.value.filter(a => a.status === 'rechazada').length
  
  return {
    total,
    pending,
    approved,
    rejected
  }
})

// Función para inicializar el store (cargar desde localStorage)
export function initializeAdoptionsStore() {
  try {
    const savedAdoptions = localStorage.getItem('adoptions')
    if (savedAdoptions) {
      adoptions.value = JSON.parse(savedAdoptions)
    }
  } catch (error) {
    console.error('Error loading adoptions from localStorage:', error)
    adoptions.value = []
  }
}

// Función para limpiar todas las adopciones (solo para desarrollo)
export function clearAllAdoptions() {
  adoptions.value = []
  localStorage.removeItem('adoptions')
}

// Función para exportar datos (para respaldo)
export function exportAdoptions() {
  return {
    adoptions: adoptions.value,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }
}

// Función para importar datos (para restaurar respaldo)
export function importAdoptions(data) {
  if (data && data.adoptions && Array.isArray(data.adoptions)) {
    adoptions.value = data.adoptions
    localStorage.setItem('adoptions', JSON.stringify(adoptions.value))
    return true
  }
  return false
}

// Inicializar automáticamente al importar el módulo
initializeAdoptionsStore()

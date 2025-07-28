import { ref, computed } from 'vue'
import {
  addAdoption as saveAdoption,
  getAdoptions as fetchAdoptions,
  deleteAdoption as removeAdoption
} from '@/lib/supabaseClient'

// Estado global para las adopciones
const adoptions = ref([])
const loading = ref(false)

// Función para agregar una nueva adopción
export async function addAdoption(adoption) {
  loading.value = true

  try {
    // Usar la función simulada de guardado
    const result = await saveAdoption(adoption)

    if (result.success) {
      // Agregar la nueva adopción al estado local
      adoptions.value.push(result.adoption)
      return result
    } else {
      throw new Error(result.error || 'Error al guardar adopción')
    }
  } catch (error) {
    console.error('Error al agregar adopción:', error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    loading.value = false
  }
}

// Función para cargar adopciones
export async function loadAdoptions() {
  loading.value = true

  try {
    const result = await fetchAdoptions()

    if (result.success) {
      adoptions.value = result.adoptions
      return result
    } else {
      throw new Error(result.error || 'Error al cargar adopciones')
    }
  } catch (error) {
    console.error('Error al cargar adopciones:', error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    loading.value = false
  }
}

// Función para eliminar una adopción
export async function deleteAdoption(adoptionId) {
  loading.value = true

  try {
    // Usar la función simulada de eliminación
    const result = await removeAdoption(adoptionId)

    if (result.success) {
      // Actualizar el estado local
      adoptions.value = adoptions.value.filter(a => a.id !== adoptionId)
      return result
    } else {
      throw new Error(result.error || 'Error al eliminar adopción')
    }

  } catch (error) {
    console.error('Error al eliminar adopción:', error)
    return {
      success: false,
      error: error.message || 'Error al eliminar la adopción'
    }
  } finally {
    loading.value = false
  }
}

// Computed para estadísticas
export const adoptionsStats = computed(() => {
  const total = adoptions.value.length
  const approved = adoptions.value.filter(a => a.status === 'approved').length
  const pending = adoptions.value.filter(a => a.status === 'pending').length
  const rejected = adoptions.value.filter(a => a.status === 'rejected').length

  return {
    total,
    approved,
    pending,
    rejected
  }
})

// Computed para obtener adopciones filtradas
export const userAdoptions = computed(() => {
  return adoptions.value.filter(adoption => adoption.status === 'approved')
})

export const pendingAdoptions = computed(() => {
  return adoptions.value.filter(adoption => adoption.status === 'pending')
})

// Exportar estado reactivo
export { adoptions, loading }

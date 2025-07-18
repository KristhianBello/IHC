import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estado global para las adopciones
const adoptions = ref([])
const loading = ref(false)

// Función para agregar una nueva adopción
export async function addAdoption(adoption) {
  loading.value = true

  try {
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const newAdoption = {
      usuario_id: user.id,
      nombre_espacio: adoption.spaceName,
      ubicacion_espacio: adoption.spaceLocation,
      descripcion: adoption.description,
      actividades: adoption.activities || [],
      frecuencia: adoption.frequency,
      num_voluntarios: parseInt(adoption.volunteers),
      coordenadas: adoption.location ? {
        lat: adoption.location.lat,
        lng: adoption.location.lng
      } : null,
      estado: 'pendiente'
    }

    const { data, error } = await supabase
      .from('adopciones')
      .insert([newAdoption])
      .select()

    if (error) throw error

    // Actualizar el estado local
    await loadAdoptions()

    return {
      success: true,
      adoption: data[0],
      message: 'Adopción creada exitosamente'
    }
  } catch (error) {
    console.error('Error al crear adopción:', error)
    return {
      success: false,
      error: error.message || 'Error al crear la adopción'
    }
  } finally {
    loading.value = false
  }
}

// Función para obtener todas las adopciones del usuario actual
export async function loadAdoptions() {
  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      adoptions.value = []
      return { success: true, adoptions: [] }
    }

    const { data, error } = await supabase
      .from('adopciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    adoptions.value = data || []

    return {
      success: true,
      adoptions: adoptions.value
    }
  } catch (error) {
    console.error('Error al cargar adopciones:', error)
    return {
      success: false,
      error: error.message || 'Error al cargar las adopciones'
    }
  } finally {
    loading.value = false
  }
}

// Función para obtener todas las adopciones (solo las locales)
export function getAdoptions() {
  return adoptions.value
}

// Función para obtener adopción por ID
export function getAdoptionById(id) {
  return adoptions.value.find(adoption => adoption.id === id)
}

// Función para actualizar el estado de una adopción
export async function updateAdoptionStatus(id, newStatus) {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('adopciones')
      .update({
        estado: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    // Actualizar el estado local
    await loadAdoptions()

    return {
      success: true,
      adoption: data[0],
      message: 'Estado actualizado exitosamente'
    }
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    return {
      success: false,
      error: error.message || 'Error al actualizar el estado'
    }
  } finally {
    loading.value = false
  }
}

// Función para eliminar una adopción
export async function deleteAdoption(id) {
  loading.value = true

  try {
    const { error } = await supabase
      .from('adopciones')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Actualizar el estado local
    await loadAdoptions()

    return {
      success: true,
      message: 'Adopción eliminada exitosamente'
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

// Función para actualizar una adopción
export async function updateAdoption(id, updatedData) {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('adopciones')
      .update({
        ...updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    // Actualizar el estado local
    await loadAdoptions()

    return {
      success: true,
      adoption: data[0],
      message: 'Adopción actualizada exitosamente'
    }
  } catch (error) {
    console.error('Error al actualizar adopción:', error)
    return {
      success: false,
      error: error.message || 'Error al actualizar la adopción'
    }
  } finally {
    loading.value = false
  }
}

// Computed properties para estadísticas
export const adoptionsStats = computed(() => {
  const total = adoptions.value.length
  const pending = adoptions.value.filter(a => a.estado === 'pendiente').length
  const approved = adoptions.value.filter(a => a.estado === 'aprobada').length
  const rejected = adoptions.value.filter(a => a.estado === 'rechazada').length

  return {
    total,
    pending,
    approved,
    rejected
  }
})

// Función para inicializar el store
export async function initializeAdoptionsStore() {
  await loadAdoptions()
}

// Función para limpiar todas las adopciones locales
export function clearLocalAdoptions() {
  adoptions.value = []
}

// Exportar estados reactivos
export { adoptions, loading }

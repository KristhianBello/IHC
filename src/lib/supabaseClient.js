
import { createClient } from '@supabase/supabase-js'

// Configuración temporal para desarrollo sin Supabase real
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://temp-demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'temp-demo-key'

// Cliente de Supabase (temporal para demo)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Funciones temporales para simular la funcionalidad sin base de datos real
export const addAdoption = async (adoptionData) => {
  console.log('Simulando guardado de adopción:', adoptionData)

  // Simular respuesta exitosa
  return {
    success: true,
    adoption: {
      id: Date.now(),
      ...adoptionData,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  }
}

export const getAdoptions = async () => {
  console.log('Simulando obtención de adopciones')

  // Simular adopciones de ejemplo
  return {
    success: true,
    adoptions: [
      {
        id: 1,
        fullname: 'Ana López',
        spaceName: 'Parque Central',
        status: 'approved',
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        fullname: 'Carlos García',
        spaceName: 'Plaza San Martín',
        status: 'pending',
        created_at: '2025-01-20T14:30:00Z'
      }
    ]
  }
}

export const addReport = async (reportData) => {
  console.log('Simulando guardado de reporte:', reportData)

  return {
    success: true,
    report: {
      id: Date.now(),
      ...reportData,
      status: 'received',
      created_at: new Date().toISOString()
    }
  }
}

export const addTask = async (taskData) => {
  console.log('Simulando guardado de tarea:', taskData)

  return {
    success: true,
    task: {
      id: Date.now(),
      ...taskData,
      status: 'scheduled',
      created_at: new Date().toISOString()
    }
  }
}

export const updateUserProfile = async (profileData) => {
  console.log('Simulando actualización de perfil:', profileData)

  return {
    success: true,
    profile: {
      id: Date.now(),
      ...profileData,
      updated_at: new Date().toISOString()
    }
  }
}

export const deleteAdoption = async (adoptionId) => {
  console.log('Simulando eliminación de adopción:', adoptionId)

  return {
    success: true,
    message: 'Adopción eliminada exitosamente'
  }
}

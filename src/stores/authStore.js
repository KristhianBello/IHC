import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estado global de autenticación
const user = ref(null)
const loading = ref(false)

// Función para registrar un nuevo usuario
export async function registerUser(userData) {
  loading.value = true
  
  try {
    const { email, password, nombre } = userData
    
    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: nombre,
        }
      }
    })

    if (authError) {
      throw authError
    }

    // Si el registro es exitoso, también guardar en tabla personalizada (opcional)
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            email: email,
            nombre: nombre,
            created_at: new Date().toISOString()
          }
        ])

      // Si hay error en el perfil, no es crítico
      if (profileError) {
        console.warn('Error al crear perfil de usuario:', profileError)
      }

      user.value = authData.user
      return {
        success: true,
        user: authData.user,
        message: 'Usuario registrado exitosamente. Por favor verifica tu email.'
      }
    }
  } catch (error) {
    console.error('Error en registro:', error)
    return {
      success: false,
      error: error.message || 'Error al registrar usuario'
    }
  } finally {
    loading.value = false
  }
}

// Función para iniciar sesión
export async function loginUser(credentials) {
  loading.value = true
  
  try {
    const { email, password } = credentials
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      throw error
    }

    user.value = data.user
    return {
      success: true,
      user: data.user,
      message: 'Inicio de sesión exitoso'
    }
  } catch (error) {
    console.error('Error en login:', error)
    return {
      success: false,
      error: error.message || 'Error al iniciar sesión'
    }
  } finally {
    loading.value = false
  }
}

// Función para cerrar sesión
export async function logoutUser() {
  loading.value = true
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    user.value = null
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return {
      success: false,
      error: error.message || 'Error al cerrar sesión'
    }
  } finally {
    loading.value = false
  }
}

// Función para obtener el usuario actual
export function getCurrentUser() {
  return user.value
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated() {
  return !!user.value
}

// Función para obtener todos los usuarios (solo para admin)
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return {
      success: true,
      users: data
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return {
      success: false,
      error: error.message || 'Error al obtener usuarios'
    }
  }
}

// Función para inicializar el estado de autenticación
export async function initializeAuth() {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
  } catch (error) {
    console.error('Error al inicializar autenticación:', error)
  }
}

// Listener para cambios en el estado de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  user.value = session?.user || null
  
  if (event === 'SIGNED_IN') {
    console.log('Usuario autenticado:', session.user)
  } else if (event === 'SIGNED_OUT') {
    console.log('Usuario cerró sesión')
  }
})

// Exportar estados reactivos
export { user, loading }

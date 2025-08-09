// Script de debugging para verificar conexión a Supabase
import { createClient } from '@supabase/supabase-js'

// Cargar configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Configuración de Supabase:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA')

// Crear cliente
const supabase = createClient(supabaseUrl, supabaseKey)

// Verificar funciones RPC
async function verificarFunciones() {
  try {
    console.log('\n🧪 Verificando funciones RPC...')

    // Intentar llamar a search_users
    const { data, error } = await supabase.rpc('search_users', { search_term: 'test' })

    if (error) {
      console.error('❌ Error al llamar search_users:', error)
    } else {
      console.log('✅ search_users funciona:', data?.length || 0, 'resultados')
    }

    // Verificar send_friend_request
    const { error: friendError } = await supabase.rpc('send_friend_request', {
      addressee_user_id: '00000000-0000-0000-0000-000000000000'
    })

    if (friendError) {
      console.error('❌ Error al llamar send_friend_request:', friendError)
    } else {
      console.log('✅ send_friend_request existe')
    }

  } catch (err) {
    console.error('💥 Error general:', err)
  }
}

// Verificar autenticación
async function verificarAuth() {
  try {
    console.log('\n🔑 Verificando autenticación...')
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Error de autenticación:', error)
    } else if (user) {
      console.log('✅ Usuario autenticado:', user.email)
    } else {
      console.log('⚠️ No hay usuario autenticado')
    }
  } catch (err) {
    console.error('💥 Error verificando auth:', err)
  }
}

export { verificarFunciones, verificarAuth }

// Script de prueba para verificar la conexión con Supabase
// y crear un usuario de prueba si es necesario

import { supabase } from './src/lib/supabaseClient.js'

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...')

  try {
    // Probar la conexión
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Error de conexión:', error.message)
      return false
    }

    console.log('✅ Conexión exitosa con Supabase')
    return true
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

async function createTestUser() {
  console.log('👤 Creando usuario de prueba...')

  const testUser = {
    email: 'usuario@test.com',
    password: '123456',
    nombre: 'Usuario de Prueba'
  }

  try {
    // Registrar usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.nombre,
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️ El usuario de prueba ya existe')
        return true
      }
      throw authError
    }

    console.log('✅ Usuario de prueba creado:', testUser.email)
    console.log('📧 Credenciales de prueba:')
    console.log('   Email:', testUser.email)
    console.log('   Password:', testUser.password)

    return true
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de autenticación...\n')

  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('\n❌ No se pudo conectar con Supabase. Verifica:')
    console.log('1. El archivo .env tiene las credenciales correctas')
    console.log('2. Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
    console.log('3. Que Supabase esté funcionando correctamente')
    return
  }

  await createTestUser()

  console.log('\n🎉 Pruebas completadas')
  console.log('\n📝 Para probar el login:')
  console.log('1. Ve a http://localhost:5174')
  console.log('2. Usa: usuario@test.com / 123456')
  console.log('3. Deberías poder iniciar sesión y ir al foro')
  console.log('4. En el foro, usa el botón "Cerrar sesión" para cerrar sesión')
}

main()

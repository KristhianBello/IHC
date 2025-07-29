// Script simple para crear un usuario de prueba
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import process from 'process'

// Leer variables de entorno del archivo .env
const envContent = fs.readFileSync('.env', 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

console.log('🔍 Configurando Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Configurada ✅' : 'No encontrada ❌')

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})

async function createTestUser() {
  console.log('\n👤 Creando usuario de prueba...')

  const testUser = {
    email: 'demo@gmail.com',
    password: '123456789'
  }

  try {
    // Registrar usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: 'Usuario de Prueba',
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        console.log('ℹ️ El usuario de prueba ya existe')

        // Intentar hacer login para verificar que funciona
        console.log('\n🔐 Probando login...')
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password
        })

        if (loginError) {
          console.error('❌ Error en login:', loginError.message)
        } else {
          console.log('✅ Login exitoso')
          console.log('Usuario:', loginData.user.email)
        }

        return true
      }
      throw authError
    }

    if (authData.user) {
      console.log('✅ Usuario de prueba creado:', testUser.email)
      console.log('📧 Credenciales de prueba:')
      console.log('   Email:', testUser.email)
      console.log('   Password:', testUser.password)
    }

    return true
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de autenticación...\n')

  await createTestUser()

  console.log('\n🎉 Pruebas completadas')
  console.log('\n📝 Para probar el login:')
  console.log('1. Ve a http://localhost:5174')
  console.log('2. Usa: usuario@test.com / 123456')
  console.log('3. Deberías poder iniciar sesión y ir al foro')
}

main().then(() => process.exit(0)).catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

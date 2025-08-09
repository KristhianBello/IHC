import { createClient } from '@supabase/supabase-js'

// Configuración temporal para desarrollo sin Supabase real
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://temp-demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'temp-demo-key'

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,  // Habilita refresh automático de tokens
    persistSession: true     // Mantiene la sesión persistente
  }
})

// ==================== SISTEMA DE AUTENTICACIÓN REAL ====================
// Base de datos simulada de usuarios registrados
const registeredUsers = new Map([
  ['toroj1483@gmail.com', { id: 'user_real_1', email: 'toroj1483@gmail.com', password: 'hola123', username: 'Jesus Montes', isRealUser: true }],
  ['ana@ejemplo.com', { id: 'user_test_1', email: 'ana@ejemplo.com', password: '123456', username: 'Ana López', isRealUser: false }],
  ['carlos@ejemplo.com', { id: 'user_test_2', email: 'carlos@ejemplo.com', password: '123456', username: 'Carlos García', isRealUser: false }]
])

// Usuario actualmente logueado
let currentLoggedUser = null

// Función de registro real
export const signUp = async ({ email, password, userData }) => {
  // Registro real en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) {
    return { data: null, error }
  }
  // Crear perfil en la tabla 'profiles'
  const nombreCompleto = userData?.nombre?.trim() || '';
  const partesNombre = nombreCompleto.split(' ');
  const firstName = partesNombre[0] || userData?.firstName || '';
  const lastName = partesNombre.slice(1).join(' ') || userData?.lastName || '';

  const profileData = {
    first_name: firstName,
    last_name: lastName,
    nombre: nombreCompleto || (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : (userData?.firstName || '')),
    email,
    avatar_url: userData?.avatar || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  await supabase.from('profiles').insert(profileData)
  // Guardar usuario en localStorage
  localStorage.setItem('currentUser', JSON.stringify(data.user))
  localStorage.setItem('isRealUser', 'true')
  return { data, error: null }
}

// Función de login real
export const signInWithPassword = async ({ email, password }) => {
  // Login real en Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    return { data: null, error }
  }
  // Guardar usuario en localStorage
  localStorage.setItem('currentUser', JSON.stringify(data.user))
  localStorage.setItem('isRealUser', 'true')
  return { data, error: null }
}

// Funciones de puente para compatibilidad
export const simulateRegister = async (userData) => {
  return await signUp({
    email: userData.email,
    password: userData.password,
    userData: { nombre: userData.nombre }
  })
}

export const simulateLogin = async (email, password) => {
  return await signInWithPassword({ email, password })
}

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
  try {
    // Buscar el perfil por email
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', profileData.email)
      .single()

    let result
    if (existing && existing.id) {
      // Actualizar perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          birth_date: profileData.birthDate,
          gender: profileData.gender,
          address: profileData.address,
          neighborhood: profileData.neighborhood,
          city: profileData.city,
          emergency_contact: profileData.emergencyContact,
          bio: profileData.bio,
          interests: profileData.interests,
          skills: profileData.skills,
          organization: profileData.organization,
          volunteer_time: profileData.volunteerTime,
          notifications: profileData.notifications,
          privacy: profileData.privacy,
          language: profileData.language,
          theme: profileData.theme,
          avatar_url: profileData.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
      result = { data, error }
    } else {
      // Insertar nuevo perfil
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          birth_date: profileData.birthDate,
          gender: profileData.gender,
          address: profileData.address,
          neighborhood: profileData.neighborhood,
          city: profileData.city,
          emergency_contact: profileData.emergencyContact,
          bio: profileData.bio,
          interests: profileData.interests,
          skills: profileData.skills,
          organization: profileData.organization,
          volunteer_time: profileData.volunteerTime,
          notifications: profileData.notifications,
          privacy: profileData.privacy,
          language: profileData.language,
          theme: profileData.theme,
          avatar_url: profileData.avatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      result = { data, error }
    }
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true, profile: result.data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteAdoption = async (adoptionId) => {
  console.log('Simulando eliminación de adopción:', adoptionId)

  return {
    success: true,
    message: 'Adopción eliminada exitosamente'
  }
}

// ==================== FUNCIONES DEL FORO ====================
// Simulación de almacenamiento de publicaciones en memoria
let postsDatabase = [
  {
    id: 1,
    title: "¡Bienvenidos a EcoVecinos!",
    content: "Este es nuestro foro comunitario donde podemos compartir ideas, reportar problemas y colaborar juntos para mejorar nuestro barrio. ¡Esperamos ver muchas publicaciones interesantes!",
    location: "Centro Comunitario",
    likes_count: 5,
    comments_count: 2,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    author_id: 'admin',
    autor: 'Administrador',
    profiles: {
      username: 'Administrador',
      first_name: 'Admin',
      last_name: 'Sistema',
      avatar_url: null
    }
  },
  {
    id: 2,
    title: "Limpieza del parque central",
    content: "Estamos organizando una jornada de limpieza para el próximo sábado en el parque central. ¡Todos son bienvenidos a participar! Traigan guantes y bolsas de basura.",
    location: "Parque Central",
    likes_count: 8,
    comments_count: 4,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    author_id: 'user_2',
    autor: 'María González',
    profiles: {
      username: 'María González',
      first_name: 'María',
      last_name: 'González',
      avatar_url: null
    }
  }
]

// Simulación de createPost - corregida para usuarios reales
export const createPost = async (postData) => {
  console.log('Simulando createPost:', postData)

  try {
    // Obtener usuario actual
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        data: null,
        error: { message: 'Usuario no autenticado' }
      }
    }

    // Obtener perfil del usuario
    const { data: userProfile } = await getProfile()
    const displayName = userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.first_name || userProfile?.username || currentUser.email.split('@')[0]

    const newPost = {
      id: Date.now(),
      title: postData.titulo,      // Mapear titulo a title
      content: postData.contenido, // Mapear contenido a content
      location: postData.ubicacion, // Mapear ubicacion a location
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      author_id: currentUser.id,
      autor: displayName,
      profiles: {
        username: displayName,
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || '',
        avatar_url: userProfile?.avatar_url || null
      }
    }

    // Agregar al "almacén" de publicaciones
    postsDatabase.unshift(newPost) // Agregar al inicio para mostrar las más recientes primero
    console.log('Nueva publicación agregada. Total de posts:', postsDatabase.length)
    console.log('Post agregado:', newPost)

    // Simular notificación WebSocket
    if (window.WebSocketSimulation) {
      window.WebSocketSimulation.emit('post_created', newPost)
    }

    return {
      data: newPost,
      error: null
    }
  } catch (error) {
    console.error('Error creando publicación:', error)
    return {
      data: null,
      error: { message: 'Error creando publicación' }
    }
  }
}// Simulación de updatePost
export const updatePostAPI = async (postId, postData) => {
  console.log('Actualizando publicación:', postId, postData)

  // Buscar la publicación en el almacén
  const postIndex = postsDatabase.findIndex(post => post.id === postId)
  if (postIndex === -1) {
    return {
      data: null,
      error: { message: 'Publicación no encontrada' }
    }
  }

  const post = postsDatabase[postIndex]

  // Verificar que la publicación pueda editarse (menos de 1 minuto)
  const editTimeLimit = new Date(Date.now() - 60000) // 1 minuto atrás
  const postCreatedAt = new Date(post.created_at)

  if (postCreatedAt < editTimeLimit) {
    return {
      data: null,
      error: { message: 'No puedes editar esta publicación después de 1 minuto' }
    }
  }

  // Actualizar la publicación
  const updatedPost = {
    ...post,
    title: postData.titulo,
    content: postData.contenido,
    location: postData.ubicacion,
    updated_at: new Date().toISOString()
  }

  postsDatabase[postIndex] = updatedPost

  return {
    data: updatedPost,
    error: null
  }
}

// Alias para compatibilidad con Foro.vue
export const updatePost = updatePostAPI;

// Simulación de getCurrentUser - mejorada para usuarios reales
export const getCurrentUser = async () => {
  try {
    // Intentar obtener usuario del localStorage
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      currentLoggedUser = user
      return user
    }
    return null
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }
}

// Simulación de getProfile - mejorada para usuarios reales
export const getProfile = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        data: null,
        error: { message: 'No hay usuario logueado' }
      }
    }

    // Intentar buscar perfil en la tabla profiles de forma segura
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', currentUser.email)
        .single()

      if (profileData && !error) {
        console.log('Perfil encontrado en la base de datos:', profileData)
        return { data: profileData, error: null }
      }
    } catch (dbError) {
      console.warn('No se pudo consultar la tabla profiles, usando datos del usuario:', dbError)
    }

    // Si no hay perfil en la tabla o falla la consulta, crear uno con la información disponible
    const userData = registeredUsers.get(currentUser.email)
    if (userData) {
      const fallbackProfile = {
        id: currentUser.id,
        email: currentUser.email,
        username: userData.username,
        nombre: userData.username,
        first_name: userData.username.split(' ')[0] || userData.username,
        last_name: userData.username.split(' ').slice(1).join(' ') || '',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('Usando perfil de fallback para usuario registrado:', fallbackProfile)
      return { data: fallbackProfile, error: null }
    }

    // Si no está en registeredUsers, usar datos básicos del usuario
    const basicProfile = {
      id: currentUser.id,
      email: currentUser.email,
      username: currentUser.email.split('@')[0], // Usar parte del email como username
      nombre: currentUser.email.split('@')[0],
      first_name: currentUser.email.split('@')[0],
      last_name: '',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return { data: basicProfile, error: null }
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    return {
      data: null,
      error: { message: 'Error obteniendo perfil' }
    }
  }
}

// Simulación de signOut - mejorada
export const signOut = async () => {
  console.log('Cerrando sesión')
  currentLoggedUser = null
  localStorage.removeItem('currentUser')
  localStorage.removeItem('isRealUser')
  return { error: null }
}

// Funciones para publicaciones del foro
export const addPost = async (postData) => {
  console.log('Creando publicación:', postData)

  // Simular guardado en base de datos
  const newPost = {
    id: Date.now(),
    titulo: postData.titulo,
    contenido: postData.contenido,
    ubicacion: postData.ubicacion,
    coordenadas: postData.coordenadas,
    autor_id: 'user_simulado',
    autor: 'Usuario Actual',
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString(),
    can_edit: true, // Puede editar por 1 minuto
    edit_time_limit: new Date(Date.now() + 60000).toISOString() // 1 minuto para editar
  }

  return { data: newPost, error: null }
}

export const getPosts = async () => {
  console.log('=== getPosts llamado ===')
  console.log('Posts en memoria:', postsDatabase.length)
  console.log('Primeros posts:', postsDatabase.slice(0, 2))
  console.log('Todos los posts:', postsDatabase)

  // Retornar las publicaciones almacenadas en memoria
  return {
    data: postsDatabase,
    error: null
  }
}

// Nueva función para obtener posts priorizados (amigos primero)
export const getPrioritizedPosts = async (limit = 10, offset = 0) => {
  try {
    console.log('Obteniendo posts priorizados desde Supabase')

    const { data, error } = await supabase.rpc('get_prioritized_posts', {
      page_limit: limit,
      page_offset: offset
    })

    if (error) {
      console.error('Error al obtener posts priorizados:', error)
      console.log('Usando fallback a posts normales')
      // Fallback a posts normales si hay error
      return getPosts()
    }

    console.log('Posts priorizados obtenidos exitosamente:', data?.length || 0)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error en getPrioritizedPosts:', err)
    console.log('Usando fallback a posts normales debido a excepción')
    // Fallback a posts normales si hay error
    return getPosts()
  }
}

// Función para verificar si se puede enviar solicitud de amistad
export const canSendFriendRequest = async (targetUserId) => {
  try {
    console.log('Verificando si se puede enviar solicitud de amistad a:', targetUserId)

    const { data, error } = await supabase.rpc('can_send_friend_request', {
      target_user_id: targetUserId
    })

    if (error) {
      console.error('Error al verificar solicitud de amistad:', error)
      return { data: false, error }
    }

    return { data: data || false, error: null }
  } catch (err) {
    console.error('Error en canSendFriendRequest:', err)
    return { data: false, error: err }
  }
}

export const deletePost = async (postId) => {
  console.log('Simulando eliminar post:', postId)

  // Eliminar del almacén en memoria
  const index = postsDatabase.findIndex(post => post.id === postId)
  if (index !== -1) {
    postsDatabase.splice(index, 1)
  }

  return { error: null }
}

// Funciones para likes - mejoradas para un like por usuario
const userLikes = new Map() // Simulación de likes por usuario

export const checkUserLike = async (postId, userId = 'user_simulado') => {
  console.log('Verificando like del usuario:', postId, userId)

  const likeKey = `${userId}_${postId}`
  const hasLiked = userLikes.has(likeKey)

  return {
    data: { liked: hasLiked },
    error: null
  }
}

export const toggleLike = async (postId, userId = 'user_simulado') => {
  console.log('Toggle like:', postId, userId)

  const likeKey = `${userId}_${postId}`
  const hasLiked = userLikes.has(likeKey)

  if (hasLiked) {
    // Eliminar like
    userLikes.delete(likeKey)
    return { data: { liked: false }, error: null }
  } else {
    // Agregar like
    userLikes.set(likeKey, true)
    return { data: { liked: true }, error: null }
  }
}

export const getPostLikes = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('user_id, profiles:user_id(username)')
      .eq('post_id', postId)

    if (error) throw error
    return { data, error: null }
  } catch {
    console.log('Simulando obtener likes del post:', postId)
    return { data: [], error: null }
  }
}

// Funciones para comentarios - mejoradas con WebSocket simulation
const commentsStorage = new Map() // Simulación de comentarios
const webSocketSubscribers = new Set() // Lista de suscriptores

// Inicializar comentarios de ejemplo
commentsStorage.set(1, [
  {
    id: 1001,
    post_id: 1,
    content: "¡Excelente iniciativa! ¿Cómo puedo participar?",
    user_id: 'user_test_1',
    parent_id: null,
    autor: 'Ana López',
    profiles: {
      username: 'Ana López',
      first_name: 'Ana',
      last_name: 'López',
      avatar_url: null
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1002,
    post_id: 1,
    content: "Muy buena idea, cuenta conmigo",
    user_id: 'user_test_2',
    parent_id: null,
    autor: 'Carlos García',
    profiles: {
      username: 'Carlos García',
      first_name: 'Carlos',
      last_name: 'García',
      avatar_url: null
    },
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
])

commentsStorage.set(2, [
  {
    id: 2001,
    post_id: 2,
    content: "¿A qué hora empezamos?",
    user_id: 'user_test_1',
    parent_id: null,
    autor: 'Ana López',
    profiles: {
      username: 'Ana López',
      first_name: 'Ana',
      last_name: 'López',
      avatar_url: null
    },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
])

// Función para notificar cambios a suscriptores
const notifyWebSocketSubscribers = (payload) => {
  webSocketSubscribers.forEach(callback => {
    try {
      callback(payload)
    } catch (error) {
      console.error('Error notificando suscriptor:', error)
    }
  })
}

export const addComment = async (commentData) => {
  console.log('Agregando comentario:', commentData)

  try {
    // Obtener usuario actual
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        data: null,
        error: { message: 'Usuario no autenticado' }
      }
    }

    // Obtener perfil del usuario
    const { data: userProfile } = await getProfile()
    const displayName = userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.first_name || userProfile?.username || currentUser.email.split('@')[0]

    const newComment = {
      id: Date.now(),
      post_id: commentData.post_id,
      content: commentData.content,
      user_id: currentUser.id,
      parent_id: commentData.parent_id || null,
      autor: displayName,
      profiles: {
        username: displayName,
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || '',
        avatar_url: userProfile?.avatar_url || null
      },
      created_at: new Date().toISOString()
    }

    // Almacenar en simulación
    const postComments = commentsStorage.get(commentData.post_id) || []
    postComments.push(newComment)
    commentsStorage.set(commentData.post_id, postComments)

    // Notificar a los suscriptores de WebSocket
    notifyWebSocketSubscribers({
      eventType: 'INSERT',
      table: 'post_comments',
      new: newComment
    })

    return { data: newComment, error: null }
  } catch (error) {
    console.error('Error agregando comentario:', error)
    return {
      data: null,
      error: { message: 'Error agregando comentario' }
    }
  }
}

export const getPostComments = async (postId) => {
  console.log('Obteniendo comentarios del post:', postId)

  const comments = commentsStorage.get(postId) || []
  return { data: comments, error: null }
}

// Función única compatible con Foro.vue - corregida
export const createComment = async (postId, content, parentId = null) => {
  try {
    // Obtener usuario actual
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        data: null,
        error: { message: 'Usuario no autenticado' }
      }
    }

    return await addComment({
      post_id: postId,
      content,
      user_id: currentUser.id,
      parent_id: parentId
    })
  } catch (error) {
    console.error('Error creando comentario:', error)
    return {
      data: null,
      error: { message: 'Error creando comentario' }
    }
  }
}

// ==================== FUNCIONES DE COMPAÑEROS ====================

export const addCompanion = async (companionId) => {
  try {
    const { data, error } = await supabase
      .from('companions')
      .insert([{
        user_id: 'user_simulado',
        companion_id: companionId,
        status: 'pending'
      }])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch {
    console.log('Simulando agregar compañero:', companionId)
    return { data: { id: Date.now(), companion_id: companionId, status: 'pending' }, error: null }
  }
}

export const getCompanionsOld = async (userId = 'user_simulado') => {
  try {
    const { data, error } = await supabase
      .from('companions')
      .select(`
        *,
        companion_profile:companion_id (username, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')

    if (error) throw error
    return { data, error: null }
  } catch {
    console.log('Simulando obtener compañeros')
    return {
      data: [
        {
          id: 1,
          companion_id: 'user_2',
          companion_name: 'Carlos Mendoza',
          status: 'accepted'
        },
        {
          id: 2,
          companion_id: 'user_3',
          companion_name: 'Ana López',
          status: 'accepted'
        }
      ],
      error: null
    }
  }
}

export const sharePostWithCompanions = async (postId, companionIds, message = '') => {
  try {
    const shares = companionIds.map(companionId => ({
      post_id: postId,
      shared_by: 'user_simulado',
      shared_with: companionId,
      message: message,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('post_shares')
      .insert(shares)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch {
    console.log('Simulando compartir post:', postId, 'con compañeros:', companionIds)
    return { data: companionIds.map(id => ({ shared_with: id })), error: null }
  }
}

// ==================== WEBSOCKETS ====================

export const subscribeToPostUpdates = (callback) => {
  console.log('Suscribiendo a actualizaciones en tiempo real')

  // Agregar callback a la lista de suscriptores
  webSocketSubscribers.add(callback)

  // Simular actualizaciones periódicas ocasionales
  const interval = setInterval(() => {
    if (Math.random() > 0.95) { // 5% de probabilidad cada 10 segundos
      const mockUpdate = {
        eventType: 'INSERT',
        table: 'posts',
        new: {
          id: Date.now(),
          titulo: 'Nueva publicación en tiempo real',
          contenido: 'Esta es una publicación simulada que aparece en tiempo real',
          autor: 'Usuario Simulado',
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString()
        }
      }
      callback(mockUpdate)
    }
  }, 10000) // Cada 10 segundos

  return {
    unsubscribe: () => {
      clearInterval(interval)
      webSocketSubscribers.delete(callback)
    }
  }
}

// Funciones de compañeros - ACTUALIZADO para sistema completo
export const sendCompanionRequest = async (userId) => {
  console.log('Redirigiendo a nueva función sendFriendRequest:', userId)
  return await sendFriendRequest(userId)
}

export const removeCompanion = async (companionId) => {
  console.log('Redirigiendo a nueva función removeFriend:', companionId)
  return await removeFriend(companionId)
}

// ==================== SISTEMA DE AMIGOS/COMPAÑEROS ====================

// Buscar usuarios por nombre o email
export const searchUsers = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .rpc('search_users', { search_term: searchTerm })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error buscando usuarios:', error)
    return { data: null, error }
  }
}

// Obtener perfil público de un usuario
export const getPublicProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_public_profile', { user_id: userId })

    if (error) throw error

    if (data.error) {
      return { data: null, error: { message: data.error } }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo perfil público:', error)
    return { data: null, error }
  }
}

// Enviar solicitud de amistad
export const sendFriendRequest = async (addresseeId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .rpc('send_friend_request', { addressee_user_id: addresseeId })

    if (error) throw error

    if (data.error) {
      return { data: null, error: { message: data.error } }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error enviando solicitud de amistad:', error)
    return { data: null, error }
  }
}

// Responder a solicitud de amistad
export const respondToFriendRequest = async (friendshipId, response) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    // Actualizar estado de la amistad
    const { data, error } = await supabase
      .from('user_friendships')
      .update({
        status: response, // 'accepted', 'rejected', 'blocked'
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .eq('addressee_id', currentUser.id) // Solo el destinatario puede responder
      .select()
      .single()

    if (error) throw error

    // Crear notificación para el solicitante
    await supabase
      .from('friendship_notifications')
      .insert({
        user_id: data.requester_id,
        friendship_id: friendshipId,
        type: response === 'accepted' ? 'friend_accepted' : 'friend_rejected'
      })

    return { data, error: null }
  } catch (error) {
    console.error('Error respondiendo solicitud de amistad:', error)
    return { data: null, error }
  }
}

// Obtener solicitudes de amistad pendientes
export const getPendingFriendRequests = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('user_friendships')
      .select(`
        *,
        requester:profiles!user_friendships_requester_id_fkey(id, nombre, first_name, last_name, avatar_url)
      `)
      .eq('addressee_id', currentUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo solicitudes pendientes:', error)
    return { data: null, error }
  }
}

// Obtener lista de amigos
export const getFriends = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    // Usar la nueva función de compañerismo
    const { data, error } = await supabase
      .rpc('get_current_companions')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo compañeros:', error)
    return { data: null, error }
  }
}

// Obtener estado de amistad entre dos usuarios
export const getFriendshipStatus = async (otherUserId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { data: 'none', error: null }

    const { data, error } = await supabase
      .rpc('get_friendship_status', { other_user_id: otherUserId })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo estado de amistad:', error)
    return { data: 'none', error }
  }
}

// Eliminar amistad
export const removeFriend = async (friendshipId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .rpc('remove_friendship', { friendship_id: friendshipId })

    if (error) throw error

    if (data.error) {
      return { data: null, error: { message: data.error } }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error eliminando amistad:', error)
    return { data: null, error }
  }
}

// Bloquear usuario
export const blockUser = async (userId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    // Buscar relación existente
    const { data: existing } = await supabase
      .from('user_friendships')
      .select('*')
      .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUser.id})`)
      .single()

    if (existing) {
      // Actualizar a bloqueado
      const { error } = await supabase
        .from('user_friendships')
        .update({ status: 'blocked' })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Crear nueva relación de bloqueo
      const { error } = await supabase
        .from('user_friendships')
        .insert({
          requester_id: currentUser.id,
          addressee_id: userId,
          status: 'blocked'
        })

      if (error) throw error
    }

    return { data: { success: true }, error: null }
  } catch (error) {
    console.error('Error bloqueando usuario:', error)
    return { data: null, error }
  }
}

// Obtener notificaciones de amistad
export const getFriendshipNotifications = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('friendship_notifications')
      .select(`
        *,
        friendship:user_friendships(
          *,
          requester:profiles!user_friendships_requester_id_fkey(id, nombre, first_name, last_name, avatar_url),
          addressee:profiles!user_friendships_addressee_id_fkey(id, nombre, first_name, last_name, avatar_url)
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error)
    return { data: null, error }
  }
}

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('friendship_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
    return { data: { success: true }, error: null }
  } catch (error) {
    console.error('Error marcando notificación como leída:', error)
    return { data: null, error }
  }
}

// Configurar privacidad del perfil
export const updateProfilePrivacy = async (privacySettings) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('profile_privacy_settings')
      .upsert({
        user_id: currentUser.id,
        ...privacySettings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando configuración de privacidad:', error)
    return { data: null, error }
  }
}

// Obtener configuración de privacidad
export const getProfilePrivacy = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('profile_privacy_settings')
      .select('*')
      .eq('user_id', currentUser.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found

    // Si no existe configuración, devolver valores por defecto
    if (!data) {
      const defaultSettings = {
        profile_visibility: 'public',
        show_email: false,
        show_phone: false,
        show_address: false,
        show_interests: true,
        show_skills: true,
        show_bio: true,
        allow_friend_requests: true
      }
      return { data: defaultSettings, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo configuración de privacidad:', error)
    return { data: null, error }
  }
}

// ==================== FUNCIONES DE COMPAÑERISMO ====================
// Nuevas funciones que reemplazan las de amistad (friendship) por compañerismo (companionship)

// Verificar si se puede enviar solicitud de compañerismo
export const canSendCompanionshipRequest = async (targetUserId) => {
  try {
    console.log('Verificando si se puede enviar solicitud de compañerismo a:', targetUserId)

    const { data, error } = await supabase.rpc('can_send_companionship_request', {
      target_user_id: targetUserId
    })

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error('Error en canSendCompanionshipRequest:', err)
    console.log('Usando fallback a verificación básica')
    // Fallback básico
    return { data: { can_send: true }, error: null }
  }
}

// Enviar solicitud de compañerismo
export const sendCompanionshipRequest = async (addresseeId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    // Intentar usar la función RPC primero
    const { data, error } = await supabase
      .rpc('send_companionship_request', { target_user_id: addresseeId })

    if (error) {
      console.warn('RPC send_companionship_request no encontrada, usando fallback:', error)

      // Verificar que no sea el mismo usuario
      if (currentUser.id === addresseeId) {
        throw new Error('No puedes enviarte una solicitud a ti mismo')
      }

      // Verificar si ya existe una relación
      const { data: existing } = await supabase
        .from('user_companionships')
        .select('*')
        .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${currentUser.id})`)
        .single()

      if (existing) {
        throw new Error('Ya existe una relación de compañerismo')
      }

      // Crear nueva solicitud
      const { data: newRequest, error: insertError } = await supabase
        .from('user_companionships')
        .insert({
          requester_id: currentUser.id,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Crear notificaciones (si la tabla existe)
      try {
        await supabase
          .from('companionship_notifications')
          .insert([
            {
              user_id: currentUser.id,
              companionship_id: newRequest.id,
              type: 'request_sent'
            },
            {
              user_id: addresseeId,
              companionship_id: newRequest.id,
              type: 'request_received'
            }
          ])
      } catch (notifError) {
        console.warn('No se pudieron crear notificaciones:', notifError)
      }

      return { data: { success: true, companionship: newRequest }, error: null }
    }

    if (data.error) {
      return { data: null, error: { message: data.error } }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error enviando solicitud de compañerismo:', error)
    return { data: null, error }
  }
}

// Responder a solicitud de compañerismo
export const respondToCompanionshipRequest = async (companionshipId, response) => {
  try {
    // Intentar usar la función RPC primero
    const { data, error } = await supabase
      .rpc('respond_to_companionship_request', {
        companionship_id: companionshipId,
        response: response
      })

    if (error) {
      console.warn('RPC respond_to_companionship_request no encontrada, usando fallback:', error)

      const currentUser = await getCurrentUser()
      if (!currentUser) throw new Error('Usuario no autenticado')

      // Validar respuesta
      if (!['accepted', 'rejected'].includes(response)) {
        throw new Error('Respuesta inválida')
      }

      // Obtener la solicitud
      const { data: companionship, error: fetchError } = await supabase
        .from('user_companionships')
        .select('*')
        .eq('id', companionshipId)
        .eq('addressee_id', currentUser.id)
        .eq('status', 'pending')
        .single()

      if (fetchError || !companionship) {
        throw new Error('Solicitud no encontrada o no tienes permisos')
      }

      // Actualizar el estado
      const { error: updateError } = await supabase
        .from('user_companionships')
        .update({
          status: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', companionshipId)

      if (updateError) throw updateError

      // Crear notificación (si la tabla existe)
      try {
        const notificationType = response === 'accepted' ? 'request_accepted' : 'request_rejected'
        await supabase
          .from('companionship_notifications')
          .insert({
            user_id: companionship.requester_id,
            companionship_id: companionshipId,
            type: notificationType
          })
      } catch (notifError) {
        console.warn('No se pudo crear notificación:', notifError)
      }

      return { data: { success: true, status: response }, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error respondiendo solicitud de compañerismo:', error)
    return { data: null, error }
  }
}

// Obtener solicitudes de compañerismo pendientes
export const getPendingCompanionshipRequests = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    // Intentar usar la función RPC primero
    const { data, error } = await supabase.rpc('get_pending_companionship_requests')

    if (error) {
      console.warn('RPC get_pending_companionship_requests no encontrada, usando fallback:', error)

      // Fallback: consultar directamente la tabla
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_companionships')
        .select(`
          id,
          requester_id,
          created_at,
          requester:profiles!requester_id(id, nombre, first_name, email, avatar_url)
        `)
        .eq('addressee_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (fallbackError) throw fallbackError

      // Transformar los datos al formato esperado
      const transformedData = fallbackData?.map(req => ({
        id: req.id,
        requester_id: req.requester_id,
        created_at: req.created_at,
        requester_name: req.requester?.nombre || req.requester?.first_name || req.requester?.email || 'Usuario',
        requester_email: req.requester?.email,
        requester_avatar_url: req.requester?.avatar_url
      })) || []

      return { data: transformedData, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo solicitudes pendientes de compañerismo:', error)
    return { data: null, error }
  }
}

// Obtener lista de compañeros
export const getCompanions = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    // Intentar usar la función RPC primero
    const { data, error } = await supabase.rpc('get_current_companions')

    if (error) {
      console.warn('RPC get_current_companions no encontrada, usando fallback con tabla:', error)

      // Fallback: consultar directamente la tabla
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_companionships')
        .select(`
          id,
          requester_id,
          addressee_id,
          created_at,
          requester:profiles!requester_id(id, nombre, first_name, email, avatar_url),
          addressee:profiles!addressee_id(id, nombre, first_name, email, avatar_url)
        `)
        .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

      if (fallbackError) throw fallbackError

      // Transformar los datos al formato esperado
      const transformedData = fallbackData?.map(comp => ({
        companion_id: comp.requester_id === currentUser.id ? comp.addressee_id : comp.requester_id,
        companion_name: comp.requester_id === currentUser.id
          ? (comp.addressee?.nombre || comp.addressee?.first_name || comp.addressee?.email || 'Usuario')
          : (comp.requester?.nombre || comp.requester?.first_name || comp.requester?.email || 'Usuario'),
        companion_email: comp.requester_id === currentUser.id ? comp.addressee?.email : comp.requester?.email,
        companion_avatar_url: comp.requester_id === currentUser.id ? comp.addressee?.avatar_url : comp.requester?.avatar_url,
        companionship_date: comp.created_at
      })) || []

      return { data: transformedData, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo compañeros:', error)
    return { data: null, error }
  }
}

// Obtener estado de compañerismo entre dos usuarios
export const getCompanionshipStatus = async (otherUserId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { data: 'none', error: null }

    const { data, error } = await supabase.rpc('can_send_companionship_request', {
      target_user_id: otherUserId
    })

    if (error) throw error

    if (data.can_send) {
      return { data: 'none', error: null }
    } else {
      return { data: data.status || 'unknown', error: null }
    }
  } catch (error) {
    console.error('Error obteniendo estado de compañerismo:', error)
    return { data: 'none', error }
  }
}

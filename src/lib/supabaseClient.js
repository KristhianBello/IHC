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
  console.log('Simulando registro:', { nombre: userData?.nombre, email, password })
  
  // Verificar si el usuario ya existe
  if (registeredUsers.has(email)) {
    return {
      data: null,
      error: { message: 'El usuario ya existe' }
    }
  }
  
  // Crear nuevo usuario
  const newUser = {
    id: `user_real_${Date.now()}`,
    email,
    password,
    username: userData?.nombre || 'Usuario',
    isRealUser: true
  }
  
  registeredUsers.set(email, newUser)
  currentLoggedUser = newUser
  
  // Guardar en localStorage para persistencia
  localStorage.setItem('currentUser', JSON.stringify(newUser))
  localStorage.setItem('isRealUser', 'true')
  
  return {
    data: { user: newUser },
    error: null
  }
}

// Función de login real
export const signInWithPassword = async ({ email, password }) => {
  console.log('Simulando login:', email, password)
  
  const user = registeredUsers.get(email)
  
  if (!user || user.password !== password) {
    return {
      data: null,
      error: { message: 'Credenciales incorrectas' }
    }
  }
  
  currentLoggedUser = user
  
  // Guardar en localStorage para persistencia
  localStorage.setItem('currentUser', JSON.stringify(user))
  localStorage.setItem('isRealUser', user.isRealUser ? 'true' : 'false')
  
  return {
    data: { user },
    error: null
  }
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

    const newPost = {
      id: Date.now(),
      title: postData.titulo,      // Mapear titulo a title
      content: postData.contenido, // Mapear contenido a content
      location: postData.ubicacion, // Mapear ubicacion a location
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      author_id: currentUser.id,
      autor: currentUser.username,
      profiles: {
        username: currentUser.username,
        avatar_url: null
      }
    }

    // Agregar al "almacén" de publicaciones
    postsDatabase.unshift(newPost) // Agregar al inicio para mostrar las más recientes primero

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
export const getProfile = async (userId = null) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        data: null,
        error: { message: 'No hay usuario logueado' }
      }
    }
    
    return {
      data: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        avatar_url: '',
        bio: 'Miembro activo',
        theme: 'light',
        language: 'es',
        isRealUser: currentUser.isRealUser || false,
        updated_at: new Date().toISOString()
      },
      error: null
    }
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
  console.log('Obteniendo publicaciones desde la base de datos')

  // Retornar las publicaciones almacenadas en memoria
  return {
    data: postsDatabase,
    error: null
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

    const newComment = {
      id: Date.now(),
      post_id: commentData.post_id,
      content: commentData.content,
      user_id: currentUser.id,
      parent_id: commentData.parent_id || null,
      autor: currentUser.username,
      profiles: {
        username: currentUser.username,
        avatar_url: null
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

export const getCompanions = async (userId = 'user_simulado') => {
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

// Funciones de compañeros
export const searchUsers = async (searchTerm) => {
  console.log('Simulando búsqueda de usuarios:', searchTerm)

  // Simular usuarios de ejemplo
  const mockUsers = [
    {
      id: 1,
      username: 'ana_lopez',
      full_name: 'Ana López',
      avatar_url: null,
      is_friend: false
    },
    {
      id: 2,
      username: 'carlos_garcia',
      full_name: 'Carlos García',
      avatar_url: null,
      is_friend: false
    },
    {
      id: 3,
      username: 'maria_rodriguez',
      full_name: 'María Rodríguez',
      avatar_url: null,
      is_friend: true
    }
  ]

  // Filtrar por término de búsqueda
  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return {
    data: filteredUsers,
    error: null
  }
}

export const sendCompanionRequest = async (userId) => {
  console.log('Simulando envío de solicitud de compañero:', userId)

  // Simular respuesta exitosa
  return {
    data: {
      id: Date.now(),
      user_id: 'current-user',
      companion_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    },
    error: null
  }
}

export const removeCompanion = async (companionId) => {
  console.log('Simulando eliminación de compañero:', companionId)

  // Simular respuesta exitosa
  return {
    data: { success: true },
    error: null
  }
}

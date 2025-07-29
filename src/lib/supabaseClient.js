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

// ==================== FUNCIONES DEL FORO ====================
// Simulación de createPost
export const createPost = async (postData) => {
  console.log('Simulando createPost:', postData)
  return {
    data: {
      id: Date.now(),
      ...postData,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      autor: postData.autor || 'Usuario Actual'
    },
    error: null
  }
}

// Simulación de updatePost
export const updatePostAPI = async (postId, postData) => {
  console.log('Simulando updatePost:', postId, postData)
  return {
    data: {
      id: postId,
      ...postData,
      updated_at: new Date().toISOString()
    },
    error: null
  }
}

// Alias para compatibilidad con Foro.vue
export const updatePost = updatePostAPI;

// Simulación de getCurrentUser
export const getCurrentUser = async () => {
  return { id: 'user_simulado', username: 'Usuario Actual' }
}

// Simulación de getProfile
export const getProfile = async (userId = 'user_simulado') => {
  return {
    data: {
      id: userId,
      username: 'Usuario Actual',
      avatar_url: '',
      bio: 'Miembro activo',
      theme: 'light',
      language: 'es',
      updated_at: new Date().toISOString()
    },
    error: null
  }
}

// Simulación de signOut
export const signOut = async () => {
  console.log('Simulando signOut')
  return { error: null }
}

// Funciones para publicaciones del foro
export const addPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        titulo: postData.titulo,
        contenido: postData.contenido,
        ubicacion: postData.ubicacion,
        coordenadas: postData.coordenadas,
        autor_id: postData.autor_id || 'user_simulado',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch {
    console.log('Simulando agregar post:', postData)
    return {
      data: {
        id: Date.now(),
        ...postData,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        autor: postData.autor || 'Usuario Actual'
      },
      error: null
    }
  }
}

export const getPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:autor_id (username, avatar_url),
        likes:post_likes (count),
        comments:post_comments (count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch {
    console.log('Simulando obtener posts')
    return {
      data: [
        {
          id: 1,
          titulo: 'Limpieza en el Parque Central',
          contenido: 'Este fin de semana organizamos una jornada de limpieza en el Parque Central. Logramos recoger más de 20 bolsas de basura y podar los arbustos. ¡Gracias a todos los voluntarios!',
          ubicacion: 'Parque Central, Sector Norte',
          coordenadas: { lat: -2.1499, lng: -79.9663 },
          autor_id: 'user_simulado',
          autor: 'María González',
          likes_count: 24,
          comments_count: 3,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      error: null
    }
  }
}

export const deletePost = async (postId) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
    return { error: null }
  } catch {
    console.log('Simulando eliminar post:', postId)
    return { error: null }
  }
}

// Funciones para likes
// Verifica si el usuario ha dado like a un post
export const checkUserLike = async (postId, userId = 'user_simulado') => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { data: { liked: !!data }, error: null }
  } catch {
    // Simulación: aleatorio para demo
    console.log('Simulando checkUserLike:', postId, userId)
    return { data: { liked: Math.random() > 0.5 }, error: null }
  }
}
export const toggleLike = async (postId, userId) => {
  try {
    // Verificar si ya existe el like
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Eliminar like
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) throw error
      return { data: { liked: false }, error: null }
    } else {
      // Agregar like
      const { error } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }])

      if (error) throw error
      return { data: { liked: true }, error: null }
    }
  } catch {
    console.log('Simulando toggle like:', postId, userId)
    return { data: { liked: Math.random() > 0.5 }, error: null }
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

// Funciones para comentarios
// Alias para compatibilidad con Foro.vue
// Función única compatible con Foro.vue
export const createComment = async (postId, content, parentId = null) => {
  // Simulación: el usuario es 'user_simulado'
  return await addComment({ post_id: postId, content, user_id: 'user_simulado', parent_id })
}
export const addComment = async (commentData) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: commentData.post_id,
        content: commentData.content,
        user_id: commentData.user_id || 'user_simulado',
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)

    if (error) throw error
    return { data: data[0], error: null }
  } catch {
    console.log('Simulando agregar comentario:', commentData)
    return {
      data: {
        id: Date.now(),
        ...commentData,
        autor: 'Usuario Actual',
        created_at: new Date().toISOString()
      },
      error: null
    }
  }
}

export const getPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch {
    console.log('Simulando obtener comentarios del post:', postId)
    return {
      data: [
        {
          id: 1,
          content: '¡Excelente trabajo! Me encantaría unirme a la próxima jornada.',
          user_id: 'user_2',
          autor: 'Carlos Mendoza',
          created_at: new Date().toISOString()
        }
      ],
      error: null
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
  try {
    const subscription = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post update:', payload)
          callback(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        (payload) => {
          console.log('Comment update:', payload)
          callback(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        (payload) => {
          console.log('Like update:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  } catch {
    console.log('WebSocket no disponible, usando simulación')
    // Simular actualizaciones cada 30 segundos
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        callback({
          eventType: 'INSERT',
          table: 'posts',
          new: {
            id: Date.now(),
            titulo: 'Nueva publicación simulada',
            contenido: 'Esta es una publicación de prueba en tiempo real',
            autor: 'Usuario Simulado',
            likes_count: 0,
            comments_count: 0,
            created_at: new Date().toISOString()
          }
        })
      }
    }, 30000)

    return {
      unsubscribe: () => clearInterval(interval)
    }
  }
}
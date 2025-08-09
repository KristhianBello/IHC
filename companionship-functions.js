// ==================== FUNCIONES DE COMPAÑERISMO ====================
// Estas funciones reemplazan las funciones de amistad (friendship) por compañerismo (companionship)

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

    const { data, error } = await supabase
      .rpc('send_companionship_request', { target_user_id: addresseeId })

    if (error) throw error

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
    const { data, error } = await supabase
      .rpc('respond_to_companionship_request', {
        companionship_id: companionshipId,
        response: response
      })

    if (error) throw error
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

    const { data, error } = await supabase.rpc('get_pending_companionship_requests')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo solicitudes pendientes:', error)
    return { data: null, error }
  }
}

// Obtener lista de compañeros
export const getCompanions = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase.rpc('get_current_companions')

    if (error) throw error
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

// ==================== FUNCIONES DE COMPATIBILIDAD ====================
// Mantener compatibilidad con código existente que use las funciones de amistad

export const canSendFriendRequest = canSendCompanionshipRequest
export const sendFriendRequest = sendCompanionshipRequest
export const respondToFriendRequest = respondToCompanionshipRequest
export const getPendingFriendRequests = getPendingCompanionshipRequests
export const getFriends = getCompanions
export const getFriendshipStatus = getCompanionshipStatus

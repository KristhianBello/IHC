-- Script para crear SOLO las funciones RPC de compañerismo
-- Las tablas ya existen, solo faltan las funciones
-- Ejecutar en Supabase SQL Editor

-- ============================
-- CREAR FUNCIONES RPC PARA COMPAÑERISMO
-- ============================

-- Función para enviar solicitud de compañerismo
CREATE OR REPLACE FUNCTION send_companionship_request(target_user_id uuid)
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    existing_request record;
    new_companionship record;
BEGIN
    -- Obtener el ID del usuario actual
    current_user_id := auth.uid();
    
    -- Verificar que el usuario esté autenticado
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Usuario no autenticado');
    END IF;
    
    -- No permitir enviarse solicitud a sí mismo
    IF current_user_id = target_user_id THEN
        RETURN json_build_object('success', false, 'error', 'No puedes enviarte una solicitud a ti mismo');
    END IF;
    
    -- Verificar si ya existe una relación
    SELECT * INTO existing_request 
    FROM user_companionships 
    WHERE (requester_id = current_user_id AND addressee_id = target_user_id)
       OR (requester_id = target_user_id AND addressee_id = current_user_id);
    
    IF existing_request.id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'Ya existe una relación de compañerismo');
    END IF;
    
    -- Crear nueva solicitud
    INSERT INTO user_companionships (requester_id, addressee_id, status)
    VALUES (current_user_id, target_user_id, 'pending')
    RETURNING * INTO new_companionship;
    
    -- Crear notificaciones
    INSERT INTO companionship_notifications (user_id, companionship_id, type)
    VALUES 
        (current_user_id, new_companionship.id, 'request_sent'),
        (target_user_id, new_companionship.id, 'request_received');
    
    RETURN json_build_object('success', true, 'companionship', row_to_json(new_companionship));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para responder a solicitud de compañerismo
CREATE OR REPLACE FUNCTION respond_to_companionship_request(companionship_id uuid, response text)
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    companionship record;
    notification_type text;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Usuario no autenticado');
    END IF;
    
    -- Obtener la solicitud
    SELECT * INTO companionship 
    FROM user_companionships 
    WHERE id = companionship_id AND addressee_id = current_user_id AND status = 'pending';
    
    IF companionship.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Solicitud no encontrada o no tienes permisos');
    END IF;
    
    -- Validar respuesta
    IF response NOT IN ('accepted', 'rejected') THEN
        RETURN json_build_object('success', false, 'error', 'Respuesta inválida');
    END IF;
    
    -- Actualizar el estado
    UPDATE user_companionships 
    SET status = response, updated_at = now()
    WHERE id = companionship_id;
    
    -- Crear notificación
    notification_type := CASE 
        WHEN response = 'accepted' THEN 'request_accepted'
        ELSE 'request_rejected'
    END;
    
    INSERT INTO companionship_notifications (user_id, companionship_id, type)
    VALUES (companionship.requester_id, companionship_id, notification_type);
    
    RETURN json_build_object('success', true, 'status', response);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener solicitudes pendientes
CREATE OR REPLACE FUNCTION get_pending_companionship_requests()
RETURNS table(
    id uuid,
    requester_id uuid,
    created_at timestamptz,
    requester_name text,
    requester_email text,
    requester_avatar_url text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uc.id,
        uc.requester_id,
        uc.created_at,
        COALESCE(p.nombre, p.first_name, p.email) as requester_name,
        p.email as requester_email,
        p.avatar_url as requester_avatar_url
    FROM user_companionships uc
    LEFT JOIN profiles p ON p.id = uc.requester_id
    WHERE uc.addressee_id = auth.uid() 
    AND uc.status = 'pending'
    ORDER BY uc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener compañeros actuales
CREATE OR REPLACE FUNCTION get_current_companions()
RETURNS table(
    companion_id uuid,
    companion_name text,
    companion_email text,
    companion_avatar_url text,
    companionship_date timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN uc.requester_id = auth.uid() THEN uc.addressee_id
            ELSE uc.requester_id
        END as companion_id,
        COALESCE(p.nombre, p.first_name, p.email) as companion_name,
        p.email as companion_email,
        p.avatar_url as companion_avatar_url,
        uc.created_at as companionship_date
    FROM user_companionships uc
    LEFT JOIN profiles p ON p.id = CASE 
        WHEN uc.requester_id = auth.uid() THEN uc.addressee_id
        ELSE uc.requester_id
    END
    WHERE (uc.requester_id = auth.uid() OR uc.addressee_id = auth.uid())
    AND uc.status = 'accepted'
    ORDER BY uc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si se puede enviar solicitud
CREATE OR REPLACE FUNCTION can_send_companionship_request(target_user_id uuid)
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    existing_relationship record;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('can_send', false, 'reason', 'not_authenticated');
    END IF;
    
    IF current_user_id = target_user_id THEN
        RETURN json_build_object('can_send', false, 'reason', 'self_request');
    END IF;
    
    -- Verificar si ya existe alguna relación
    SELECT * INTO existing_relationship
    FROM user_companionships
    WHERE (requester_id = current_user_id AND addressee_id = target_user_id)
       OR (requester_id = target_user_id AND addressee_id = current_user_id);
    
    IF existing_relationship.id IS NOT NULL THEN
        RETURN json_build_object('can_send', false, 'reason', 'relationship_exists', 'status', existing_relationship.status);
    END IF;
    
    RETURN json_build_object('can_send', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- VERIFICACIÓN FINAL
-- ============================

SELECT 'Funciones RPC de compañerismo creadas exitosamente' as status;

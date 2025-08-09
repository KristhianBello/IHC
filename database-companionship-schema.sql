-- Script para configurar sistema de compañerismo
-- Ejecutar en Supabase SQL Editor

-- ============================
-- 1. ELIMINAR TABLAS ANTERIORES SI EXISTEN
-- ============================

DROP TABLE IF EXISTS public.user_friendships CASCADE;
DROP TABLE IF EXISTS public.friendship_notifications CASCADE;

-- ============================
-- 2. CREAR TABLA DE COMPAÑERISMO (ANTERIORMENTE FRIENDSHIPS)
-- ============================

CREATE TABLE public.user_companionships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid NOT NULL,
    addressee_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Restricciones
    CONSTRAINT user_companionships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_companionships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT no_self_companionship CHECK (requester_id != addressee_id),
    CONSTRAINT unique_companionship UNIQUE (requester_id, addressee_id)
);

-- ============================
-- 3. CREAR TABLA DE NOTIFICACIONES DE COMPAÑERISMO
-- ============================

CREATE TABLE public.companionship_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    companionship_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN ('request_sent', 'request_received', 'request_accepted', 'request_rejected')),
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Restricciones
    CONSTRAINT companionship_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT companionship_notifications_companionship_id_fkey FOREIGN KEY (companionship_id) REFERENCES public.user_companionships(id) ON DELETE CASCADE
);

-- ============================
-- 4. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================

CREATE INDEX idx_user_companionships_requester_id ON public.user_companionships(requester_id);
CREATE INDEX idx_user_companionships_addressee_id ON public.user_companionships(addressee_id);
CREATE INDEX idx_user_companionships_status ON public.user_companionships(status);
CREATE INDEX idx_companionship_notifications_user_id ON public.companionship_notifications(user_id);
CREATE INDEX idx_companionship_notifications_is_read ON public.companionship_notifications(is_read);

-- ============================
-- 5. HABILITAR RLS (ROW LEVEL SECURITY)
-- ============================

ALTER TABLE public.user_companionships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companionship_notifications ENABLE ROW LEVEL SECURITY;

-- ============================
-- 6. CREAR POLÍTICAS RLS
-- ============================

-- Políticas para user_companionships
CREATE POLICY "Los usuarios pueden ver sus propios compañerismos" ON public.user_companionships
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() = addressee_id
    );

CREATE POLICY "Los usuarios pueden crear solicitudes de compañerismo" ON public.user_companionships
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Los usuarios pueden actualizar compañerismos que los involucran" ON public.user_companionships
    FOR UPDATE USING (
        auth.uid() = requester_id OR 
        auth.uid() = addressee_id
    );

-- Políticas para companionship_notifications
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones" ON public.companionship_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema puede insertar notificaciones" ON public.companionship_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones" ON public.companionship_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================
-- 7. OTORGAR PERMISOS
-- ============================

GRANT ALL ON public.user_companionships TO authenticated;
GRANT ALL ON public.companionship_notifications TO authenticated;
GRANT SELECT ON public.user_companionships TO anon;
GRANT SELECT ON public.companionship_notifications TO anon;

-- ============================
-- 8. CREAR FUNCIONES RPC PARA COMPAÑERISMO
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
-- 9. INSERTAR DATOS DE PRUEBA
-- ============================

-- Insertar algunas solicitudes de prueba si hay usuarios
INSERT INTO user_companionships (requester_id, addressee_id, status)
SELECT 
    'ec2bb77b-0142-4913-ac33-653392d28359'::uuid,
    '19e93939-ee2b-4483-826c-e3999266f805'::uuid,
    'pending'
WHERE EXISTS (
    SELECT 1 FROM profiles WHERE id = 'ec2bb77b-0142-4913-ac33-653392d28359'::uuid
) AND EXISTS (
    SELECT 1 FROM profiles WHERE id = '19e93939-ee2b-4483-826c-e3999266f805'::uuid
)
ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- ============================
-- VERIFICACIÓN FINAL
-- ============================

SELECT 'Tablas de compañerismo creadas exitosamente' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%companion%';

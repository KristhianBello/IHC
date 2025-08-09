-- Funciones RPC para el sistema de amigos/compañeros
-- Ejecutar en Supabase SQL Editor después del schema principal

-- Función para buscar usuarios
CREATE OR REPLACE FUNCTION search_users(search_term text)
RETURNS TABLE (
  id uuid,
  email text,
  nombre text,
  first_name text,
  last_name text,
  username text,
  avatar_url text,
  city text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.nombre,
    p.first_name,
    p.last_name,
    COALESCE(p.nombre, p.first_name || ' ' || p.last_name, p.first_name, p.email) as username,
    p.avatar_url,
    p.city
  FROM public.profiles p
  WHERE 
    p.id != auth.uid() AND (
      LOWER(p.nombre) LIKE LOWER('%' || search_term || '%') OR
      LOWER(p.first_name) LIKE LOWER('%' || search_term || '%') OR
      LOWER(p.last_name) LIKE LOWER('%' || search_term || '%') OR
      LOWER(p.email) LIKE LOWER('%' || search_term || '%')
    )
  LIMIT 20;
END;
$$;

-- Función para obtener amigos del usuario actual
CREATE OR REPLACE FUNCTION get_user_friends()
RETURNS TABLE (
  id uuid,
  email text,
  nombre text,
  first_name text,
  last_name text,
  username text,
  avatar_url text,
  city text,
  friendship_id uuid,
  status text,
  created_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.nombre,
    p.first_name,
    p.last_name,
    COALESCE(p.nombre, p.first_name || ' ' || p.last_name, p.first_name, p.email) as username,
    p.avatar_url,
    p.city,
    uf.id as friendship_id,
    uf.status,
    uf.created_at
  FROM public.user_friendships uf
  JOIN public.profiles p ON (
    CASE 
      WHEN uf.requester_id = auth.uid() THEN p.id = uf.addressee_id
      ELSE p.id = uf.requester_id
    END
  )
  WHERE 
    (uf.requester_id = auth.uid() OR uf.addressee_id = auth.uid()) 
    AND uf.status = 'accepted'
  ORDER BY uf.created_at DESC;
END;
$$;

-- Función para obtener solicitudes de amistad pendientes
CREATE OR REPLACE FUNCTION get_pending_friend_requests()
RETURNS TABLE (
  id uuid,
  friendship_id uuid,
  requester_profile json,
  created_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uf.id,
    uf.id as friendship_id,
    json_build_object(
      'id', p.id,
      'email', p.email,
      'nombre', p.nombre,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'username', COALESCE(p.nombre, p.first_name || ' ' || p.last_name, p.first_name, p.email),
      'avatar_url', p.avatar_url,
      'city', p.city
    ) as requester_profile,
    uf.created_at
  FROM public.user_friendships uf
  JOIN public.profiles p ON p.id = uf.requester_id
  WHERE 
    uf.addressee_id = auth.uid() 
    AND uf.status = 'pending'
  ORDER BY uf.created_at DESC;
END;
$$;

-- Función para enviar solicitud de amistad
CREATE OR REPLACE FUNCTION send_friend_request(addressee_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_friendship public.user_friendships;
  new_friendship_id uuid;
BEGIN
  -- Verificar que no sea el mismo usuario
  IF addressee_user_id = auth.uid() THEN
    RETURN json_build_object('error', 'No puedes enviarte una solicitud a ti mismo');
  END IF;

  -- Verificar si ya existe una relación
  SELECT * INTO existing_friendship
  FROM public.user_friendships 
  WHERE 
    (requester_id = auth.uid() AND addressee_id = addressee_user_id) OR
    (requester_id = addressee_user_id AND addressee_id = auth.uid());

  IF existing_friendship.id IS NOT NULL THEN
    RETURN json_build_object('error', 'Ya existe una relación con este usuario');
  END IF;

  -- Crear nueva solicitud
  INSERT INTO public.user_friendships (requester_id, addressee_id, status)
  VALUES (auth.uid(), addressee_user_id, 'pending')
  RETURNING id INTO new_friendship_id;

  -- Crear notificación
  INSERT INTO public.friendship_notifications (user_id, friendship_id, type)
  VALUES (addressee_user_id, new_friendship_id, 'friend_request');

  RETURN json_build_object('success', true, 'friendship_id', new_friendship_id);
END;
$$;

-- Función para responder a solicitud de amistad
CREATE OR REPLACE FUNCTION respond_to_friend_request(friendship_id uuid, response text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  friendship_record public.user_friendships;
  requester_id uuid;
BEGIN
  -- Verificar que la solicitud existe y el usuario es el destinatario
  SELECT * INTO friendship_record
  FROM public.user_friendships 
  WHERE id = friendship_id AND addressee_id = auth.uid() AND status = 'pending';

  IF friendship_record.id IS NULL THEN
    RETURN json_build_object('error', 'Solicitud no encontrada o no tienes permisos');
  END IF;

  -- Actualizar estado
  UPDATE public.user_friendships 
  SET status = response, updated_at = now()
  WHERE id = friendship_id;

  -- Crear notificación para el solicitante
  INSERT INTO public.friendship_notifications (user_id, friendship_id, type)
  VALUES (friendship_record.requester_id, friendship_id, 
    CASE WHEN response = 'accepted' THEN 'friend_accepted' ELSE 'friend_rejected' END);

  RETURN json_build_object('success', true, 'status', response);
END;
$$;

-- Función para obtener estado de amistad con otro usuario
CREATE OR REPLACE FUNCTION get_friendship_status(other_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  friendship_record public.user_friendships;
BEGIN
  SELECT * INTO friendship_record
  FROM public.user_friendships 
  WHERE 
    (requester_id = auth.uid() AND addressee_id = other_user_id) OR
    (requester_id = other_user_id AND addressee_id = auth.uid());

  IF friendship_record.id IS NULL THEN
    RETURN 'none';
  ELSE
    RETURN friendship_record.status;
  END IF;
END;
$$;

-- Función para eliminar amistad
CREATE OR REPLACE FUNCTION remove_friendship(friendship_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  friendship_record public.user_friendships;
BEGIN
  -- Verificar que la amistad existe y el usuario tiene permisos
  SELECT * INTO friendship_record
  FROM public.user_friendships 
  WHERE id = friendship_id AND (requester_id = auth.uid() OR addressee_id = auth.uid());

  IF friendship_record.id IS NULL THEN
    RETURN json_build_object('error', 'Amistad no encontrada o no tienes permisos');
  END IF;

  -- Eliminar la amistad
  DELETE FROM public.user_friendships WHERE id = friendship_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Función para bloquear usuario
CREATE OR REPLACE FUNCTION block_user(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_friendship public.user_friendships;
BEGIN
  -- Verificar si ya existe una relación
  SELECT * INTO existing_friendship
  FROM public.user_friendships 
  WHERE 
    (requester_id = auth.uid() AND addressee_id = user_id) OR
    (requester_id = user_id AND addressee_id = auth.uid());

  IF existing_friendship.id IS NOT NULL THEN
    -- Actualizar estado a bloqueado
    UPDATE public.user_friendships 
    SET status = 'blocked', updated_at = now()
    WHERE id = existing_friendship.id;
  ELSE
    -- Crear nueva relación bloqueada
    INSERT INTO public.user_friendships (requester_id, addressee_id, status)
    VALUES (auth.uid(), user_id, 'blocked');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Función para obtener perfil público
CREATE OR REPLACE FUNCTION get_public_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record public.profiles;
  privacy_settings public.profile_privacy_settings;
  result json;
BEGIN
  -- Obtener perfil
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id;
  
  IF profile_record.id IS NULL THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  -- Obtener configuración de privacidad
  SELECT * INTO privacy_settings 
  FROM public.profile_privacy_settings 
  WHERE user_id = user_id;

  -- Si no hay configuración de privacidad, usar valores por defecto
  IF privacy_settings.id IS NULL THEN
    privacy_settings.show_profile = true;
    privacy_settings.show_email = false;
    privacy_settings.show_phone = false;
    privacy_settings.show_location = true;
    privacy_settings.show_interests = true;
    privacy_settings.show_skills = true;
  END IF;

  -- Construir respuesta respetando privacidad
  result = json_build_object(
    'id', profile_record.id,
    'nombre', profile_record.nombre,
    'first_name', profile_record.first_name,
    'last_name', profile_record.last_name,
    'username', COALESCE(profile_record.nombre, profile_record.first_name || ' ' || profile_record.last_name, profile_record.first_name, profile_record.email),
    'avatar_url', profile_record.avatar_url,
    'bio', profile_record.bio,
    'organization', profile_record.organization
  );

  -- Agregar campos según configuración de privacidad
  IF privacy_settings.show_email THEN
    result = result || json_build_object('email', profile_record.email);
  END IF;

  IF privacy_settings.show_phone THEN
    result = result || json_build_object('phone', profile_record.phone);
  END IF;

  IF privacy_settings.show_location THEN
    result = result || json_build_object('city', profile_record.city, 'neighborhood', profile_record.neighborhood);
  END IF;

  IF privacy_settings.show_interests THEN
    result = result || json_build_object('interests', profile_record.interests);
  END IF;

  IF privacy_settings.show_skills THEN
    result = result || json_build_object('skills', profile_record.skills);
  END IF;

  RETURN result;
END;
$$;

-- Conceder permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION search_users(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_friend_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION send_friend_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_friend_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friendship_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_friendship(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION block_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_profile(uuid) TO authenticated;

// Script para aplicar las nuevas tablas del sistema de amigos en Supabase
// Ejecutar este código en el SQL Editor de Supabase

import { supabase } from './src/lib/supabaseClient.js'

// Función para ejecutar las migraciones de base de datos
export const runFriendshipMigrations = async () => {
  try {
    console.log('🚀 Iniciando migración del sistema de amigos...')

    // Script SQL para crear las tablas necesarias
    const migrationSQL = `
    -- ===================================
    -- NUEVAS TABLAS PARA SISTEMA DE AMIGOS
    -- ===================================

    -- 1. Tabla para relaciones de amistad
    CREATE TABLE IF NOT EXISTS public.user_friendships (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      requester_id uuid NOT NULL, -- Usuario que envía la solicitud
      addressee_id uuid NOT NULL,  -- Usuario que recibe la solicitud
      status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'blocked'::text])),
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      CONSTRAINT user_friendships_pkey PRIMARY KEY (id),
      CONSTRAINT user_friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE,
      CONSTRAINT user_friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES auth.users(id) ON DELETE CASCADE,
      CONSTRAINT user_friendships_not_self CHECK (requester_id != addressee_id),
      CONSTRAINT user_friendships_unique UNIQUE (requester_id, addressee_id)
    );

    -- 2. Tabla para configuración de privacidad de perfiles
    CREATE TABLE IF NOT EXISTS public.profile_privacy_settings (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      profile_visibility text NOT NULL DEFAULT 'public' CHECK (profile_visibility = ANY (ARRAY['public'::text, 'friends_only'::text, 'private'::text])),
      show_email boolean DEFAULT false,
      show_phone boolean DEFAULT false,
      show_address boolean DEFAULT false,
      show_interests boolean DEFAULT true,
      show_skills boolean DEFAULT true,
      show_bio boolean DEFAULT true,
      allow_friend_requests boolean DEFAULT true,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      CONSTRAINT profile_privacy_settings_pkey PRIMARY KEY (id),
      CONSTRAINT profile_privacy_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
      CONSTRAINT profile_privacy_settings_user_id_unique UNIQUE (user_id)
    );

    -- 3. Tabla para notificaciones de solicitudes de amistad
    CREATE TABLE IF NOT EXISTS public.friendship_notifications (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL, -- Usuario que recibe la notificación
      friendship_id uuid NOT NULL, -- Referencia a la solicitud de amistad
      type text NOT NULL CHECK (type = ANY (ARRAY['friend_request'::text, 'friend_accepted'::text, 'friend_rejected'::text])),
      is_read boolean DEFAULT false,
      created_at timestamp with time zone DEFAULT now(),
      CONSTRAINT friendship_notifications_pkey PRIMARY KEY (id),
      CONSTRAINT friendship_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
      CONSTRAINT friendship_notifications_friendship_id_fkey FOREIGN KEY (friendship_id) REFERENCES public.user_friendships(id) ON DELETE CASCADE
    );

    -- 4. Índices para optimizar consultas
    CREATE INDEX IF NOT EXISTS idx_user_friendships_requester_id ON public.user_friendships(requester_id);
    CREATE INDEX IF NOT EXISTS idx_user_friendships_addressee_id ON public.user_friendships(addressee_id);
    CREATE INDEX IF NOT EXISTS idx_user_friendships_status ON public.user_friendships(status);
    CREATE INDEX IF NOT EXISTS idx_friendship_notifications_user_id ON public.friendship_notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_friendship_notifications_is_read ON public.friendship_notifications(is_read);

    -- ===================================
    -- POLÍTICAS RLS (Row Level Security)
    -- ===================================

    -- Habilitar RLS en las nuevas tablas
    ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profile_privacy_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.friendship_notifications ENABLE ROW LEVEL SECURITY;

    -- Políticas para user_friendships
    DROP POLICY IF EXISTS "Users can view their own friendships" ON public.user_friendships;
    CREATE POLICY "Users can view their own friendships" ON public.user_friendships
      FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

    DROP POLICY IF EXISTS "Users can create friendship requests" ON public.user_friendships;
    CREATE POLICY "Users can create friendship requests" ON public.user_friendships
      FOR INSERT WITH CHECK (auth.uid() = requester_id);

    DROP POLICY IF EXISTS "Users can update their friendship status" ON public.user_friendships;
    CREATE POLICY "Users can update their friendship status" ON public.user_friendships
      FOR UPDATE USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

    -- Políticas para profile_privacy_settings
    DROP POLICY IF EXISTS "Users can view their own privacy settings" ON public.profile_privacy_settings;
    CREATE POLICY "Users can view their own privacy settings" ON public.profile_privacy_settings
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own privacy settings" ON public.profile_privacy_settings;
    CREATE POLICY "Users can update their own privacy settings" ON public.profile_privacy_settings
      FOR ALL USING (auth.uid() = user_id);

    -- Políticas para friendship_notifications
    DROP POLICY IF EXISTS "Users can view their own notifications" ON public.friendship_notifications;
    CREATE POLICY "Users can view their own notifications" ON public.friendship_notifications
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own notifications" ON public.friendship_notifications;
    CREATE POLICY "Users can update their own notifications" ON public.friendship_notifications
      FOR UPDATE USING (auth.uid() = user_id);

    -- ===================================
    -- FUNCIONES ÚTILES
    -- ===================================

    -- Función para obtener el estado de amistad entre dos usuarios
    CREATE OR REPLACE FUNCTION get_friendship_status(user1_id uuid, user2_id uuid)
    RETURNS text AS $$
    DECLARE
        friendship_status text;
    BEGIN
        SELECT status INTO friendship_status
        FROM public.user_friendships
        WHERE (requester_id = user1_id AND addressee_id = user2_id)
           OR (requester_id = user2_id AND addressee_id = user1_id)
        LIMIT 1;

        RETURN COALESCE(friendship_status, 'none');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Función para obtener la lista de amigos de un usuario
    CREATE OR REPLACE FUNCTION get_user_friends(target_user_id uuid)
    RETURNS TABLE(friend_id uuid, friend_name text, friend_avatar text, friendship_date timestamp with time zone) AS $$
    BEGIN
        RETURN QUERY
        SELECT
            CASE
                WHEN uf.requester_id = target_user_id THEN uf.addressee_id
                ELSE uf.requester_id
            END as friend_id,
            p.nombre as friend_name,
            p.avatar_url as friend_avatar,
            uf.updated_at as friendship_date
        FROM public.user_friendships uf
        JOIN public.profiles p ON (
            CASE
                WHEN uf.requester_id = target_user_id THEN uf.addressee_id
                ELSE uf.requester_id
            END = p.id
        )
        WHERE (uf.requester_id = target_user_id OR uf.addressee_id = target_user_id)
          AND uf.status = 'accepted'
        ORDER BY uf.updated_at DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    // Nota: Este código debe ejecutarse manualmente en Supabase SQL Editor
    console.log('⚠️  IMPORTANTE: Ejecuta el siguiente SQL en tu panel de Supabase:')
    console.log(migrationSQL)

    console.log('✅ Migración preparada. Ejecuta el SQL en Supabase SQL Editor.')

    return {
      success: true,
      message: 'Migración preparada. Ejecuta el SQL en Supabase.',
      sql: migrationSQL
    }

  } catch (error) {
    console.error('❌ Error en migración:', error)
    return {
      success: false,
      message: 'Error en migración',
      error
    }
  }
}

// Función para verificar si las tablas existen
export const checkFriendshipTables = async () => {
  try {
    // Intentar consultar las nuevas tablas
    const { data: friendships, error: friendshipsError } = await supabase
      .from('user_friendships')
      .select('id')
      .limit(1)

    const { data: privacy, error: privacyError } = await supabase
      .from('profile_privacy_settings')
      .select('id')
      .limit(1)

    const { data: notifications, error: notificationsError } = await supabase
      .from('friendship_notifications')
      .select('id')
      .limit(1)

    return {
      user_friendships: !friendshipsError,
      profile_privacy_settings: !privacyError,
      friendship_notifications: !notificationsError
    }
  } catch (error) {
    console.error('Error verificando tablas:', error)
    return {
      user_friendships: false,
      profile_privacy_settings: false,
      friendship_notifications: false
    }
  }
}

// Ejecutar verificación al importar
console.log('🔍 Verificando tablas del sistema de amigos...')
checkFriendshipTables().then(status => {
  console.log('Estado de las tablas:', status)

  const allTablesExist = Object.values(status).every(exists => exists)

  if (!allTablesExist) {
    console.log('⚠️  Algunas tablas no existen. Ejecuta runFriendshipMigrations()')
  } else {
    console.log('✅ Todas las tablas del sistema de amigos están disponibles')
  }
})

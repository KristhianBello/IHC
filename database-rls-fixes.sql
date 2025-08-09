-- Correcciones para políticas RLS
-- Ejecutar en Supabase SQL Editor para corregir errores de permisos

-- ============================
-- CORREGIR POLÍTICAS DE PROFILES
-- ============================

-- Eliminar políticas existentes que pueden estar en conflicto
DROP POLICY IF EXISTS "Usuarios pueden ver perfiles públicos" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON public.profiles;

-- Crear políticas más permisivas para profiles
CREATE POLICY "Permitir ver todos los perfiles" ON public.profiles
FOR SELECT 
USING (true);

CREATE POLICY "Permitir crear perfil propio" ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir actualizar perfil propio" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id);

-- ============================
-- VERIFICAR Y CORREGIR OTRAS POLÍTICAS
-- ============================

-- Asegurar que las funciones RPC tengan permisos completos
-- Las funciones SECURITY DEFINER deberían ejecutarse con permisos del creador

-- Verificar que las políticas de user_friendships permitan las operaciones RPC
DROP POLICY IF EXISTS "Usuarios pueden crear solicitudes de amistad" ON public.user_friendships;
CREATE POLICY "Permitir crear solicitudes de amistad" ON public.user_friendships
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

-- Política más permisiva para notificaciones (para permitir que las funciones RPC las creen)
DROP POLICY IF EXISTS "Sistema puede crear notificaciones" ON public.friendship_notifications;
CREATE POLICY "Permitir crear notificaciones" ON public.friendship_notifications
FOR INSERT 
WITH CHECK (true);

-- ============================
-- POLÍTICAS PARA PERMITIR BÚSQUEDAS
-- ============================

-- Asegurar que se pueda buscar en profiles
DROP POLICY IF EXISTS "Permitir búsquedas en profiles" ON public.profiles;
CREATE POLICY "Permitir búsquedas en profiles" ON public.profiles
FOR SELECT 
USING (true);

-- ============================
-- VERIFICAR CONFIGURACIÓN RLS
-- ============================

-- Verificar estado de RLS en todas las tablas importantes
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_friendships', 'friendship_notifications', 'posts', 'post_likes', 'post_comments')
ORDER BY tablename;

-- Mostrar todas las políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Políticas RLS para el sistema de amigos/compañeros
-- Ejecutar en Supabase SQL Editor después de database-functions-rpc.sql

-- ============================
-- POLÍTICAS PARA user_friendships
-- ============================

-- Habilitar RLS en la tabla user_friendships si no está habilitado
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios ver sus propias amistades
CREATE POLICY "Usuarios pueden ver sus amistades" ON public.user_friendships
FOR SELECT 
USING (
  auth.uid() = requester_id OR 
  auth.uid() = addressee_id
);

-- Política para permitir insertar solicitudes de amistad
CREATE POLICY "Usuarios pueden crear solicitudes de amistad" ON public.user_friendships
FOR INSERT 
WITH CHECK (
  auth.uid() = requester_id AND
  auth.uid() != addressee_id
);

-- Política para permitir actualizar estado de amistad
CREATE POLICY "Usuarios pueden actualizar solicitudes dirigidas a ellos" ON public.user_friendships
FOR UPDATE 
USING (
  auth.uid() = addressee_id OR 
  auth.uid() = requester_id
);

-- Política para permitir eliminar amistades
CREATE POLICY "Usuarios pueden eliminar sus amistades" ON public.user_friendships
FOR DELETE 
USING (
  auth.uid() = requester_id OR 
  auth.uid() = addressee_id
);

-- ============================
-- POLÍTICAS PARA friendship_notifications
-- ============================

-- Habilitar RLS en la tabla friendship_notifications si no está habilitado
ALTER TABLE public.friendship_notifications ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios ver sus propias notificaciones
CREATE POLICY "Usuarios pueden ver sus notificaciones" ON public.friendship_notifications
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para permitir insertar notificaciones (para el sistema)
CREATE POLICY "Sistema puede crear notificaciones" ON public.friendship_notifications
FOR INSERT 
WITH CHECK (true);

-- Política para permitir actualizar notificaciones propias
CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON public.friendship_notifications
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para permitir eliminar notificaciones propias
CREATE POLICY "Usuarios pueden eliminar sus notificaciones" ON public.friendship_notifications
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================
-- POLÍTICAS PARA profile_privacy_settings
-- ============================

-- Habilitar RLS en la tabla profile_privacy_settings si no está habilitado
ALTER TABLE public.profile_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios ver sus propias configuraciones
CREATE POLICY "Usuarios pueden ver su configuración de privacidad" ON public.profile_privacy_settings
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para permitir insertar configuración de privacidad
CREATE POLICY "Usuarios pueden crear su configuración de privacidad" ON public.profile_privacy_settings
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para permitir actualizar configuración de privacidad propia
CREATE POLICY "Usuarios pueden actualizar su configuración de privacidad" ON public.profile_privacy_settings
FOR UPDATE 
USING (auth.uid() = user_id);

-- ============================
-- POLÍTICAS PARA profiles
-- ============================

-- Verificar si RLS está habilitado en profiles (debería estarlo ya)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir ver perfiles (respetando privacidad)
CREATE POLICY "Usuarios pueden ver perfiles públicos" ON public.profiles
FOR SELECT 
USING (true);

-- Política para permitir a los usuarios actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id);

-- Política para permitir insertar perfil propio
CREATE POLICY "Usuarios pueden crear su perfil" ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ============================
-- POLÍTICAS PARA posts
-- ============================

-- Verificar si RLS está habilitado en posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Política para permitir ver todos los posts
CREATE POLICY "Todos pueden ver posts" ON public.posts
FOR SELECT 
USING (true);

-- Política para permitir crear posts
CREATE POLICY "Usuarios autenticados pueden crear posts" ON public.posts
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Política para permitir actualizar posts propios
CREATE POLICY "Usuarios pueden actualizar sus posts" ON public.posts
FOR UPDATE 
USING (auth.uid() = author_id);

-- Política para permitir eliminar posts propios
CREATE POLICY "Usuarios pueden eliminar sus posts" ON public.posts
FOR DELETE 
USING (auth.uid() = author_id);

-- ============================
-- POLÍTICAS PARA post_likes
-- ============================

-- Habilitar RLS en post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Política para ver likes
CREATE POLICY "Todos pueden ver likes" ON public.post_likes
FOR SELECT 
USING (true);

-- Política para crear likes
CREATE POLICY "Usuarios pueden dar like" ON public.post_likes
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para eliminar likes propios
CREATE POLICY "Usuarios pueden quitar sus likes" ON public.post_likes
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================
-- POLÍTICAS PARA post_comments
-- ============================

-- Habilitar RLS en post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Política para ver comentarios
CREATE POLICY "Todos pueden ver comentarios" ON public.post_comments
FOR SELECT 
USING (true);

-- Política para crear comentarios
CREATE POLICY "Usuarios pueden comentar" ON public.post_comments
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para actualizar comentarios propios
CREATE POLICY "Usuarios pueden actualizar sus comentarios" ON public.post_comments
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para eliminar comentarios propios
CREATE POLICY "Usuarios pueden eliminar sus comentarios" ON public.post_comments
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================
-- VERIFICACIÓN FINAL
-- ============================

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_friendships', 'friendship_notifications', 'profile_privacy_settings', 'profiles', 'posts', 'post_likes', 'post_comments')
ORDER BY tablename, policyname;

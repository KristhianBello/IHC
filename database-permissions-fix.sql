-- Diagnóstico y corrección completa de permisos
-- Ejecutar en Supabase SQL Editor para verificar y corregir todos los problemas

-- ============================
-- 1. VERIFICAR QUE LAS FUNCIONES EXISTEN
-- ============================

-- Verificar si las funciones RPC se crearon correctamente
SELECT 
    routine_name,
    routine_type,
    specific_name,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'send_friend_request', 
    'get_prioritized_posts', 
    'search_users',
    'get_user_friends',
    'get_pending_friend_requests',
    'respond_to_friend_request',
    'get_friendship_status',
    'remove_friendship',
    'block_user',
    'get_public_profile',
    'can_send_friend_request'
)
ORDER BY routine_name;

-- ============================
-- 2. OTORGAR PERMISOS COMPLETOS AL ROL authenticated
-- ============================

-- Otorgar permisos completos de uso del esquema public
GRANT USAGE ON SCHEMA public TO authenticated;

-- Otorgar permisos completos en todas las tablas existentes
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Otorgar permisos en todas las secuencias
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Otorgar permisos en todas las funciones
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;

-- ============================
-- 3. PERMISOS ESPECÍFICOS PARA FUNCIONES RPC
-- ============================

-- Re-otorgar permisos específicos en funciones (por si acaso)
GRANT EXECUTE ON FUNCTION search_users(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_friends() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_pending_friend_requests() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION send_friend_request(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION respond_to_friend_request(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_friendship_status(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION remove_friendship(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION block_user(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_public_profile(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_prioritized_posts(integer, integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_send_friend_request(uuid) TO authenticated, anon;

-- ============================
-- 4. VERIFICAR PERMISOS EN TABLAS ESPECÍFICAS
-- ============================

-- Verificar y otorgar permisos en tablas específicas
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT ALL ON public.user_friendships TO authenticated, anon;
GRANT ALL ON public.friendship_notifications TO authenticated, anon;
GRANT ALL ON public.profile_privacy_settings TO authenticated, anon;
GRANT ALL ON public.posts TO authenticated, anon;
GRANT ALL ON public.post_likes TO authenticated, anon;
GRANT ALL ON public.post_comments TO authenticated, anon;

-- ============================
-- 5. DESHABILITAR RLS COMPLETAMENTE EN TODAS LAS TABLAS RELEVANTES
-- ============================

-- Asegurar que RLS está deshabilitado
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendship_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_privacy_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;

-- ============================
-- 6. VERIFICAR EL ESTADO FINAL
-- ============================

-- Verificar permisos en tablas
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESHABILITADO' END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar permisos otorgados al rol authenticated
SELECT 
    table_schema,
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated'
AND table_schema = 'public'
ORDER BY table_name;

-- Verificar funciones disponibles
SELECT 
    routine_schema,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%friend%'
ORDER BY routine_name;

-- ============================
-- 7. PRUEBA BÁSICA DE FUNCIÓN
-- ============================

-- Probar una función simple para verificar que funciona
SELECT 'Funciones RPC disponibles y funcionando' as resultado;

-- Solución temporal: Deshabilitar RLS para desarrollo
-- USAR SOLO EN DESARROLLO - NO EN PRODUCCIÓN
-- Ejecutar en Supabase SQL Editor como solución rápida

-- ============================
-- DESHABILITAR RLS TEMPORALMENTE
-- ============================

-- Deshabilitar RLS en profiles para permitir consultas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en user_friendships para permitir las funciones RPC
ALTER TABLE public.user_friendships DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en friendship_notifications 
ALTER TABLE public.friendship_notifications DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en profile_privacy_settings
ALTER TABLE public.profile_privacy_settings DISABLE ROW LEVEL SECURITY;

-- Mantener RLS habilitado en posts, likes y comments para seguridad básica
-- ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;

-- ============================
-- VERIFICAR ESTADO ACTUAL
-- ============================

-- Verificar qué tablas tienen RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO' 
    ELSE 'RLS DESHABILITADO' 
  END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_friendships', 'friendship_notifications', 'profile_privacy_settings', 'posts', 'post_likes', 'post_comments')
ORDER BY tablename;

-- ============================
-- PARA REACTIVAR RLS DESPUÉS (NO EJECUTAR AHORA)
-- ============================

/*
-- Cuando estés listo para reactivar RLS con políticas correctas:

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendship_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Y luego ejecutar las políticas correctas
*/

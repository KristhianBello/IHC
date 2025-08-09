-- Verificación y corrección para error 406 (Not Acceptable)
-- Ejecutar en Supabase SQL Editor

-- ============================
-- 1. VERIFICAR QUE LAS TABLAS EXISTEN
-- ============================

-- Verificar todas las tablas en el esquema public
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================
-- 2. VERIFICAR ESTRUCTURA DE LA TABLA PROFILES
-- ============================

-- Verificar columnas de la tabla profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================
-- 3. VERIFICAR DATOS EN PROFILES
-- ============================

-- Contar registros en profiles
SELECT 'Número de registros en profiles:' as descripcion, COUNT(*) as total FROM public.profiles;

-- Ver algunos registros de ejemplo
SELECT 
    id,
    email,
    nombre,
    first_name,
    last_name,
    created_at
FROM public.profiles 
LIMIT 5;

-- ============================
-- 4. VERIFICAR CONFIGURACIÓN API REST
-- ============================

-- En Supabase, las tablas deben tener permisos especiales para la API REST
-- Verificar que la tabla profiles sea accesible

-- Recrear la tabla profiles si es necesario (solo si no tiene datos importantes)
-- NO EJECUTAR SI YA TIENES DATOS IMPORTANTES

/*
-- SOLO USAR SI LA TABLA NO EXISTE O ESTÁ CORRUPTA
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    nombre text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    interests text[],
    skills text[],
    organization text,
    volunteer_time text,
    notifications jsonb,
    privacy jsonb,
    language text,
    theme text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now(),
    address text,
    bio text,
    birth_date timestamp with time zone,
    city text,
    emergency_contact text,
    first_name text,
    last_name text,
    phone text,
    gender text,
    neighborhood text,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
*/

-- ============================
-- 5. ASEGURAR PERMISOS COMPLETOS EN PROFILES
-- ============================

-- Asegurar que profiles tenga todos los permisos
GRANT ALL ON public.profiles TO authenticated, anon, postgres;

-- Deshabilitar RLS en profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================
-- 6. VERIFICAR USUARIOS AUTH
-- ============================

-- Verificar usuarios en auth.users (esto puede fallar si no tienes permisos)
-- SELECT id, email, created_at FROM auth.users LIMIT 3;

-- ============================
-- 7. CREAR DATOS DE PRUEBA SI NO EXISTEN
-- ============================

-- Insertar un registro de prueba en profiles si no existe
INSERT INTO public.profiles (
    id, 
    email, 
    nombre, 
    first_name, 
    last_name,
    created_at
) 
SELECT 
    'ec2bb77b-0142-4913-ac33-653392d28359'::uuid,
    'expo.president@gmail.com',
    'Expo President',
    'Expo',
    'President',
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'expo.president@gmail.com'
);

-- Insertar otro registro de prueba
INSERT INTO public.profiles (
    id, 
    email, 
    nombre, 
    first_name, 
    last_name,
    created_at
) 
SELECT 
    '19e93939-ee2b-4483-826c-e3999266f805'::uuid,
    'toroj1483@gmail.com',
    'Jesus Montes',
    'Jesus',
    'Montes',
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'toroj1483@gmail.com'
);

-- ============================
-- 8. VERIFICACIÓN FINAL
-- ============================

-- Verificar que los datos se insertaron
SELECT 
    'Verificación final - Registros en profiles:' as descripcion,
    COUNT(*) as total,
    string_agg(email, ', ') as emails
FROM public.profiles;

-- Verificar permisos finales
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

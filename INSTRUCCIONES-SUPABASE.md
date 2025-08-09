# 🚀 Instrucciones para Configurar el Sistema de Amigos en Supabase

## 📋 Pasos a Seguir:

### 1. **Acceder a Supabase Dashboard**
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Navega a la sección **SQL Editor**

### 2. **Ejecutar Schema de Base de Datos**
   - Copia y pega el contenido completo del archivo `database-schema-companions.sql`
   - Ejecuta el script completo
   - ✅ Esto creará todas las tablas necesarias con políticas RLS

### 3. **Ejecutar Funciones RPC**
   - Copia y pega el contenido completo del archivo `database-functions-rpc.sql`
   - Ejecuta el script completo
   - ✅ Esto creará todas las funciones necesarias para el sistema de amigos

### 4. **Verificar que las Tablas se Crearon Correctamente**
   En la sección **Table Editor**, deberías ver estas nuevas tablas:
   - ✅ `user_friendships` - Relaciones de amistad
   - ✅ `profile_privacy_settings` - Configuración de privacidad
   - ✅ `friendship_notifications` - Notificaciones de amistad
   - ✅ `posts` - Publicaciones del foro
   - ✅ `post_likes` - Likes de publicaciones
   - ✅ `post_comments` - Comentarios de publicaciones

### 5. **Verificar que las Funciones RPC se Crearon**
   En la sección **SQL Editor**, ejecuta esta consulta para verificar:
   ```sql
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%friend%' OR routine_name LIKE '%user%';
   ```
   
   Deberías ver estas funciones:
   - ✅ `search_users`
   - ✅ `get_user_friends`
   - ✅ `get_pending_friend_requests`
   - ✅ `send_friend_request`
   - ✅ `respond_to_friend_request`
   - ✅ `get_friendship_status`
   - ✅ `remove_friendship`
   - ✅ `block_user`
   - ✅ `get_public_profile`

### 6. **Configurar Variables de Entorno**
   Asegúrate de que tu archivo `.env` tenga:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

### 7. **Probar la Funcionalidad**
   - Reinicia tu servidor de desarrollo
   - Ve a la sección de **Compañeros** en tu aplicación
   - Intenta buscar usuarios y enviar solicitudes de amistad

## 🔧 **Solución de Problemas:**

### Error 403 (Forbidden):
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de estar autenticado en la aplicación

### Error 404 (Function not found):
- Verifica que las funciones RPC se hayan creado correctamente
- Ejecuta el script `database-functions-rpc.sql` nuevamente

### No aparecen usuarios en la búsqueda:
- Verifica que existan perfiles en la tabla `profiles`
- Asegúrate de tener más de un usuario registrado

## 📝 **Notas Importantes:**

1. **Orden de Ejecución**: Ejecuta primero `database-schema-companions.sql` y luego `database-functions-rpc.sql`

2. **Datos de Prueba**: Puedes crear usuarios de prueba registrándote con diferentes emails

3. **Seguridad**: Las políticas RLS garantizan que cada usuario solo vea sus propios datos

4. **Performance**: Los índices creados optimizan las consultas para mejor rendimiento

## ✅ **Verificación Final:**
Una vez completados todos los pasos, deberías poder:
- ✅ Buscar usuarios por nombre o email
- ✅ Enviar solicitudes de amistad
- ✅ Ver perfiles de otros usuarios
- ✅ Gestionar tu lista de amigos
- ✅ Eliminar amistades

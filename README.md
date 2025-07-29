# EcoVecinos - Sistema de Foro Comunitario

Sistema web completo de foro comunitario con funcionalidades avanzadas de interacción social, mapas interactivos y gestión de compañeros.

## 🚀 Funcionalidades Implementadas

### ✅ **Sistema de Autenticación**
- **Interfaz de login moderna** con botón verde como solicitado
- **Selector de idioma** (Español/Inglés) con banderas
- **Navegación automática** al foro después del login
- **Validación de formularios** con mensajes personalizados

### ✅ **Foro Principal con WebSocket**
- **Publicaciones en tiempo real** con simulación WebSocket
- **Sistema de likes** (un like por usuario)
- **Comentarios y respuestas** anidados
- **Búsqueda avanzada** por título, contenido y ubicación
- **Edición de publicaciones** (hasta 1 minuto después de crear)
- **Eliminación de publicaciones** por el autor

### ✅ **Selector de Mapas Interactivo**
- **Mapa integrado con Leaflet** para seleccionar ubicaciones
- **Búsqueda de lugares** por texto
- **Marcadores interactivos** en las publicaciones
- **Integración completa** con el formulario de nuevas publicaciones

### ✅ **Sistema de Galería**
- **Subida de imágenes** con drag & drop
- **Filtros por categoría**: Todas, Mis imágenes, Imágenes del foro
- **Búsqueda por título** de imágenes
- **Modal de visualización** con opciones de descarga
- **Gestión completa** (subir, ver, eliminar imágenes)

### ✅ **Sistema de Compañeros**
- **Búsqueda de usuarios** por nombre
- **Envío de solicitudes** de amistad
- **Gestión de compañeros** (agregar/eliminar)
- **Lista de compañeros activos** con estados

### ✅ **Sistema Multiidioma**
- **Español e Inglés** completamente implementados
- **Cambio dinámico** de idioma en tiempo real
- **Todas las interfaces** traducidas
- **Persistencia** de preferencia de idioma

### ✅ **Sistema de Temas**
- **Modo claro y oscuro** con variables CSS
- **Cambio automático** desde el perfil de usuario
- **Diseño adaptativo** con esquema verde/blanco
- **Persistencia** de preferencias

### ✅ **Navegación Completa**
- **Header responsivo** con menú de usuario
- **Sidebar de navegación** con iconos FontAwesome
- **Rutas configuradas**: Foro, Mapa, Galería, Adopciones, etc.
- **Enlaces activos** con indicadores visuales

## 🛠 Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## ⚙️ Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## 📦 Project Setup

```sh
npm install
```

## 🔧 Configuración de Supabase

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
# Configuración de Supabase
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-aqui
```

### 2. Obtener Credenciales
1. Ve a [supabase.com](https://supabase.com)
2. Accede a tu proyecto
3. En **Settings** → **API** encontrarás:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Compile and Hot-Reload for Development

```sh
npm run dev
```

El servidor se iniciará en `http://localhost:5173`

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 🎯 Características Técnicas

### **Frontend**
- **Vue 3** con Composition API
- **Vite** para desarrollo y build
- **Vue Router** para navegación
- **Leaflet** para mapas interactivos
- **FontAwesome** para iconografía

### **Backend Simulado**
- **Supabase** configurado y listo para producción
- **WebSocket simulation** para tiempo real
- **Sistema de autenticación** preparado
- **Gestión de estado** reactivo

### **Estilos**
- **CSS Variables** para theming
- **Diseño responsivo** mobile-first
- **Animaciones suaves** con transiciones
- **Esquema de colores** verde/blanco como solicitado

## 🚀 Estado del Proyecto

### ✅ **Completamente Funcional:**
- Login con botón verde ✓
- WebSocket para publicaciones ✓
- Galería con filtros ✓
- Mapas interactivos ✓
- Sistema de compañeros ✓
- Multiidioma ES/EN ✓
- Temas claro/oscuro ✓

### 📱 **Totalmente Responsive:**
- Móviles ✓
- Tablets ✓
- Desktop ✓

### 🔒 **Seguridad:**
- Variables de entorno ✓
- Autenticación lista ✓
- Sanitización de datos ✓

## 📝 Notas de Desarrollo

### **Estructura del Proyecto:**
```
src/
├── components/       # Componentes Vue
├── views/           # Vistas principales
├── composables/     # Lógica reutilizable
├── lib/            # Cliente Supabase
├── router/         # Configuración de rutas
└── stores/         # Gestión de estado
```

### **Comandos Útiles:**
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Verificar errores
npm run lint

# Preview de producción
npm run preview
```

¡Tu sistema EcoVecinos está completamente implementado y listo para usar! 🎉

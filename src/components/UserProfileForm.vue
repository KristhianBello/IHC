<template>
  <div>
    <HeaderWithProfile :show-back-to-forum="true" />

    <main class="form-container">
      <div class="form-header">
        <h1><i class="fas fa-user-cog"></i> Mi Perfil de Usuario</h1>
        <p>
          Gestiona tu información personal y preferencias para mejorar tu experiencia
          en la plataforma de mantenimiento de espacios públicos.
        </p>
      </div>

      <form class="adoption-form" @submit.prevent="handleSubmit">
        <!-- INFORMACIÓN PERSONAL -->
        <section class="form-section">
          <h2><i class="fas fa-user"></i> Información personal</h2>
          <div class="avatar-section">
            <div class="avatar-preview">
              <img v-if="formData.avatar" :src="formData.avatar" alt="Avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="avatar-controls">
              <input type="file" id="avatar" accept="image/*" @change="handleAvatarUpload" hidden />
              <label for="avatar" class="btn btn-outline btn-small">
                <i class="fas fa-camera"></i> Cambiar foto
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Nombre *</label>
              <input type="text" id="firstName" v-model="formData.firstName" placeholder="Ej. Ana" required />
            </div>
            <div class="form-group">
              <label for="lastName">Apellido *</label>
              <input type="text" id="lastName" v-model="formData.lastName" placeholder="Ej. López" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Correo electrónico *</label>
              <input type="email" id="email" v-model="formData.email" placeholder="Ej. ana@email.com" required />
            </div>
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input type="tel" id="phone" v-model="formData.phone" placeholder="Ej. 0987654321" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthDate">Fecha de nacimiento</label>
              <input type="date" id="birthDate" v-model="formData.birthDate" />
            </div>
            <div class="form-group">
              <label for="gender">Género</label>
              <select id="gender" v-model="formData.gender">
                <option value="">Seleccionar</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
                <option value="prefiero-no-decir">Prefiero no decir</option>
              </select>
            </div>
          </div>
        </section>

        <!-- INFORMACIÓN DE CONTACTO -->
        <section class="form-section">
          <h2><i class="fas fa-map-marker-alt"></i> Información de contacto</h2>
          <div class="form-group">
            <label for="address">Dirección</label>
            <input type="text" id="address" v-model="formData.address"
                   placeholder="Ej. Av. 6 de Diciembre N24-253 y Lizardo García" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="neighborhood">Barrio/Sector</label>
              <input type="text" id="neighborhood" v-model="formData.neighborhood"
                     placeholder="Ej. La Mariscal" />
            </div>
            <div class="form-group">
              <label for="city">Ciudad</label>
              <input type="text" id="city" v-model="formData.city" placeholder="Ej. Quito" />
            </div>
          </div>

          <div class="form-group">
            <label for="emergencyContact">Contacto de emergencia</label>
            <input type="text" id="emergencyContact" v-model="formData.emergencyContact"
                   placeholder="Nombre y teléfono de contacto de emergencia" />
          </div>
        </section>

        <!-- PERFIL COMUNITARIO -->
        <section class="form-section">
          <h2><i class="fas fa-users"></i> Perfil comunitario</h2>
          <div class="form-group">
            <label for="bio">Biografía/Presentación</label>
            <textarea id="bio" v-model="formData.bio"
                      placeholder="Cuéntanos sobre ti, tus intereses en el mantenimiento de espacios públicos y tu experiencia"
                      rows="4"></textarea>
          </div>

          <div class="form-group">
            <label for="interests">Áreas de interés</label>
            <div class="checkbox-group">
              <label v-for="interest in availableInterests" :key="interest.value">
                <input type="checkbox" :value="interest.value" v-model="formData.interests" />
                {{ interest.label }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="skills">Habilidades y experiencia</label>
            <div class="checkbox-group">
              <label v-for="skill in availableSkills" :key="skill.value">
                <input type="checkbox" :value="skill.value" v-model="formData.skills" />
                {{ skill.label }}
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="organization">Organización/Grupo</label>
              <input type="text" id="organization" v-model="formData.organization"
                     placeholder="Comité de barrio, ONG, empresa, etc." />
            </div>
            <div class="form-group">
              <label for="volunteerTime">Tiempo disponible para voluntariado</label>
              <select id="volunteerTime" v-model="formData.volunteerTime">
                <option value="">Seleccionar</option>
                <option value="1-2h-semana">1-2 horas por semana</option>
                <option value="3-5h-semana">3-5 horas por semana</option>
                <option value="6-10h-semana">6-10 horas por semana</option>
                <option value="fines-semana">Solo fines de semana</option>
                <option value="eventual">Actividades eventuales</option>
              </select>
            </div>
          </div>
        </section>

        <!-- PREFERENCIAS -->
        <section class="form-section">
          <h2><i class="fas fa-cog"></i> Preferencias</h2>
          <div class="form-group">
            <label for="notifications">Preferencias de notificaciones</label>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" v-model="formData.notifications.email" />
                Recibir notificaciones por correo electrónico
              </label>
              <label>
                <input type="checkbox" v-model="formData.notifications.sms" />
                Recibir notificaciones por SMS
              </label>
              <label>
                <input type="checkbox" v-model="formData.notifications.push" />
                Notificaciones push en la aplicación
              </label>
              <label>
                <input type="checkbox" v-model="formData.notifications.newsletter" />
                Boletín semanal de actividades
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="privacy">Configuración de privacidad</label>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" v-model="formData.privacy.showProfile" />
                Mostrar mi perfil públicamente
              </label>
              <label>
                <input type="checkbox" v-model="formData.privacy.showContact" />
                Permitir que otros usuarios me contacten
              </label>
              <label>
                <input type="checkbox" v-model="formData.privacy.showParticipation" />
                Mostrar mis actividades y participaciones
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="language">Idioma preferido</label>
              <select id="language" v-model="formData.language">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="qu">Kichwa</option>
              </select>
            </div>
            <div class="form-group">
              <label for="theme">Tema de la interfaz</label>
              <select id="theme" v-model="formData.theme">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
          </div>
        </section>

        <!-- ESTADÍSTICAS -->
        <section class="form-section">
          <h2><i class="fas fa-chart-bar"></i> Mi actividad</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ userStats.adoptions }}</div>
              <div class="stat-label">Espacios adoptados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ userStats.tasks }}</div>
              <div class="stat-label">Tareas completadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ userStats.reports }}</div>
              <div class="stat-label">Problemas reportados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ userStats.participation }}</div>
              <div class="stat-label">Actividades participadas</div>
            </div>
          </div>
        </section>

        <!-- BOTONES DE ACCIÓN -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-outline">
            <i class="fas fa-undo"></i> Deshacer cambios
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Guardar perfil
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { updateUserProfile } from '@/lib/supabaseClient'
import HeaderWithProfile from '@/components/HeaderWithProfile.vue'

const router = useRouter()

// Available options
const availableInterests = [
  { value: 'limpieza', label: 'Limpieza y mantenimiento' },
  { value: 'jardineria', label: 'Jardinería y paisajismo' },
  { value: 'pintura', label: 'Pintura y renovación' },
  { value: 'reforestacion', label: 'Reforestación' },
  { value: 'seguridad', label: 'Seguridad comunitaria' },
  { value: 'eventos', label: 'Organización de eventos' },
  { value: 'educacion', label: 'Educación ambiental' },
  { value: 'reciclaje', label: 'Reciclaje y sostenibilidad' }
]

const availableSkills = [
  { value: 'liderazgo', label: 'Liderazgo y organización' },
  { value: 'jardineria-exp', label: 'Experiencia en jardinería' },
  { value: 'construccion', label: 'Construcción y reparaciones' },
  { value: 'diseno', label: 'Diseño y planificación' },
  { value: 'fotografia', label: 'Fotografía y documentación' },
  { value: 'primeros-auxilios', label: 'Primeros auxilios' },
  { value: 'educacion-exp', label: 'Experiencia educativa' },
  { value: 'comunicacion', label: 'Comunicación y redes sociales' }
]

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  address: '',
  neighborhood: '',
  city: '',
  emergencyContact: '',
  bio: '',
  interests: [],
  skills: [],
  organization: '',
  volunteerTime: '',
  notifications: {
    email: true,
    sms: false,
    push: true,
    newsletter: true
  },
  privacy: {
    showProfile: true,
    showContact: true,
    showParticipation: true
  },
  language: 'es',
  theme: 'light',
  avatar: null
})

// User statistics (would come from backend)
const userStats = ref({
  adoptions: 3,
  tasks: 15,
  reports: 7,
  participation: 28
})

// Handle avatar upload
function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Handle form submission
async function handleSubmit() {
  // Validate required fields
  if (!formData.value.firstName || !formData.value.lastName || !formData.value.email) {
    alert('Por favor, completa todos los campos requeridos.')
    return
  }

  try {
    // Send profile update using the simulated function
    const result = await updateUserProfile(formData.value)

    if (result.success) {
      console.log('Perfil actualizado:', result.profile)

      // Show success message
      alert('¡Perfil actualizado exitosamente!')

      // Redirect to forum
      router.push('/foro')
    } else {
      alert('Error: ' + result.error)
    }

  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    alert('Hubo un error al actualizar el perfil. Por favor, intenta nuevamente.')
  }
}

// Reset form function
function resetForm() {
  // Reload the original data or reset to default values
  location.reload()
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

/* Variables de color */
:root {
  --primary-green: #2E8B57;
  --secondary-green: #98FB98;
  --light-bg: #F5F5F5;
  --dark-text: #333333;
  --white: #FFFFFF;
  --gray-border: #E0E0E0;
  --hover-green: #3CB371;
  --profile-purple: #8A2BE2;
}

/* Estructura principal */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--white);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.logo {
  height: 50px;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--primary-green);
  color: var(--primary-green);
}

.btn-outline:hover {
  background-color: var(--primary-green);
  color: var(--white);
}

.btn-primary {
  background-color: var(--profile-purple);
  color: var(--white);
  border: 2px solid var(--profile-purple);
}

.btn-primary:hover {
  background-color: #7B1FA2;
  border-color: #7B1FA2;
}

/* Avatar section */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--light-bg);
  border-radius: 10px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--profile-purple);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--gray-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #999;
}

/* Contenedor del formulario */
.form-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  color: var(--profile-purple);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.form-header p {
  color: var(--dark-text);
}

/* Estilos del formulario */
.adoption-form {
  background-color: var(--white);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-border);
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h2 {
  color: var(--profile-purple);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
  gap: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--gray-border);
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--profile-purple);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: var(--light-bg);
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--profile-purple);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--profile-purple);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--dark-text);
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-actions {
    flex-direction: column;
  }

  .header {
    padding: 1rem;
  }

  .form-container {
    padding: 0 0.5rem;
  }

  .adoption-form {
    padding: 1rem;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

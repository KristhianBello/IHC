<template>
  <div>
    <header class="header">
      <img :src="logo" alt="Logo Descubre tu barrio" class="logo" />
      <nav>
        <RouterLink to="/foro" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i> Volver al foro
        </RouterLink>
      </nav>
    </header>

    <main class="form-container">
      <div class="form-header">
        <h1><i class="fas fa-calendar-plus"></i> Programar Tarea de Mantenimiento</h1>
        <p>
          Organiza actividades de mantenimiento para espacios públicos. Invita a otros vecinos
          a participar y crear un cronograma de trabajo colaborativo.
        </p>
      </div>

      <form class="adoption-form" @submit.prevent="handleSubmit">
        <!-- INFORMACIÓN DEL ORGANIZADOR -->
        <section class="form-section">
          <h2><i class="fas fa-user"></i> Información del organizador</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="fullname">Nombre completo *</label>
              <input type="text" id="fullname" v-model="formData.fullname" placeholder="Ej. Ana López" required />
            </div>
            <div class="form-group">
              <label for="email">Correo electrónico *</label>
              <input type="email" id="email" v-model="formData.email" placeholder="Ej. ana@email.com" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Teléfono *</label>
              <input type="tel" id="phone" v-model="formData.phone" placeholder="Ej. 0987654321" required />
            </div>
            <div class="form-group">
              <label for="organization">Organización/Grupo</label>
              <input type="text" id="organization" v-model="formData.organization" placeholder="Comité de barrio, grupo vecinal, etc." />
            </div>
          </div>
        </section>

        <!-- DETALLES DE LA TAREA -->
        <section class="form-section">
          <h2><i class="fas fa-tasks"></i> Detalles de la tarea</h2>
          <div class="form-group">
            <label for="taskTitle">Título de la actividad *</label>
            <input type="text" id="taskTitle" v-model="formData.taskTitle"
                   placeholder="Ej. Limpieza del Parque Central" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="taskType">Tipo de actividad *</label>
              <select id="taskType" v-model="formData.taskType" required>
                <option value="">Selecciona tipo de actividad</option>
                <option value="limpieza">Limpieza general</option>
                <option value="jardineria">Jardinería y paisajismo</option>
                <option value="pintura">Pintura y renovación</option>
                <option value="reparaciones">Reparaciones menores</option>
                <option value="reforestacion">Reforestación</option>
                <option value="mantenimiento">Mantenimiento de mobiliario</option>
                <option value="seguridad">Mejoras de seguridad</option>
                <option value="evento">Evento comunitario</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label for="priority">Prioridad *</label>
              <select id="priority" v-model="formData.priority" required>
                <option value="">Selecciona prioridad</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripción detallada *</label>
            <textarea id="description" v-model="formData.description"
                      placeholder="Describe qué actividades se realizarán, materiales necesarios, objetivos, etc."
                      rows="4" required></textarea>
          </div>
        </section>

        <!-- UBICACIÓN -->
        <section class="form-section">
          <h2><i class="fas fa-map-marker-alt"></i> Ubicación</h2>
          <div class="form-group">
            <label for="location">Lugar específico *</label>
            <input type="text" id="location" v-model="formData.location"
                   placeholder="Ej. Parque La Carolina, sector de juegos infantiles" required />
          </div>

          <div class="form-group">
            <label for="meetingPoint">Punto de encuentro</label>
            <input type="text" id="meetingPoint" v-model="formData.meetingPoint"
                   placeholder="Donde se reunirán los participantes" />
          </div>
        </section>

        <!-- PROGRAMACIÓN -->
        <section class="form-section">
          <h2><i class="fas fa-clock"></i> Programación</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Fecha de inicio *</label>
              <input type="date" id="startDate" v-model="formData.startDate" required />
            </div>
            <div class="form-group">
              <label for="endDate">Fecha de finalización</label>
              <input type="date" id="endDate" v-model="formData.endDate" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startTime">Hora de inicio *</label>
              <input type="time" id="startTime" v-model="formData.startTime" required />
            </div>
            <div class="form-group">
              <label for="endTime">Hora de finalización *</label>
              <input type="time" id="endTime" v-model="formData.endTime" required />
            </div>
          </div>

          <div class="form-group">
            <label for="frequency">Frecuencia</label>
            <select id="frequency" v-model="formData.frequency">
              <option value="unica">Actividad única</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
            </select>
          </div>
        </section>

        <!-- PARTICIPACIÓN -->
        <section class="form-section">
          <h2><i class="fas fa-users"></i> Participación</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="maxParticipants">Número máximo de participantes</label>
              <input type="number" id="maxParticipants" v-model.number="formData.maxParticipants"
                     min="1" placeholder="Ej. 20" />
            </div>
            <div class="form-group">
              <label for="minAge">Edad mínima</label>
              <input type="number" id="minAge" v-model.number="formData.minAge"
                     min="0" placeholder="Ej. 16" />
            </div>
          </div>

          <div class="form-group">
            <label for="skills">Habilidades requeridas</label>
            <textarea id="skills" v-model="formData.skills"
                      placeholder="Describe si se necesitan habilidades específicas o si todos pueden participar"></textarea>
          </div>

          <div class="form-group">
            <label for="materials">Materiales y herramientas *</label>
            <textarea id="materials" v-model="formData.materials"
                      placeholder="Lista de materiales que se proporcionarán y cuáles deben traer los participantes"
                      required></textarea>
          </div>
        </section>

        <!-- CONTACTO E INSCRIPCIÓN -->
        <section class="form-section">
          <h2><i class="fas fa-phone"></i> Inscripción y contacto</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="registrationDeadline">Fecha límite de inscripción</label>
              <input type="date" id="registrationDeadline" v-model="formData.registrationDeadline" />
            </div>
            <div class="form-group">
              <label for="contactMethod">Método de contacto preferido</label>
              <select id="contactMethod" v-model="formData.contactMethod">
                <option value="email">Correo electrónico</option>
                <option value="phone">Teléfono</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="additionalInfo">Información adicional</label>
            <textarea id="additionalInfo" v-model="formData.additionalInfo"
                      placeholder="Cualquier información extra para los participantes (qué traer, dónde parquear, etc.)"></textarea>
          </div>
        </section>

        <!-- BOTONES DE ACCIÓN -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-outline">
            <i class="fas fa-undo"></i> Limpiar formulario
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-calendar-check"></i> Programar tarea
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addTask } from '@/lib/supabaseClient'
import logo from '@/assets/logo.png'

const router = useRouter()

// Form data
const formData = ref({
  fullname: '',
  email: '',
  phone: '',
  organization: '',
  taskTitle: '',
  taskType: '',
  priority: '',
  description: '',
  location: '',
  meetingPoint: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  frequency: 'unica',
  maxParticipants: null,
  minAge: null,
  skills: '',
  materials: '',
  registrationDeadline: '',
  contactMethod: 'email',
  additionalInfo: ''
})

// Handle form submission
async function handleSubmit() {
  // Validate required fields
  if (!formData.value.fullname || !formData.value.email || !formData.value.phone ||
      !formData.value.taskTitle || !formData.value.taskType || !formData.value.priority ||
      !formData.value.description || !formData.value.location ||
      !formData.value.startDate || !formData.value.startTime || !formData.value.endTime ||
      !formData.value.materials) {
    alert('Por favor, completa todos los campos requeridos.')
    return
  }

  // Validate dates
  if (formData.value.endDate && formData.value.endDate < formData.value.startDate) {
    alert('La fecha de finalización no puede ser anterior a la fecha de inicio.')
    return
  }

  // Validate times
  if (formData.value.endTime <= formData.value.startTime) {
    alert('La hora de finalización debe ser posterior a la hora de inicio.')
    return
  }

  try {
    // Send task using the simulated function
    const result = await addTask(formData.value)

    if (result.success) {
      console.log('Tarea guardada:', result.task)

      // Show success message
      alert('¡Tarea programada exitosamente! Los vecinos podrán ver tu actividad y unirse.')

      // Reset form and redirect
      resetForm()
      router.push('/foro')
    } else {
      alert('Error: ' + result.error)
    }

  } catch (error) {
    console.error('Error al programar la tarea:', error)
    alert('Hubo un error al programar la tarea. Por favor, intenta nuevamente.')
  }
}

// Reset form function
function resetForm() {
  formData.value = {
    fullname: '',
    email: '',
    phone: '',
    organization: '',
    taskTitle: '',
    taskType: '',
    priority: '',
    description: '',
    location: '',
    meetingPoint: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    frequency: 'unica',
    maxParticipants: null,
    minAge: null,
    skills: '',
    materials: '',
    registrationDeadline: '',
    contactMethod: 'email',
    additionalInfo: ''
  }
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
  --task-blue: #4169E1;
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
  background-color: var(--task-blue);
  color: var(--white);
  border: 2px solid var(--task-blue);
}

.btn-primary:hover {
  background-color: #1E3CB8;
  border-color: #1E3CB8;
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
  color: var(--task-blue);
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
  color: var(--task-blue);
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
  border-color: var(--task-blue);
  box-shadow: 0 0 0 2px rgba(65, 105, 225, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
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
}
</style>

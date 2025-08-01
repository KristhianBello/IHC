<template>
  <div>
    <HeaderWithProfile :show-back-to-forum="true" />

    <main class="form-container">
      <div class="form-header">
        <h1><i class="fas fa-exclamation-triangle"></i> Reportar Problema en Espacio Público</h1>
        <p>
          Ayúdanos a mantener nuestros espacios públicos en buen estado reportando problemas
          que requieran atención. Tu reporte será enviado a las autoridades correspondientes.
        </p>
      </div>

      <form class="adoption-form" @submit.prevent="handleSubmit">
        <!-- INFORMACIÓN DEL REPORTANTE -->
        <section class="form-section">
          <h2><i class="fas fa-user"></i> Información del reportante</h2>
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
              <label for="phone">Teléfono</label>
              <input type="tel" id="phone" v-model="formData.phone" placeholder="Ej. 0987654321" />
            </div>
            <div class="form-group">
              <label for="reportDate">Fecha del problema *</label>
              <input type="date" id="reportDate" v-model="formData.reportDate" required />
            </div>
          </div>
        </section>

        <!-- UBICACIÓN DEL PROBLEMA -->
        <section class="form-section">
          <h2><i class="fas fa-map-marker-alt"></i> Ubicación del problema</h2>
          <div class="form-group">
            <label for="location">Ubicación específica *</label>
            <input type="text" id="location" v-model="formData.location"
                   placeholder="Ej. Parque Central, Av. 6 de Diciembre y Patria" required />
          </div>

          <div class="form-group">
            <label for="reference">Referencias adicionales</label>
            <textarea id="reference" v-model="formData.reference"
                      placeholder="Describe puntos de referencia que ayuden a localizar el problema"></textarea>
          </div>
        </section>

        <!-- TIPO DE PROBLEMA -->
        <section class="form-section">
          <h2><i class="fas fa-tools"></i> Tipo de problema</h2>
          <div class="form-group">
            <label for="problemType">Categoría del problema *</label>
            <select id="problemType" v-model="formData.problemType" required>
              <option value="">Selecciona una categoría</option>
              <option value="infraestructura">Infraestructura dañada</option>
              <option value="limpieza">Problema de limpieza</option>
              <option value="iluminacion">Iluminación deficiente</option>
              <option value="vandalismo">Vandalismo o graffiti</option>
              <option value="jardineria">Problema de jardinería</option>
              <option value="seguridad">Problema de seguridad</option>
              <option value="accesibilidad">Problema de accesibilidad</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="priority">Nivel de prioridad *</label>
            <select id="priority" v-model="formData.priority" required>
              <option value="">Selecciona prioridad</option>
              <option value="baja">Baja - No urgente</option>
              <option value="media">Media - Requiere atención</option>
              <option value="alta">Alta - Urgente</option>
              <option value="critica">Crítica - Peligro inmediato</option>
            </select>
          </div>
        </section>

        <!-- DESCRIPCIÓN DEL PROBLEMA -->
        <section class="form-section">
          <h2><i class="fas fa-file-alt"></i> Descripción detallada</h2>
          <div class="form-group">
            <label for="description">Descripción del problema *</label>
            <textarea id="description" v-model="formData.description"
                      placeholder="Describe detalladamente el problema, qué lo causó si lo sabes, y cualquier información adicional relevante"
                      rows="5" required></textarea>
          </div>

          <div class="form-group">
            <label for="photos">Fotografías del problema</label>
            <input type="file" id="photos" accept="image/*" multiple @change="handleFileUpload" />
            <small class="file-help">Puedes subir múltiples fotos para documentar mejor el problema</small>
          </div>
        </section>

        <!-- ACCIONES SUGERIDAS -->
        <section class="form-section">
          <h2><i class="fas fa-lightbulb"></i> Solución sugerida (opcional)</h2>
          <div class="form-group">
            <label for="suggestedAction">¿Tienes alguna sugerencia para solucionar este problema?</label>
            <textarea id="suggestedAction" v-model="formData.suggestedAction"
                      placeholder="Describe qué acciones podrían ayudar a resolver este problema"></textarea>
          </div>

          <div class="form-group">
            <label for="volunteering">
              <input type="checkbox" v-model="formData.volunteering" />
              Estoy dispuesto/a a participar como voluntario en la solución
            </label>
          </div>
        </section>

        <!-- BOTONES DE ACCIÓN -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-outline">
            <i class="fas fa-undo"></i> Limpiar formulario
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i> Enviar reporte
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addReport } from '@/lib/supabaseClient'
import HeaderWithProfile from '@/components/HeaderWithProfile.vue'

const router = useRouter()

// Form data
const formData = ref({
  fullname: '',
  email: '',
  phone: '',
  reportDate: '',
  location: '',
  reference: '',
  problemType: '',
  priority: '',
  description: '',
  suggestedAction: '',
  volunteering: false,
  photos: []
})

// Handle file upload
function handleFileUpload(event) {
  formData.value.photos = Array.from(event.target.files)
}

// Handle form submission
async function handleSubmit() {
  // Validate required fields
  if (!formData.value.fullname || !formData.value.email || !formData.value.reportDate ||
      !formData.value.location || !formData.value.problemType || !formData.value.priority ||
      !formData.value.description) {
    alert('Por favor, completa todos los campos requeridos.')
    return
  }

  try {
    // Send report using the simulated function
    const result = await addReport(formData.value)

    if (result.success) {
      console.log('Reporte guardado:', result.report)

      // Show success message
      alert('¡Reporte enviado exitosamente! Las autoridades han sido notificadas.')

      // Reset form and redirect
      resetForm()
      router.push('/foro')
    } else {
      alert('Error: ' + result.error)
    }

  } catch (error) {
    console.error('Error al enviar el reporte:', error)
    alert('Hubo un error al enviar el reporte. Por favor, intenta nuevamente.')
  }
}

// Reset form function
function resetForm() {
  formData.value = {
    fullname: '',
    email: '',
    phone: '',
    reportDate: '',
    location: '',
    reference: '',
    problemType: '',
    priority: '',
    description: '',
    suggestedAction: '',
    volunteering: false,
    photos: []
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
  --warning-orange: #FF8C00;
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
  background-color: var(--warning-orange);
  color: var(--white);
  border: 2px solid var(--warning-orange);
}

.btn-primary:hover {
  background-color: #FF7F00;
  border-color: #FF7F00;
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
  color: var(--warning-orange);
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
  color: var(--warning-orange);
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
  border-color: var(--warning-orange);
  box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.file-help {
  display: block;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
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

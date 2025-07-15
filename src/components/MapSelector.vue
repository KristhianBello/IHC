<template>
  <div class="map-selector">
    <div class="map-container">
      <div ref="mapContainer" class="map"></div>
    </div>
    <div class="map-controls">
      <input 
        type="text" 
        v-model="searchLocation" 
        @keyup.enter="searchPlace"
        placeholder="Buscar ubicación..."
        class="search-input"
      />
      <button @click="searchPlace" class="search-btn">🔍</button>
    </div>
    <div class="selected-location" v-if="selectedLocation">
      <p><strong>Ubicación seleccionada:</strong></p>
      <p>{{ selectedLocation.address }}</p>
      <p class="coordinates">Lat: {{ selectedLocation.lat }}, Lng: {{ selectedLocation.lng }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'

// Props
const props = defineProps({
  initialLocation: {
    type: Object,
    default: () => ({ lat: -2.1499, lng: -79.9663 }) // Guayaquil, Ecuador por defecto
  },
  modelValue: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'locationSelected'])

// Reactive variables
const mapContainer = ref(null)
const searchLocation = ref('')
const selectedLocation = ref(props.modelValue)
const map = ref(null)
const marker = ref(null)

// Initialize map
onMounted(() => {
  // Import CSS
  import('leaflet/dist/leaflet.css')
  
  // Initialize map
  map.value = L.map(mapContainer.value).setView([props.initialLocation.lat, props.initialLocation.lng], 13)
  
  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)
  
  // Add click event to map
  map.value.on('click', onMapClick)
  
  // Set initial location if provided
  if (props.modelValue) {
    setMarker(props.modelValue.lat, props.modelValue.lng, props.modelValue.address)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

// Watch for changes in modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== selectedLocation.value) {
    selectedLocation.value = newValue
    setMarker(newValue.lat, newValue.lng, newValue.address)
  }
})

// Handle map click
function onMapClick(e) {
  const lat = e.latlng.lat
  const lng = e.latlng.lng
  
  // Get address from coordinates (reverse geocoding)
  getAddressFromCoords(lat, lng)
}

// Set marker on map
function setMarker(lat, lng, address) {
  // Remove existing marker
  if (marker.value) {
    map.value.removeLayer(marker.value)
  }
  
  // Add new marker
  marker.value = L.marker([lat, lng]).addTo(map.value)
  
  // Set popup
  if (address) {
    marker.value.bindPopup(address).openPopup()
  }
  
  // Center map on marker
  map.value.setView([lat, lng], 15)
}

// Get address from coordinates
async function getAddressFromCoords(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const data = await response.json()
    const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    
    const location = {
      lat: lat,
      lng: lng,
      address: address
    }
    
    selectedLocation.value = location
    setMarker(lat, lng, address)
    
    // Emit events
    emit('update:modelValue', location)
    emit('locationSelected', location)
  } catch (error) {
    console.error('Error getting address:', error)
    const location = {
      lat: lat,
      lng: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
    
    selectedLocation.value = location
    setMarker(lat, lng, location.address)
    
    emit('update:modelValue', location)
    emit('locationSelected', location)
  }
}

// Search for a place
async function searchPlace() {
  if (!searchLocation.value.trim()) return
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation.value)}`)
    const data = await response.json()
    
    if (data.length > 0) {
      const place = data[0]
      const lat = parseFloat(place.lat)
      const lng = parseFloat(place.lon)
      const address = place.display_name
      
      const location = {
        lat: lat,
        lng: lng,
        address: address
      }
      
      selectedLocation.value = location
      setMarker(lat, lng, address)
      
      emit('update:modelValue', location)
      emit('locationSelected', location)
    } else {
      alert('No se encontró la ubicación')
    }
  } catch (error) {
    console.error('Error searching place:', error)
    alert('Error al buscar la ubicación')
  }
}
</script>

<style scoped>
.map-selector {
  margin: 1rem 0;
}

.map-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  height: 300px;
  width: 100%;
}

.map-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-btn {
  padding: 0.5rem 1rem;
  background-color: #2E8B57;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #3CB371;
}

.selected-location {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #2E8B57;
}

.selected-location p {
  margin: 0.25rem 0;
}

.coordinates {
  font-size: 0.8rem;
  color: #666;
}
</style>

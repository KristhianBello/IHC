import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SolicitudAdopcion from '@/components/Solicitud.vue'
import Foro from '@/components/Foro.vue'
import RegisterView from '@/views/RegisterView.vue'
import AdoptionsView from '@/views/AdoptionsView.vue'
import ReportView from '@/views/ReportView.vue'
import TaskScheduleView from '@/views/TaskScheduleView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import CompanionsView from '@/views/CompanionsView.vue'
import GalleryView from '@/views/GalleryView.vue'
import MapView from '@/views/MapView.vue'
import SuggestionForm from '@/components/SuggestionForm.vue'


const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/foro',
    name: 'foro',
    component: Foro,
  },
  {
    path: '/solicitud',
    name: 'Solicitud',
    component: SolicitudAdopcion,
  },
  {
    path: '/adopciones',
    name: 'adopciones',
    component: AdoptionsView,
  },
  {
    path: '/registro',
    name: 'registro',
    component: RegisterView,
  },
  {
    path: '/reportar',
    name: 'reportar',
    component: ReportView,
  },
  {
    path: '/programar-tareas',
    name: 'programar-tareas',
    component: TaskScheduleView,
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: UserProfileView,
  },
  {
    path: '/compañeros',
    name: 'compañeros',
    component: CompanionsView,
  },
  {
    path: '/galeria',
    name: 'galeria',
    component: GalleryView,
  },
  {
    path: '/mapa',
    name: 'mapa',
    component: MapView,
  },
  {
    path: '/sugerencias',
    name: 'sugerencias',
    component: SuggestionForm,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

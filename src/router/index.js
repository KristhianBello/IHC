import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SolicitudAdopcion from '@/components/Solicitud.vue'
import Foro from '@/components/Foro.vue'
import RegisterView from '@/views/RegisterView.vue'
import AdoptionsView from '@/views/AdoptionsView.vue'


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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Characters from '../views/Characters.vue'
import Stats from '../views/stats.vue'
import Login from '../views/Login.vue'
import Register from '../views/register.vue'
import '../assets/main.css'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/characters',
    name: 'Characters',
    component: Characters
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

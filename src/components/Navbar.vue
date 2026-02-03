<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50
           flex justify-around items-center
           bg-red-500 text-white
           py-2 shadow-lg"
  >
    <!-- USUARIO -->
    <div
      v-if="usuario"
      class="flex flex-col items-center text-xs font-bold"
    >
      <i class="fas fa-user-circle text-xl"></i>
      <span>{{ usuario.nombre }}</span>
    </div>

    <!-- BATALLA -->
    <router-link
      to="/"
      class="flex flex-col items-center gap-1 text-xs font-bold
             hover:text-yellow-300 transition"
    >
      <i class="fas fa-bolt text-xl"></i>
      <span>Batalla</span>
    </router-link>

    <!-- POKEDEX -->
    <router-link
      to="/characters"
      class="flex flex-col items-center gap-1 text-xs font-bold
             hover:text-yellow-300 transition"
    >
      <i class="fas fa-book text-xl"></i>
      <span>Pokedex</span>
    </router-link>

    <!-- ESTADÍSTICAS -->
    <router-link
      to="/stats"
      class="flex flex-col items-center gap-1 text-xs font-bold
             hover:text-yellow-300 transition"
    >
      <i class="fas fa-chart-bar text-xl"></i>
      <span>Stats</span>
    </router-link>

    <!-- LOGOUT -->
    <button
      v-if="usuario"
      @click="cerrarSesion"
      title="Cerrar sesión"
      class="hover:text-gray-200 transition"
    >
      <i class="fas fa-sign-out-alt text-xl"></i>
    </button>

    <!-- LOGIN -->
    <router-link
      v-else
      to="/login"
      class="flex flex-col items-center gap-1 text-xs font-bold
             hover:text-yellow-300 transition"
    >
      <i class="fas fa-user-shield text-xl"></i>
      <span>Login</span>
    </router-link>
  </nav>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const usuario = ref(null)
const router = useRouter()

const cargarUsuario = () => {
  const data = localStorage.getItem('usuario')
  usuario.value = data ? JSON.parse(data) : null
}

const cerrarSesion = () => {
  localStorage.removeItem('usuario')
  usuario.value = null
  router.push('/login')
}

onMounted(() => {
  cargarUsuario()

  router.afterEach(() => {
    cargarUsuario()
  })
})
</script>

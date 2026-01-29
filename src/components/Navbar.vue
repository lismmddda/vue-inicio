<template>
  <nav class="navbar">
    <!-- USUARIO -->
    <div v-if="usuario" class="user">
      <i class="fas fa-user-circle"></i>
      <span>{{ usuario.nombre }}</span>
    </div>

    <!-- BATALLA -->
    <router-link to="/">
      <i class="fas fa-bolt"></i>
      <span>Batalla</span>
    </router-link>

    <router-link to="/characters">
      <i class="fas fa-book"></i>
      <span>Pokedex</span>
    </router-link>

    <router-link to="/stats">
      <i class="fas fa-chart-bar"></i>
      <span>Estadísticas</span>
    </router-link>

    <!-- LOGOUT -->
    <button
      v-if="usuario"
      class="logout"
      @click="cerrarSesion"
      title="Cerrar sesión"
    >
      <i class="fas fa-sign-out-alt"></i>
    </button>

    <!-- LOGIN (solo si NO está logueado) -->
    <router-link v-else to="/login">
      <i class="fas fa-user-shield"></i>
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

  // 🔄 Detecta cambios de ruta (login / logout)
  router.afterEach(() => {
    cargarUsuario()
  })
})
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #ef5350;
  padding: 10px;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 13px;
}

a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-size: 13px;
}

.logout {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.logout i {
  font-size: 20px;
}

i {
  font-size: 20px;
}
</style>

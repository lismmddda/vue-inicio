<template>
  <div class="login-wrapper">
    <div class="login-container">
      <h1 class="titulo">
        <i class="bi bi-box-arrow-in-right"></i> Acceso
      </h1>

      <form @submit.prevent="login">
        <!-- EMAIL -->
        <div class="input-group">
          <i class="bi bi-envelope-fill icon"></i>
          <input
            type="email"
            v-model="email"
            placeholder="Correo electrónico"
            required
          />
        </div>

        <!-- PASSWORD -->
        <div class="input-group">
          <i class="bi bi-lock-fill icon"></i>
          <input
            :type="mostrarPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Contraseña"
            required
          />
          <i
            class="bi eye"
            :class="mostrarPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
            @click="togglePassword"
          ></i>
        </div>

        <!-- BOTÓN LOGIN -->
        <button type="submit" class="btn-login">
          <i class="bi bi-door-open-fill"></i> Iniciar sesión
        </button>
      </form>

      <p class="mensaje">{{ mensaje }}</p>

      <!-- REGISTRO -->
      <div class="registro">
        <p>¿No tienes cuenta?</p>
        <router-link to="/register" class="btn-register">
          <i class="bi bi-person-plus-fill"></i> Registrarse
        </router-link>
      </div>

      <router-link to="/" class="volver">
        <i class="bi bi-arrow-left"></i> Volver al inicio
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const mensaje = ref('')
const mostrarPassword = ref(false)

const togglePassword = () => {
  mostrarPassword.value = !mostrarPassword.value
}

const login = async () => {
  mensaje.value = ''

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!data.ok) {
      mensaje.value = '❌ Credenciales incorrectas'
      return
    }

    // ✅ Guarda el usuario logueado
    localStorage.setItem('usuario', JSON.stringify(data.user))

    mensaje.value = `✅ Bienvenido ${data.user.nombre}`

    // ✅ Redirige al inicio
    router.push('/')
  } catch (error) {
    mensaje.value = '❌ Error al conectar con el servidor'
    console.error(error)
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
  font-family: Arial, sans-serif;
}

.login-container {
  background: white;
  padding: 35px;
  width: 100%;
  max-width: 380px;
  border-radius: 18px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  text-align: center;
}

.titulo {
  margin-bottom: 25px;
  color: #ef5350;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 0 12px;
  margin-bottom: 18px;
}

.icon {
  font-size: 1.2rem;
  color: #ef5350;
  margin-right: 8px;
}

.eye {
  font-size: 1.2rem;
  color: #777;
  cursor: pointer;
}

input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 14px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #ef5350;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 16px;
}

.btn-login:hover {
  background: #d32f2f;
}

.mensaje {
  margin-top: 15px;
  font-weight: bold;
}

.registro {
  margin-top: 20px;
}

.btn-register {
  display: inline-block;
  margin-top: 8px;
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border-radius: 12px;
  font-weight: bold;
  text-decoration: none;
}

.btn-register:hover {
  background: #388e3c;
}

.volver {
  display: block;
  margin-top: 20px;
  text-decoration: none;
  font-weight: bold;
  color: #333;
}
</style>

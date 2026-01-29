<template>
  <div class="register-wrapper">
    <div class="register-container">
      <h2 class="titulo">
        <i class="bi bi-controller"></i> Registro de Jugador
      </h2>

      <form @submit.prevent="registrarUsuario" class="formulario">

        <!-- Nombre -->
        <div class="input-group">
          <i class="bi bi-person-fill icon"></i>
          <input v-model="nombre" type="text" placeholder="Nombre" required />
        </div>

        <!-- Apellido paterno -->
        <div class="input-group">
          <i class="bi bi-person-badge-fill icon"></i>
          <input v-model="ap" type="text" placeholder="Apellido paterno" required />
        </div>

        <!-- Apellido materno -->
        <div class="input-group">
          <i class="bi bi-person-badge icon"></i>
          <input v-model="am" type="text" placeholder="Apellido materno" required />
        </div>

        <!-- Email -->
        <div class="input-group">
          <i class="bi bi-envelope-fill icon"></i>
          <input v-model="email" type="email" placeholder="Correo electrónico" required />
        </div>

        <!-- Password -->
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

        <button type="submit">
          <i class="bi bi-check-circle-fill"></i> Registrarse
        </button>
      </form>

      <p class="mensaje">{{ mensaje }}</p>

      <router-link to="/login" class="link">
        <i class="bi bi-box-arrow-in-right"></i> ¿Ya tienes cuenta?
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nombre = ref('')
const ap = ref('')
const am = ref('')
const email = ref('')
const password = ref('')
const mensaje = ref('')
const mostrarPassword = ref(false)

const togglePassword = () => {
  mostrarPassword.value = !mostrarPassword.value
}

const registrarUsuario = async () => {
  mensaje.value = 'Registrando... ⏳'

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: nombre.value,
        ap: ap.value,
        am: am.value,
        email: email.value,
        password: password.value,
        rol: 'jugador'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      mensaje.value = `❌ ${data.message}`
      return
    }

    mensaje.value = '✅ Registro exitoso'

    setTimeout(() => {
      router.push('/login')
    }, 1200)

  } catch (error) {
    console.error(error)
    mensaje.value = '❌ Error al conectar con el servidor'
  }
}
</script>

<style scoped>
/* Fondo amigable */
.register-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

/* Card */
.register-container {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 30px;
  border-radius: 18px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

/* Título */
.titulo {
  text-align: center;
  margin-bottom: 20px;
  color: #ef5350;
}

/* Formulario */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Grupo input */
.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 0 12px;
  width: 100%;
  box-sizing: border-box;
}

/* Iconos */
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

/* Input */
input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 0;
  width: 100%;
  box-sizing: border-box;
}

/* Botón */
button {
  margin-top: 10px;
  padding: 14px;
  background: #ef5350;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #e53935;
}

/* Mensaje */
.mensaje {
  margin-top: 12px;
  text-align: center;
  font-weight: bold;
}

/* Link */
.link {
  display: block;
  margin-top: 12px;
  text-align: center;
  color: #ef5350;
  text-decoration: none;
  font-weight: bold;
}
</style>

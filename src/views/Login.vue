<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] font-sans">
    <div class="bg-white p-9 w-full max-w-[380px] rounded-[18px] shadow-2xl text-center">

      <h1 class="mb-6 text-[#ef5350] text-2xl font-bold flex items-center justify-center gap-2">
        <i class="bi bi-box-arrow-in-right"></i>
        Acceso
      </h1>

      <form @submit.prevent="login" class="space-y-4">

        <!-- EMAIL -->
        <div class="flex items-center border border-gray-300 rounded-xl px-3">
          <i class="bi bi-envelope-fill text-[#ef5350] text-lg mr-2"></i>
          <input
            type="email"
            v-model="email"
            placeholder="Correo electrónico"
            required
            class="flex-1 py-3 outline-none text-sm"
          />
        </div>

        <!-- PASSWORD -->
        <div class="flex items-center border border-gray-300 rounded-xl px-3">
          <i class="bi bi-lock-fill text-[#ef5350] text-lg mr-2"></i>

          <input
            :type="mostrarPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Contraseña"
            required
            class="flex-1 py-3 outline-none text-sm"
          />

          <i
            class="bi cursor-pointer text-gray-500 text-lg"
            :class="mostrarPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
            @click="togglePassword"
          ></i>
        </div>

        <!-- BOTÓN LOGIN -->
        <button
          type="submit"
          class="w-full py-3 bg-[#ef5350] hover:bg-[#d32f2f] text-white font-bold rounded-xl text-lg transition"
        >
          <i class="bi bi-door-open-fill"></i>
          Iniciar sesión
        </button>

      </form>

      <!-- MENSAJE -->
      <p class="mt-4 font-bold text-red-600">
        {{ mensaje }}
      </p>

      <!-- REGISTRO -->
      <div class="mt-5">
        <p class="mb-2">¿No tienes cuenta?</p>

        <router-link
          to="/register"
          class="inline-block px-5 py-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded-xl transition"
        >
          <i class="bi bi-person-plus-fill"></i>
          Registrarse
        </router-link>
      </div>

      <!-- VOLVER -->
      <router-link
        to="/"
        class="block mt-5 font-bold text-gray-700 hover:underline"
      >
        <i class="bi bi-arrow-left"></i>
        Volver al inicio
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
      mensaje.value = ' Credenciales incorrectas'
      return
    }


    localStorage.setItem('usuario', JSON.stringify(data.user))

    mensaje.value = ` Bienvenido ${data.user.nombre}`

    router.push('/')
  } catch (error) {
    mensaje.value = 'Error al conectar con el servidor'
    console.error(error)
  }
}
</script>


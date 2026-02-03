<template>
  <!-- CONTENEDOR -->
  <div class="min-h-screen pt-[90px] px-5 font-sans">

    <!-- ARENA -->
    <div
      v-if="enBatalla && jugador && rival"
      class="flex justify-between items-end p-8 min-h-[340px] rounded-2xl
             bg-gradient-to-t from-green-500 via-green-400 to-sky-300
             shadow-inner"
    >
      <!-- LADO JUGADOR -->
      <div class="flex flex-col items-center self-end text-center">
        <h3 class="font-bold mb-2">
          {{ usuarioLogueado?.nombre }}
        </h3>

        <img
          :src="jugador.imagen"
          class="w-[120px] drop-shadow-xl scale-x-[-1]"
        />

        <h4 class="font-bold mt-2">{{ jugador.nombre }}</h4>
        <p>{{ jugador.vida }}</p>

        <button
          class="mt-3 px-10 py-3 text-lg rounded-xl
                 bg-red-500 text-white font-bold
                 animate-pulse disabled:opacity-50"
          @click="atacarJugador"
          :disabled="turno !== 'jugador'"
        >
          Atacar
        </button>
      </div>

      <div class="text-2xl font-bold self-center">VS</div>

      <!-- LADO PC -->
      <div class="flex flex-col items-center self-start text-center">
        <h3 class="font-bold mb-2">Oponente</h3>

        <img
          :src="rival.imagen"
          class="w-[120px] drop-shadow-xl"
        />

        <h4 class="font-bold mt-2">{{ rival.nombre }}</h4>
        <p>{{ rival.vida }}</p>

        <button
          class="mt-3 px-10 py-3 text-lg rounded-xl
                 bg-gray-400 text-white cursor-not-allowed"
          disabled
        >
          Atacar
        </button>
      </div>
    </div>

    <!-- MENSAJE -->
    <p class="text-center text-xl font-bold mt-5">
      {{ mensaje }}
    </p>

    <!-- MODO SELECCIONADO -->
    <p
      v-if="modoSeleccionado"
      class="text-center mt-3 font-bold text-lg"
    >
      🎮 Modo seleccionado:
      <span class="text-yellow-600">
        {{ modoSeleccionado === '1v1' ? '1 vs 1' : 'Equipos' }}
      </span>
    </p>

    <!-- VOLVER -->
    <div v-if="batallaTerminada" class="flex justify-center mt-6">
      <button
        class="px-10 py-3 text-lg rounded-xl
               bg-yellow-400 hover:bg-yellow-500
               text-black font-bold animate-pulse"
        @click="reiniciarBatalla"
      >
        Volver a batallar
      </button>
    </div>

    <!-- ZONA INFERIOR -->
    <div
      v-if="!enBatalla && !batallaTerminada"
      class="fixed bottom-8 left-1/2 -translate-x-1/2
             flex items-center gap-8"
    >
      <!-- AMIGOS -->
      <div
        class="text-5xl cursor-pointer animate-bounce text-blue-600"
        @click="mostrarAmigos = true"
      >
        <i class="bi bi-people-fill"></i>
      </div>

      <!-- BOTÓN BATALLA -->
      <button
        class="px-10 py-3 text-lg rounded-xl
               bg-yellow-400 hover:bg-yellow-500
               text-black font-bold animate-pulse
               disabled:opacity-50"
        @click="iniciarBatalla"
        :disabled="!modoSeleccionado || !usuarioLogueado"
      >
        Iniciar Batalla
      </button>

      <!-- MODO -->
      <div
        class="text-5xl cursor-pointer animate-bounce text-purple-600"
        @click="abrirModal"
      >
        <i class="bi bi-controller"></i>
      </div>
    </div>

    <!-- MODAL MODOS -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center"
    >
      <div
        class="bg-gradient-to-br from-yellow-400 to-orange-500
               p-6 rounded-2xl w-[300px]"
      >
        <h2 class="text-center font-bold mb-4 text-lg">
          Modos de juego
        </h2>

        <div
          class="bg-white p-4 rounded-xl flex justify-between
                 cursor-pointer mb-4 hover:bg-yellow-100"
          @click="seleccionarModo('1v1')"
        >
          <span class="font-bold">1 vs 1</span>
          <i class="bi bi-trophy-fill text-2xl text-yellow-500"></i>
        </div>

        <div
          class="bg-white p-4 rounded-xl flex justify-between
                 cursor-pointer mb-4 hover:bg-yellow-100"
          @click="seleccionarModo('equipos')"
        >
          <span class="font-bold">Equipos</span>
          <i class="bi bi-people-fill text-2xl text-blue-600"></i>
        </div>

        <button
          class="w-full px-8 py-3 bg-red-500 text-white
                 font-bold rounded-xl"
          @click="mostrarModal = false"
        >
          Cancelar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import socket from '@/socket'

const router = useRouter()

/* ===============================
   ESTADOS USUARIO / SOCKET
=============================== */
const usuarioLogueado = ref(null)
const usuarios = ref([]) // usuarios ONLINE (socket)

/* ===============================
   ESTADOS DE BATALLA
=============================== */
const jugador = ref(null)
const rival = ref(null)

const enBatalla = ref(false)
const batallaTerminada = ref(false)
const mostrarModal = ref(false)

/* 🔥 MODO DE JUEGO */
const modoSeleccionado = ref(null) // '1v1' | 'equipos'

const mostrarAmigos = ref(false)

const mensaje = ref('')
const iconoModo = ref('⚔️')
const turno = ref('jugador')

/* ===============================
   AMIGOS
=============================== */
const amigosIds = ref([])

const amigosOnline = computed(() => {
  return usuarios.value.filter(u =>
    amigosIds.value.includes(u.id)
  )
})

onMounted(async () => {
  const usuarioLS = localStorage.getItem('usuario')

  if (!usuarioLS) {
    mensaje.value = 'Debes iniciar sesión'
    setTimeout(() => router.push('/login'), 1500)
    return
  }

  usuarioLogueado.value = JSON.parse(usuarioLS)

  await cargarAmigos()

  socket.connect()
  socket.emit('registrar', usuarioLogueado.value.id)

  socket.on('lista-usuarios', data => {
    usuarios.value = data.filter(
      u => u.id !== usuarioLogueado.value.id
    )
  })

  socket.on('invitacion-recibida', invitacion => {
    localStorage.setItem('invitacion', JSON.stringify(invitacion))
    router.push('/invitaciones')
  })
})

onUnmounted(() => {
  socket.off('lista-usuarios')
  socket.off('invitacion-recibida')
})

/* ===============================
   API AMIGOS
=============================== */
const cargarAmigos = async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/amigos/${usuarioLogueado.value.id}`
    )
    amigosIds.value = await res.json()
  } catch (err) {
    console.error('Error cargando amigos', err)
  }
}

/* ===============================
   INVITAR AMIGO
=============================== */
const invitar = (usuario) => {
  socket.emit('enviar-invitacion', {
    de: usuarioLogueado.value,
    para: usuario
  })
}

/* ===============================
   POKÉMON
=============================== */
const cargarPokemon = async (nombre) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
  const data = await res.json()

  return {
    nombre: data.name,
    vida: data.stats.find(s => s.stat.name === 'hp').base_stat * 2,
    ataque: data.stats.find(s => s.stat.name === 'attack').base_stat,
    defensa: data.stats.find(s => s.stat.name === 'defense').base_stat,
    imagen: data.sprites.front_default
  }
}

/* ===============================
   MODOS
=============================== */
const abrirModal = () => {
  mostrarModal.value = true
}

const seleccionarModo = (modo) => {
  modoSeleccionado.value = modo

  if (modo === '1v1') {
    iconoModo.value = '🏆'
  }

  if (modo === 'equipos') {
    iconoModo.value = '👥'
  }

  mensaje.value = '' // evita textos duplicados
  mostrarModal.value = false
}

/* ===============================
   BATALLA
=============================== */
const iniciarBatalla = async () => {
  if (!modoSeleccionado.value) {
    mensaje.value = 'Selecciona un modo de juego'
    return
  }

  const j = JSON.parse(localStorage.getItem('pokemonJugador'))
  const r = JSON.parse(localStorage.getItem('pokemonPC'))

  if (!j || !r) {
    mensaje.value = 'Selecciona Pokémon'
    return
  }

  jugador.value = await cargarPokemon(j.name)
  rival.value = await cargarPokemon(r.name)

  turno.value = 'jugador'
  enBatalla.value = true
  batallaTerminada.value = false
  mensaje.value = `Turno de ${usuarioLogueado.value.nombre}`
}

const atacarJugador = () => {
  if (turno.value !== 'jugador') return

  rival.value.vida -= Math.max(5, jugador.value.ataque / 3)
  if (rival.value.vida <= 0) terminar('🏆 Ganaste')

  turno.value = 'pc'
  setTimeout(atacarRival, 1000)
}

const atacarRival = () => {
  jugador.value.vida -= Math.max(5, rival.value.ataque / 3)
  if (jugador.value.vida <= 0) terminar('Perdiste')

  turno.value = 'jugador'
}

const terminar = (msg) => {
  mensaje.value = msg
  enBatalla.value = false
  batallaTerminada.value = true
}

const reiniciarBatalla = () => {
  jugador.value = null
  rival.value = null
  enBatalla.value = false
  batallaTerminada.value = false
  mensaje.value = ''
}
</script>




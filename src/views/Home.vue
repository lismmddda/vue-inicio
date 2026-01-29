<template>

  <!-- CONTENEDOR -->
  <div class="contenedor">

    <!-- ARENA -->
<div v-if="enBatalla && jugador && rival" class="arena">
  <!-- LADO JUGADOR -->
  <div class="lado usuario">
    <h3> {{ usuarioLogueado?.nombre }}</h3>

    <img :src="jugador.imagen" class="pokemon jugador-img" />
    <h4>{{ jugador.nombre }}</h4>
    <p>{{ jugador.vida }}</p>

    <button
      class="btn-batalla"
      @click="atacarJugador"
      :disabled="turno !== 'jugador'"
    >
      Atacar
    </button>
  </div>

  <div class="vs">VS</div>

  <!-- LADO PC -->
  <div class="lado pc">
    <h3> Oponente</h3>

    <img :src="rival.imagen" class="pokemon pc-img" />
    <h4>{{ rival.nombre }}</h4>
    <p>❤️ {{ rival.vida }}</p>

    <button class="btn-batalla" disabled>Atacar</button>
  </div>
</div>

    <!-- MENSAJE -->
    <p class="mensaje">{{ mensaje }}</p>

    <!-- VOLVER A BATALLAR -->
    <div v-if="batallaTerminada" class="reintentar">
      <button class="btn-batalla animar-boton" @click="reiniciarBatalla">
         Volver a batallar
      </button>
    </div>

    <!-- ZONA INFERIOR -->
<div v-if="!enBatalla && !batallaTerminada" class="zona-inferior">

  <!-- ICONO AMIGOS (IZQUIERDA) -->
  <div class="icono animar-icono" @click="mostrarAmigos = true">
    Amigos
  </div>

  <!-- BOTÓN BATALLA (CENTRO) -->
  <button
    class="btn-batalla animar-boton"
    @click="iniciarBatalla"
    :disabled="!modoSeleccionado || !usuarioLogueado"
  >
    Iniciar Batalla
  </button>

  <!-- ICONO MODO (DERECHA) -->
  <div class="iconos-modo">
    <div class="icono animar-icono" @click="abrirModal">
      {{ iconoModo }}
    </div>
  </div>

</div>

    <!-- MODAL -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-box animar-modal">
        <h2>Modos de juego</h2>

        <div class="card" @click="seleccionarModo">
          <span>1 vs 1</span>
          <span class="trofeo">🏆</span>
        </div>

        <button class="btn-batalla" @click="mostrarModal = false">
          Cancelar
        </button>
      </div>
    </div>
<!-- MODAL AMIGOS -->
<!-- MODAL AMIGOS -->
<div v-if="mostrarAmigos" class="modal">
  <div class="modal-box animar-modal">
    <h2>Amigos en línea</h2>

    <p v-if="amigosOnline.length === 0">
      No hay amigos en línea todavía
    </p>

    <div
      v-for="u in amigosOnline"
      :key="u.id"
      class="card"
      @click="invitar(u)"
    >
      <span>{{ u.nombre }}</span>
      <span>⚔️</span>
    </div>

    <button class="btn-batalla" @click="mostrarAmigos = false">
      Cerrar
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
const modoSeleccionado = ref(false)
const mostrarAmigos = ref(false)

const mensaje = ref('')
const iconoModo = ref('⚔️')
const turno = ref('jugador')

/* ===============================
   AMIGOS
=============================== */
const amigosIds = ref([])

/* 👉 SOLO AMIGOS QUE ESTÁN ONLINE */
const amigosOnline = computed(() => {
  return usuarios.value.filter(u =>
    amigosIds.value.includes(u.id)
  )
})

/* ===============================
   SESIÓN + SOCKET
=============================== */
onMounted(async () => {
  const usuarioLS = localStorage.getItem('usuario')

  if (!usuarioLS) {
    mensaje.value = '⚠️ Debes iniciar sesión'
    setTimeout(() => router.push('/login'), 1500)
    return
  }

  usuarioLogueado.value = JSON.parse(usuarioLS)

  /* 🔎 CARGAR AMIGOS */
  await cargarAmigos()

  /* 🔌 SOCKET */
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
    amigosIds.value = await res.json() // [2,3,5...]
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
const abrirModal = () => mostrarModal.value = true

const seleccionarModo = () => {
  iconoModo.value = '🏆'
  modoSeleccionado.value = true
  mensaje.value = 'Modo 1 vs 1 seleccionado'
  mostrarModal.value = false
}

/* ===============================
   BATALLA LOCAL
=============================== */
const iniciarBatalla = async () => {
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
  if (jugador.value.vida <= 0) terminar('💀 Perdiste')

  turno.value = 'jugador'
}

const terminar = (msg) => {
  mensaje.value = msg
  enBatalla.value = false
  batallaTerminada.value = true
}
</script>




<style scoped>
/* NAVBAR */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ef5350;
  display: flex;
  justify-content: space-around;
  padding: 10px;
  z-index: 1000;
}

.navbar a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-size: 13px;
}

.navbar i {
  font-size: 20px;
}

/* CONTENEDOR */
.contenedor {
  min-height: 100vh;
  padding: 90px 20px 20px;
  font-family: Arial, sans-serif;
}

/* ICONOS GRANDES (LO ÚNICO AGREGADO) */
.icono {
  font-size: 48px;
  cursor: pointer;
  user-select: none;
}

/* ANIMACIONES */
.animar-boton {
  animation: pulse 2s infinite;
}

.animar-icono {
  animation: flotar 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes flotar {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

/* ARENA REALISTA */
.arena {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 30px;
  min-height: 340px;
  background: linear-gradient(to top, #4caf50 40%, #81d4fa 60%);
  border-radius: 20px;
  box-shadow: inset 0 -10px 20px rgba(0,0,0,0.2);
}

.usuario {
  align-self: flex-end;
}

.pc {
  align-self: flex-start;
}

.pokemon {
  width: 120px;
  filter: drop-shadow(0 10px 10px rgba(0,0,0,0.4));
}

.jugador-img {
  transform: scaleX(-1);
}

.vs {
  font-size: 28px;
  font-weight: bold;
}

/* MENSAJE */
.mensaje {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
}

/* ZONA INFERIOR */
.zona-inferior {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-batalla {
  padding: 15px 40px;
  font-size: 18px;
  border-radius: 12px;
  cursor: pointer;
}

/* MODAL */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  background: linear-gradient(135deg, #ffcb05, #ff9800);
  padding: 25px;
  border-radius: 20px;
  width: 300px;
}

.animar-modal {
  animation: zoom 0.3s ease;
}

@keyframes zoom {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.card {
  background: white;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  cursor: pointer;
}

.trofeo {
  font-size: 26px;
}
.zona-inferior {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
}

</style>

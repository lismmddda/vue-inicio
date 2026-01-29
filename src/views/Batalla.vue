<template>
  <div>
    <h2>Batalla 1 vs 1</h2>

    <p v-if="turno === usuario.id">Tu turno 🧑</p>
    <p v-else>Turno del rival 🤖</p>

    <button @click="atacar" :disabled="turno !== usuario.id">
      Atacar
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import socket from '@/socket'

const sala = JSON.parse(localStorage.getItem('sala'))
const jugador = ref(sala.jugador1)
const rival = ref(sala.jugador2)

onMounted(() => {
  socket.emit('unirse-sala', sala.id)
})
</script>

<template>
  <h2>Batalla 1 vs 1</h2>

  <div class="vs">
    <div>
      <h3>{{ jugador.nombre }}</h3>
    </div>

    <strong>VS</strong>

    <div>
      <h3>{{ rival.nombre }}</h3>
    </div>
  </div>
</template>


<template>
  <div>
    <h2>Historial</h2>

    <div v-for="h in historial" :key="h.id">
      Batalla #{{ h.id }} - Ganador: {{ h.ganador }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const usuario = JSON.parse(localStorage.getItem('usuario'))
const historial = ref([])

onMounted(async () => {
  const res = await axios.get(
    `http://localhost:3000/api/historial/${usuario.id}`
  )
  historial.value = res.data
})
</script>

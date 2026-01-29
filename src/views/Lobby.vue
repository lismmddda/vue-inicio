<template>
  <div class="pantalla">
    <h2>Jugadores en línea</h2>

    <div v-for="u in usuarios" :key="u.id" class="card">
      <span>{{ u.nombre }}</span>
      <button @click="invitar(u.id)">Invitar 1 vs 1</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import socket from '@/socket'
import axios from 'axios'

const usuarios = ref([])
const usuario = JSON.parse(localStorage.getItem('usuario'))

onMounted(async () => {
  socket.emit('registrar', usuario.id)

  const res = await axios.get('http://localhost:3000/api/usuarios/online')
  usuarios.value = res.data.filter(u => u.id !== usuario.id)
})

const invitar = async (to) => {
  await axios.post('http://localhost:3000/api/invitaciones', {
    from: usuario.id,
    to
  })
  alert('Invitación enviada ⚔️')
}
</script>

<style scoped>
.card {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  margin: 10px 0;
  background: #eee;
  border-radius: 10px;
}
</style>

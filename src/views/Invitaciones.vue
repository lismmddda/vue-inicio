<template>
  <div>
    <h2>Invitaciones</h2>

    <div v-for="i in invitaciones" :key="i.id" class="card">
      <span>{{ i.nombre }} te invita</span>
      <button @click="aceptar(i.id)">Aceptar</button>
    </div>
  </div>
</template>

<script setup>
import socket from '@/socket'
import { useRouter } from 'vue-router'

const router = useRouter()
const invitacion = JSON.parse(localStorage.getItem('invitacion'))

const aceptar = () => {
  socket.emit('aceptar-invitacion', invitacion)
}

socket.on('sala-creada', sala => {
  localStorage.setItem('sala', JSON.stringify(sala))
  router.push('/batalla')
})
</script>

<template>
  <h2>Invitación</h2>
  <p>{{ invitacion.de.nombre }} te invita a jugar</p>

  <button @click="aceptar">Aceptar</button>
</template>


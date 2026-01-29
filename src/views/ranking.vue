<template>
  <div>
    <h2>Ranking</h2>

    <div v-for="r in ranking" :key="r.nombre">
      🏅 {{ r.nombre }} - {{ r.victorias }} victorias
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const ranking = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/ranking')
  ranking.value = res.data
})
</script>

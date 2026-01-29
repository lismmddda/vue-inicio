<template>
  <div class="contenedor">
    <h1 class="titulo">📜 Movimientos</h1>

    <!-- SIN POKEMON -->
    <p v-if="!pokemonJugador" class="alerta">
      Primero selecciona un Pokémon en la Pokédex
    </p>

    <!-- INFO POKEMON -->
    <div v-if="pokemonJugador" class="pokemon-info">
      <img :src="pokemonJugador.imagen" />
      <h2>{{ pokemonJugador.name }}</h2>
      <p>Selecciona hasta 4 movimientos</p>
    </div>

    <!-- LISTA MOVIMIENTOS -->
    <div class="moves-grid" v-if="movimientos.length">
      <div
        v-for="m in movimientos"
        :key="m.move.name"
        class="move-card"
        :class="{ activo: seleccionados.includes(m.move.name) }"
        @click="toggleMove(m.move.name)"
      >
        {{ m.move.name }}
      </div>
    </div>

    <!-- SELECCION -->
    <p class="contador">
      Movimientos seleccionados: {{ seleccionados.length }}/4
    </p>

    <!-- BOTONES -->
    <button
      class="btn-guardar"
      :disabled="seleccionados.length === 0"
      @click="guardarMovimientos"
    >
      Guardar movimientos
    </button>

    <router-link to="/" class="btn-ir">
      Ir a Batalla ⚔️
    </router-link>

    <router-link to="/characters" class="volver">
      ⬅ Volver a Pokédex
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pokemonJugador = ref(null)
const movimientos = ref([])
const seleccionados = ref([])

/* TOGGLE MOVE */
const toggleMove = (move) => {
  if (seleccionados.value.includes(move)) {
    seleccionados.value = seleccionados.value.filter(m => m !== move)
    return
  }

  if (seleccionados.value.length >= 4) return

  seleccionados.value.push(move)
}

/* GUARDAR */
const guardarMovimientos = () => {
  localStorage.setItem(
    'movesJugador',
    JSON.stringify(seleccionados.value)
  )
  alert('Movimientos guardados')
}

/* LOAD */
onMounted(async () => {
  const jugador = localStorage.getItem('pokemonJugador')
  if (!jugador) return

  pokemonJugador.value = JSON.parse(jugador)

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonJugador.value.id}`
  )
  const data = await res.json()

  movimientos.value = data.moves.slice(0, 20)

  const guardados = localStorage.getItem('movesJugador')
  if (guardados) {
    seleccionados.value = JSON.parse(guardados)
  }
})
</script>

<style scoped>
.contenedor {
  min-height: 100vh;
  padding: 20px;
  background: #f2f2f2;
  text-align: center;
}

.titulo {
  margin-bottom: 15px;
}

/* INFO */
.pokemon-info img {
  width: 120px;
}

/* MOVES */
.moves-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.move-card {
  background: white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  text-transform: capitalize;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
}

.move-card.activo {
  background: #4caf50;
  color: white;
}

/* BOTONES */
.btn-guardar {
  background: #ffcb05;
  border: none;
  padding: 12px 25px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 10px;
}

.btn-ir {
  display: block;
  margin: 10px 0;
  padding: 10px;
  background: #ef5350;
  color: white;
  border-radius: 12px;
  text-decoration: none;
}

.volver {
  display: block;
  margin-top: 15px;
  font-weight: bold;
  text-decoration: none;
}

.alerta {
  color: red;
  font-weight: bold;
}
</style>

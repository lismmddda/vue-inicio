<template>
  <div class="stats-page">
    <h1> Estadísticas Pokémon</h1>

    <!-- GRID -->
    <div class="pokemon-grid">
      <div
        v-for="p in pokemons"
        :key="p.id"
        class="pokemon-card"
        @click="openModal(p)"
      >
        <img :src="p.sprites.front_default" />
        <h3>{{ p.name }}</h3>

        <div class="types">
          <span
            v-for="t in p.types"
            :key="t.type.name"
            class="type"
          >
            {{ t.type.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- VER MAS -->
    <button class="btn-cargar" @click="cargarMas" :disabled="cargando">
      {{ cargando ? 'Cargando...' : 'Ver más Pokémon' }}
    </button>

    <!-- MODAL -->
    <div v-if="selectedPokemon" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <button class="close" @click="closeModal">✖</button>

        <h2>{{ selectedPokemon.name }}</h2>
        <img
          :src="selectedPokemon.sprites.front_default"
          class="modal-img"
        />

        <!-- REGION -->
        <p class="region">
           Región: <strong>{{ region }}</strong>
        </p>

        <!-- TIPOS -->
        <div class="types">
          <span
            v-for="t in selectedPokemon.types"
            :key="t.type.name"
            class="type"
          >
            {{ t.type.name }}
          </span>
        </div>

        <!-- EVOLUCION -->
        <p class="evo">
          Evolución:
          <strong>
            {{ evoluciona ? 'Sí evoluciona' : 'No evoluciona' }}
          </strong>
        </p>

        <!-- HABILIDADES -->
        <h3>Habilidades</h3>
        <ul class="abilities">
          <li
            v-for="a in selectedPokemon.abilities"
            :key="a.ability.name"
          >
            {{ a.ability.name }}
          </li>
        </ul>

        <!-- STATS -->
        <h3>Estadísticas</h3>
        <div class="stats">
          <div
            v-for="s in selectedPokemon.stats"
            :key="s.stat.name"
          >
            <label>{{ s.stat.name.toUpperCase() }}</label>
            <div class="bar">
              <div
                class="bar-fill"
                :style="{ width: s.base_stat + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <button class="btn-cerrar" @click="closeModal">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pokemons = ref([])
const offset = ref(0)
const limit = 10
const cargando = ref(false)

const selectedPokemon = ref(null)
const evoluciona = ref(false)
const region = ref('')

/* CARGAR POKEMON */
const cargarMas = async () => {
  cargando.value = true

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset.value}`
  )
  const data = await res.json()

  for (const p of data.results) {
    const r = await fetch(p.url)
    const pokemon = await r.json()
    pokemons.value.push(pokemon)
  }

  offset.value += limit
  cargando.value = false
}

/* MODAL */
const openModal = async (pokemon) => {
  selectedPokemon.value = pokemon
  evoluciona.value = false
  region.value = ''

  /* SPECIES */
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`
  )
  const species = await res.json()

  /* REGION POR GENERACION */
  const regiones = {
    'generation-i': 'Kanto',
    'generation-ii': 'Johto',
    'generation-iii': 'Hoenn',
    'generation-iv': 'Sinnoh',
    'generation-v': 'Unova',
    'generation-vi': 'Kalos',
    'generation-vii': 'Alola',
    'generation-viii': 'Galar',
    'generation-ix': 'Paldea'
  }

  region.value = regiones[species.generation.name] || 'Desconocida'

  /* EVOLUTION CHAIN */
  const evoRes = await fetch(species.evolution_chain.url)
  const evoData = await evoRes.json()

  evoluciona.value =
    evoData.chain.evolves_to &&
    evoData.chain.evolves_to.length > 0
}

const closeModal = () => {
  selectedPokemon.value = null
}

onMounted(() => {
  cargarMas()
})
</script>

<style scoped>
.stats-page {
  padding: 15px;
  text-align: center;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.pokemon-card {
  background: white;
  border-radius: 15px;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,.1);
  cursor: pointer;
}

.pokemon-card img {
  width: 80px;
}

.types {
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-bottom: 5px;
}

.type {
  background: #eee;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 11px;
  text-transform: capitalize;
}

.region {
  margin: 8px 0;
  font-weight: bold;
}

.abilities {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.abilities li {
  text-transform: capitalize;
}

.btn-cargar {
  margin: 15px 0;
  padding: 12px 30px;
  background: #ffcb05;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 16px;
}

.close {
  float: right;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.modal-img {
  width: 120px;
  margin: 10px 0;
}

.evo {
  margin: 10px 0;
  font-weight: bold;
}

/* STATS */
.bar {
  background: #ddd;
  height: 8px;
  border-radius: 10px;
  margin-bottom: 6px;
}

.bar-fill {
  background: #ef5350;
  height: 100%;
}

.btn-cerrar {
  width: 100%;
  margin-top: 10px;
  background: #ffcb05;
  border: none;
  padding: 10px;
  border-radius: 12px;
  font-weight: bold;
}
</style>

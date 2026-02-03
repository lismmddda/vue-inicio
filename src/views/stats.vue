<template>
  <div class="p-4 text-center min-h-screen bg-gray-100">

    <!-- TÍTULO -->
    <h1 class="text-2xl font-bold mb-4">
      <i class="bi bi-bar-chart-fill me-1"></i>
      Estadísticas Pokémon
    </h1>

    <!-- GRID -->
    <div
      class="grid gap-4"
      style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));"
    >
      <div
        v-for="p in pokemons"
        :key="p.id"
        @click="openModal(p)"
        class="bg-white rounded-2xl p-3 shadow-md cursor-pointer
               transition hover:scale-105"
      >
        <img
          :src="p.sprites.front_default"
          class="mx-auto w-20"
        />

        <h3 class="font-bold capitalize mt-1">
          {{ p.name }}
        </h3>

        <!-- TIPOS -->
        <div class="flex gap-1 justify-center mt-1">
          <span
            v-for="t in p.types"
            :key="t.type.name"
            class="bg-gray-200 px-2 py-1 rounded-full text-[11px] capitalize"
          >
            {{ t.type.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- VER MÁS -->
    <button
      @click="cargarMas"
      :disabled="cargando"
      class="mt-4 px-8 py-3 rounded-xl font-bold
             bg-yellow-400 hover:bg-yellow-500 transition
             disabled:opacity-50"
    >
      <i class="bi bi-arrow-repeat me-1"></i>
      {{ cargando ? 'Cargando...' : 'Ver más Pokémon' }}
    </button>

    <!-- MODAL -->
    <div
      v-if="selectedPokemon"
      class="fixed inset-0 bg-black/60
             flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div
        class="bg-white w-[90%] max-w-[400px]
               max-h-[90vh] overflow-y-auto
               p-5 rounded-2xl relative"
      >
        <!-- CERRAR -->
        <button
          @click="closeModal"
          class="absolute top-3 right-3 text-lg"
        >
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- INFO -->
        <h2 class="text-xl font-bold capitalize">
          {{ selectedPokemon.name }}
        </h2>

        <img
          :src="selectedPokemon.sprites.front_default"
          class="mx-auto w-32 my-2"
        />

        <!-- REGION -->
        <p class="my-2 font-bold">
          Región:
          <strong>{{ region }}</strong>
        </p>

        <!-- TIPOS -->
        <div class="flex gap-2 justify-center mb-2">
          <span
            v-for="t in selectedPokemon.types"
            :key="t.type.name"
            class="bg-gray-200 px-2 py-1 rounded-full text-xs capitalize"
          >
            {{ t.type.name }}
          </span>
        </div>

        <!-- EVOLUCIÓN -->
        <p class="my-2 font-bold">
          Evolución:
          <strong>
            {{ evoluciona ? 'Sí evoluciona' : 'No evoluciona' }}
          </strong>
        </p>

        <!-- HABILIDADES -->
        <h3 class="font-bold mt-3">Habilidades</h3>
        <ul class="my-2">
          <li
            v-for="a in selectedPokemon.abilities"
            :key="a.ability.name"
            class="capitalize text-sm"
          >
            • {{ a.ability.name }}
          </li>
        </ul>

        <!-- STATS -->
        <h3 class="font-bold mt-3">Estadísticas</h3>
        <div class="mt-2">
          <div
            v-for="s in selectedPokemon.stats"
            :key="s.stat.name"
            class="mb-2"
          >
            <label class="text-xs font-bold">
              {{ s.stat.name.toUpperCase() }}
            </label>

            <div class="bg-gray-300 h-2 rounded-full">
              <div
                class="bg-red-500 h-2 rounded-full"
                :style="{ width: s.base_stat + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- CERRAR -->
        <button
          @click="closeModal"
          class="w-full mt-4 py-3 rounded-xl font-bold
                 bg-yellow-400 hover:bg-yellow-500 transition"
        >
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


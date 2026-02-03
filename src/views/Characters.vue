<template>
  <div class="min-h-screen p-5 bg-gray-100 text-center font-sans">

    <!-- TÍTULO -->
    <h1 class="mb-4 text-2xl font-bold">
      <i class="bi bi-collection me-1"></i>
      Pokédex
    </h1>

    <!-- USUARIO LOGUEADO -->
    <div
      v-if="usuarioLogueado"
      class="mb-3 inline-flex items-center gap-2
             bg-white px-4 py-2 rounded-xl shadow-md text-sm"
    >
      <i class="bi bi-person-circle text-lg"></i>
      <span>
        Jugador actual:
        <strong>{{ usuarioLogueado.nombre }}</strong>
      </span>
    </div>

    <!-- GRID POKEDEX -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="p in pokemons"
        :key="p.id"
        @click="abrirModal(p)"
        class="bg-white rounded-2xl p-3 shadow-md cursor-pointer
               transition hover:scale-105"
        :class="{
          'border-4 border-green-500': esSeleccionado(p.id)
        }"
      >
        <img
          :src="p.sprites.front_default"
          class="mx-auto w-[90px]"
        />

        <p class="font-bold capitalize mt-2">
          {{ p.name }}
        </p>

        <span class="text-xs text-gray-500">
          #{{ p.id }}
        </span>
      </div>
    </div>

    <!-- BOTÓN CARGAR -->
    <button
      class="mt-4 px-8 py-3 text-lg rounded-xl bg-yellow-400
             hover:bg-yellow-500 transition disabled:opacity-50"
      @click="cargarMas"
      :disabled="cargando"
    >
      <i class="bi bi-arrow-repeat me-1"></i>
      {{ cargando ? 'Cargando...' : 'Cargar más Pokémon' }}
    </button>

    <!-- MODAL -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      @click.self="cerrarModal"
    >
      <div
        class="bg-white w-[90%] max-w-[500px] max-h-[90vh]
               overflow-y-auto p-5 rounded-2xl relative"
      >
        <!-- CERRAR -->
        <button
          class="absolute top-3 right-3 text-lg"
          @click="cerrarModal"
        >
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- INFO POKEMON -->
        <div
          v-if="pokemonSeleccionado"
          class="text-center"
        >
          <img
            :src="pokemonSeleccionado.sprites.front_default"
            class="mx-auto w-[120px]"
          />

          <h2 class="text-xl font-bold capitalize">
            {{ pokemonSeleccionado.name }}
          </h2>

          <p class="text-sm mt-1">
            Selecciona hasta 4 movimientos
          </p>
        </div>

        <!-- MOVIMIENTOS -->
        <div class="grid grid-cols-2 gap-3 my-4">
          <div
            v-for="m in movimientos"
            :key="m.move.name"
            @click="toggleMove(m.move.name)"
            class="bg-gray-200 p-2 rounded-xl cursor-pointer
                   capitalize text-sm transition"
            :class="{
              'bg-green-500 text-white':
                movimientosSeleccionados.includes(m.move.name)
            }"
          >
            {{ m.move.name }}
          </div>
        </div>

        <!-- CONTADOR -->
        <p class="font-bold mb-3">
          <i class="bi bi-check2-circle me-1"></i>
          Seleccionados: {{ movimientosSeleccionados.length }}/4
        </p>

        <!-- GUARDAR -->
        <button
          class="sticky bottom-2 px-6 py-3 rounded-xl bg-yellow-400
                 hover:bg-yellow-500 transition"
          @click="guardarSeleccion"
        >
          <i class="bi bi-save me-1"></i>
          Guardar selección
        </button>
      </div>
    </div>

    <!-- VOLVER -->
    <router-link
      to="/"
      class="block mt-4 font-bold hover:underline"
    >
      <i class="bi bi-arrow-left"></i>
      Volver
    </router-link>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'

/* =======================
   USUARIO LOGUEADO
======================= */
const usuarioLogueado = ref(null)

/* =======================
   ESTADOS
======================= */
const pokemons = ref([])              // grid visible
const pokedexNacional = ref([])       // lista nacional completa
const offset = ref(0)
const limit = 5
const cargando = ref(false)

const mostrarModal = ref(false)
const pokemonSeleccionado = ref(null)

const movimientos = ref([])
const movimientosSeleccionados = ref([])

const tipoSeleccion = ref('jugador') // jugador | amigo
const totalPokemons = ref(null)



const obtenerTotal = async () => {
  try {
    const guardado = localStorage.getItem('totalPokemons')
    if (guardado) {
      totalPokemons.value = Number(guardado)
      return
    }

    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1')
    const data = await res.json()

    totalPokemons.value = data.count
    localStorage.setItem('totalPokemons', data.count)

  } catch (err) {
    console.warn('No se pudo obtener total (offline)', err)
  }
}



const cargarMas = async () => {

  if (
    totalPokemons.value &&
    pokemons.value.length >= totalPokemons.value
  ) {
    console.log(' Todos los Pokémon ya fueron cargados')
    return
  }

  if (!navigator.onLine && pokedexNacional.value.length === 0) {
    console.warn(' Sin conexión y sin datos cacheados')
    return
  }

  if (cargando.value) return
  cargando.value = true

  try {


    if (pokedexNacional.value.length === 0) {
      const res = await fetch(
        'https://pokeapi.co/api/v2/pokedex/national'
      )
      const data = await res.json()
      pokedexNacional.value = data.pokemon_entries
    }

    const slice = pokedexNacional.value.slice(
      offset.value,
      offset.value + limit
    )

    const nuevos = await Promise.all(
      slice.map(async (entry) => {
        const r = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${entry.entry_number}`
        )
        const full = await r.json()

        return {
          id: entry.entry_number,
          name: full.name,
          sprites: {
            front_default: full.sprites.front_default
          },
          moves: full.moves
        }
      })
    )

    pokemons.value.push(...nuevos)
    offset.value += limit

  } catch (error) {
    console.error('Error cargando Pokémon', error)
  } finally {
    cargando.value = false
  }
}


const abrirModal = async (pokemon) => {
  pokemonSeleccionado.value = pokemon
  mostrarModal.value = true

  const movesKey =
    tipoSeleccion.value === 'jugador'
      ? 'movesJugador'
      : 'movesAmigo'

  movimientosSeleccionados.value =
    JSON.parse(localStorage.getItem(movesKey)) || []

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
    )
    const data = await res.json()
    movimientos.value = data.moves.slice(0, 20)
  } catch {
    movimientos.value = []
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}



const toggleMove = (move) => {
  if (movimientosSeleccionados.value.includes(move)) {
    movimientosSeleccionados.value =
      movimientosSeleccionados.value.filter(m => m !== move)
    return
  }

  if (movimientosSeleccionados.value.length >= 4) return
  movimientosSeleccionados.value.push(move)
}


/* =======================
   GUARDAR SELECCIÓN
======================= */
const guardarSeleccion = () => {
  const pokemonKey =
    tipoSeleccion.value === 'jugador'
      ? 'pokemonJugador'
      : 'pokemonAmigo'

  const movesKey =
    tipoSeleccion.value === 'jugador'
      ? 'movesJugador'
      : 'movesAmigo'

  localStorage.setItem(
    pokemonKey,
    JSON.stringify({
      id: pokemonSeleccionado.value.id,
      name: pokemonSeleccionado.value.name,
      imagen: pokemonSeleccionado.value.sprites.front_default
    })
  )

  localStorage.setItem(
    movesKey,
    JSON.stringify(movimientosSeleccionados.value)
  )

  cerrarModal()
}



const esSeleccionado = (id) => {
  const jugador = JSON.parse(localStorage.getItem('pokemonJugador'))
  const amigo = JSON.parse(localStorage.getItem('pokemonAmigo'))
  return jugador?.id === id || amigo?.id === id
}


/* =======================
   INIT
======================= */
onMounted(async () => {

  await obtenerTotal()
  await cargarMas()

  const user = localStorage.getItem('usuario')
  if (user) usuarioLogueado.value = JSON.parse(user)
})
</script>




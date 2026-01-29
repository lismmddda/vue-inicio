<template>
  <div class="contenedor">
    <h1 class="titulo">📟 Pokédex</h1>

    <!-- JUGADOR ACTUAL -->
    <div v-if="usuarioLogueado" class="usuario-logueado">
      👤 Jugador actual:
      <strong>{{ usuarioLogueado.nombre }}</strong>
    </div>

    <!-- GRID POKEDEX -->
    <div class="pokedex">
      <div
        v-for="p in pokemons"
        :key="p.id"
        class="pokemon-card"
        :class="{ seleccionado: esSeleccionado(p.id) }"
        @click="abrirModal(p)"
      >
        <img :src="p.sprites.front_default" />
        <p class="nombre">{{ p.name }}</p>
        <span class="id">#{{ p.id }}</span>
      </div>
    </div>

    <!-- BOTON CARGAR -->
    <button class="btn-cargar" @click="cargarMas" :disabled="cargando">
      {{ cargando ? 'Cargando...' : 'Cargar más Pokémon' }}
    </button>

    <!-- MODAL -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <button class="cerrar" @click="cerrarModal">✖</button>

        <div v-if="pokemonSeleccionado" class="pokemon-info">
          <img :src="pokemonSeleccionado.sprites.front_default" />
          <h2>{{ pokemonSeleccionado.name }}</h2>
          <p>Selecciona hasta 4 movimientos</p>
        </div>

        <!-- MOVIMIENTOS -->
        <div class="moves-grid">
          <div
            v-for="m in movimientos"
            :key="m.move.name"
            class="move-card"
            :class="{ activo: movimientosSeleccionados.includes(m.move.name) }"
            @click="toggleMove(m.move.name)"
          >
            {{ m.move.name }}
          </div>
        </div>

        <p class="contador">
          Seleccionados: {{ movimientosSeleccionados.length }}/4
        </p>

        <button class="btn-guardar" @click="guardarSeleccion">
          Guardar selección
        </button>
      </div>
    </div>

    <router-link to="/" class="volver">⬅ Volver</router-link>
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



<style scoped>

.contenedor {
  min-height: 100vh;
  padding: 20px;
  background: #f2f2f2;
  text-align: center;
  font-family: Arial, sans-serif;
}

.titulo {
  margin-bottom: 15px;
}

.selector button {
  margin: 5px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: #ddd;
}

.selector .activo {
  background: #4caf50;
  color: white;
}

.pokedex {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.pokemon-card {
  background: white;
  border-radius: 15px;
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  cursor: pointer;
}

.pokemon-card.seleccionado {
  border: 3px solid #4caf50;
}

.pokemon-card img {
  width: 90px;
}

.nombre {
  font-weight: bold;
  text-transform: capitalize;
}

.id {
  font-size: 12px;
  color: gray;
}

.btn-cargar {
  margin: 15px 0;
  padding: 12px 30px;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: #ffcb05;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 16px;
  position: relative;
}

.cerrar {
  position: sticky;
  top: 10px;
  float: right;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.moves-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.move-card {
  background: #f2f2f2;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  text-transform: capitalize;
}

.move-card.activo {
  background: #4caf50;
  color: white;
}

.contador {
  font-weight: bold;
}

.btn-guardar {
  background: #ffcb05;
  border: none;
  padding: 12px 25px;
  border-radius: 12px;
  cursor: pointer;
  position: sticky;
  bottom: 10px;
}

.volver {
  display: block;
  margin-top: 15px;
  font-weight: bold;
  text-decoration: none;
}
.usuario-logueado {
  margin-bottom: 12px;
  font-size: 15px;
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

</style>

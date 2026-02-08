# 🕵️ Impostor

Juego de deducción social estilo Among Us para jugar con amigos. Pasa el teléfono y descubre quién es el impostor.

## 📋 Descripción

**Impostor** es un juego de deducción social donde los jugadores deben descubrir quién es el impostor entre ellos. El juego está diseñado para jugarse localmente en un solo dispositivo, pasando el teléfono entre los participantes.

### Cómo se juega

1. **Setup**: Los jugadores se agregan y se selecciona una categoría
2. **Reveal**: Cada jugador ve su rol (Tripulante o Impostor) y la palabra secreta (solo tripulantes)
3. **Play**: Los jugadores discuten y tienen turnos para hablar
4. **Vote**: Todos votan juntos quién creen que es el impostor
5. **Result**: Se revela el ganador, el impostor y la palabra secreta

## ✨ Características

- 🎮 **Juego local**: Sin necesidad de conexión a internet
- 📱 **Mobile-first**: Diseñado para jugarse en móviles
- 🎯 **Múltiples modos de pista**:
  - Sin pistas: El impostor no recibe ayuda
  - Pista fácil: El impostor recibe una palabra similar
  - Pista difícil: El impostor solo recibe el nombre de la categoría
- ⏱️ **Sistema de turnos**: Con timers individuales y de ronda
- 🗳️ **Votación grupal**: Todos votan juntos en una sola decisión
- 🎨 **UI moderna**: Interfaz limpia con shadcn/ui y Tailwind CSS
- 🔒 **Anti-spoiler**: Sistema de "mantener presionado" para revelar información

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Validación**: Zod
- **Animaciones**: Framer Motion
- **Notificaciones**: Sonner (toast)

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Rutas de Next.js (App Router)
│   ├── page.tsx          # Página principal (Home)
│   ├── game/
│   │   └── page.tsx      # Página del juego (/game)
│   ├── layout.tsx        # Layout principal con fondo radial
│   └── globals.css       # Estilos globales y tema oscuro
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── premium-card.tsx  # Card con estilo glass premium
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── sonner.tsx    # Toast notifications
│   └── common/           # Componentes compartidos
├── features/
│   └── game/
│       ├── models/       # Modelos Zod y tipos TypeScript
│       │   ├── player.ts
│       │   ├── settings.ts
│       │   ├── phase.ts
│       │   └── category.ts
│       ├── store/        # Store Zustand
│       │   └── useGameStore.ts  # Store principal del juego
│       └── logic/        # Funciones puras de lógica
│           ├── random.ts
│           ├── game-helpers.ts
│           ├── avatars.ts
│           ├── turns.ts
│           └── votes.ts
├── data/
│   ├── game-categories.ts    # Metadata de categorías
│   ├── words-by-category.ts  # Re-export de palabras/pares
│   ├── avatars.ts            # Catálogo de avatares
│   └── words/                # Dataset en JSON por categoría
│       ├── index.ts          # Exporta WORDS_BY_CATEGORY y SIMILAR_PAIRS_BY_CATEGORY
│       ├── types.ts          # Tipos TypeScript
│       ├── {category}.words.json   # Palabras por categoría
│       └── {category}.pairs.json   # Pares similares por categoría
└── lib/
    ├── constants.ts      # Constantes de la app
    └── utils.ts          # Utilidades (cn helper)
```

## 🗺️ Estructura de Rutas (App Router)

El proyecto usa **Next.js 16 App Router** con la siguiente estructura:

### Rutas principales

- **`/`** (`src/app/page.tsx`): Página de inicio
  - Muestra el título, descripción y botón "Crear partida"
  - Redirige a `/game` al hacer clic

- **`/game`** (`src/app/game/page.tsx`): Página principal del juego
  - Componente cliente que renderiza diferentes fases según el estado
  - Fases: `setup`, `reveal`, `play`, `vote`, `result`

### Layout global

- **`src/app/layout.tsx`**: Layout raíz
  - Configuración de fuentes (Geist Sans, Geist Mono)
  - Fondo radial oscuro: `bg-[radial-gradient(circle_at_top,_#0f172a,_#0b1220_40%,_#050a14)]`
  - Contenedor mobile-first: `max-w-md mx-auto px-4 pt-6 pb-24`
  - Integración de `Toaster` para notificaciones

## 🗄️ Store de Zustand

El estado global del juego está gestionado por **Zustand** en:

**`src/features/game/store/useGameStore.ts`**

### Estado (`GameState`)

```typescript
interface GameState {
  phase: GamePhase                    // Fase actual del juego
  players: Player[]                   // Lista de jugadores
  settings: GameSettings              // Configuración de la partida
  secretWord: string | null          // Palabra secreta para la tripulación
  impostorId: string | null          // ID del jugador impostor
  impostorHintWord: string | null     // Pista de palabra (modo easy_similar)
  impostorHintCategoryName: string | null  // Nombre de categoría (modo hard_category)
}
```

### Acciones principales (`GameActions`)

- `setPlayers(players)`: Establece y valida jugadores
- `setSettings(partial)`: Actualiza configuración
- `setPlayerAvatar(playerId, avatar)`: Asigna avatar a jugador
- `createGame()`: Inicializa la partida (elige impostor, palabras, etc.)
- `revealNext()`: Avanza al siguiente jugador en fase reveal
- `nextTurn()`: Rota turnos en fase play
- `startVote()`: Inicia fase de votación
- `selectVote(playerId)`: Selecciona jugador para votar
- `confirmVote()`: Confirma voto y calcula resultado
- `reset()`: Reinicia el juego a fase setup

### Uso en componentes

```typescript
import { useGameStore } from "@/features/game/store/useGameStore"

// Obtener estado
const phase = useGameStore((state) => state.phase)
const players = useGameStore((state) => state.players)

// Obtener acciones
const createGame = useGameStore((state) => state.createGame)
const reset = useGameStore((state) => state.reset)
```

## 📚 Carga de Categorías y Palabras

El sistema de categorías está separado en dos partes:

### 1. Metadata de Categorías

**`src/data/game-categories.ts`**

Define la información de cada categoría:
- `id`: Identificador único (`CategoryId`)
- `label`: Nombre para mostrar
- `emoji`: Ícono emoji
- `description`: Descripción de la categoría

```typescript
export const GAME_CATEGORIES: readonly GameCategory[] = [
  { id: "food", label: "Comida", emoji: "🍕", ... },
  { id: "movies", label: "Películas", emoji: "🎬", ... },
  // ...
]
```

### 2. Dataset de Palabras (JSON)

**`src/data/words/`**

Estructura modular con archivos JSON separados por categoría:

- **`{category}.words.json`**: Array de palabras simples
- **`{category}.pairs.json`**: Array de pares similares `{crew, impostor}`

**`src/data/words/index.ts`** importa todos los JSON y exporta:

```typescript
export const WORDS_BY_CATEGORY: WordsByCategory
export const SIMILAR_PAIRS_BY_CATEGORY: SimilarPairsByCategory
```

### 3. Re-export para compatibilidad

**`src/data/words-by-category.ts`** re-exporta desde `words/` para mantener compatibilidad con imports existentes.

### Uso en el Store

El store carga las palabras así:

```typescript
import { WORDS_BY_CATEGORY, SIMILAR_PAIRS_BY_CATEGORY } from "@/data/words-by-category"
import { getCategoryById } from "@/data/game-categories"

// En createGame():
const category = getCategoryById(settings.categoryId as CategoryId)
const words = WORDS_BY_CATEGORY[categoryId]
const pairs = SIMILAR_PAIRS_BY_CATEGORY[categoryId]
```

### Agregar nuevas categorías

1. Agregar metadata en `src/data/game-categories.ts`
2. Crear archivos JSON en `src/data/words/`:
   - `{nueva_categoria}.words.json`
   - `{nueva_categoria}.pairs.json`
3. Importar y agregar en `src/data/words/index.ts`

## 🚀 Instalación y Uso

### Requisitos previos

- Node.js 20 o superior
- npm, yarn, pnpm o bun

### Instalación

```bash
# Instalar dependencias
npm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 🎯 Reglas del Juego

### Configuración

- **Jugadores**: Mínimo 3, máximo 20
- **Categorías**: Selecciona una categoría con palabras o pares
- **Modo de pista**: Elige el nivel de dificultad para el impostor

### Fases del Juego

1. **Setup**: Agrega jugadores y configura la partida
2. **Reveal**: Cada jugador ve su rol de forma privada
3. **Play**: Discusión con turnos y timer
4. **Vote**: Votación grupal para expulsar al impostor
5. **Result**: Resultado final y revelación

### Ganador

- **Tripulación gana**: Si votan correctamente al impostor
- **Impostor gana**: Si votan a alguien incorrecto o hacen skip

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la app para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🎨 Personalización

### Agregar Categorías

1. **Agregar metadata** en `src/data/game-categories.ts`:
   ```typescript
   {
     id: "nueva_categoria",
     label: "Nueva Categoría",
     emoji: "🎯",
     description: "Descripción de la categoría"
   }
   ```

2. **Crear archivos JSON** en `src/data/words/`:
   - `nueva_categoria.words.json`: Array de palabras `["palabra1", "palabra2", ...]`
   - `nueva_categoria.pairs.json`: Array de pares `[{crew: "...", impostor: "..."}, ...]`

3. **Actualizar `src/data/words/index.ts`**:
   ```typescript
   import nuevaCategoriaWords from "./nueva_categoria.words.json"
   import nuevaCategoriaPairs from "./nueva_categoria.pairs.json"
   
   export const WORDS_BY_CATEGORY: WordsByCategory = {
     // ...
     nueva_categoria: nuevaCategoriaWords as readonly string[],
   }
   
   export const SIMILAR_PAIRS_BY_CATEGORY: SimilarPairsByCategory = {
     // ...
     nueva_categoria: nuevaCategoriaPairs as readonly SimilarPair[],
   }
   ```

### Modificar Configuración

Las constantes del juego están en `src/lib/constants.ts`:
- `MIN_PLAYERS`: Mínimo de jugadores (default: 3)
- `MAX_PLAYERS`: Máximo de jugadores (default: 20)
- `DEFAULT_ROUND_SECONDS`: Duración de la ronda (default: 480)
- `DEFAULT_TURN_SECONDS`: Duración del turno (default: 30)

## 🔒 Características de Seguridad

- **Anti-spoiler**: Sistema de "mantener presionado" para revelar información
- **Validación**: Todos los inputs se validan con Zod
- **Type Safety**: TypeScript strict mode sin `any`

## 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (iOS, Android)
- ✅ Responsive design (mobile-first)

## 🤝 Contribuir

Este es un proyecto personal, pero las sugerencias y mejoras son bienvenidas.

## 📄 Licencia

Proyecto privado.

---

**Disfruta jugando Impostor con tus amigos! 🎮**

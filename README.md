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
- 📚 **8 categorías temáticas**: Comida, Películas, Objetos, Selección Argentina, Tecnología, Lugares, Anime, Cosas argentinas
- 🎭 **Selección múltiple de categorías**: Puedes activar varias categorías para mayor variedad
- 👤 **Sistema de avatares**: 13 avatares únicos para personalizar jugadores
- ⏱️ **Sistema de turnos**: Con timers individuales y de ronda configurable
- 🗳️ **Votación grupal**: Todos votan juntos en una sola decisión
- 🎨 **UI moderna**: Interfaz limpia con shadcn/ui y Tailwind CSS
- 🔒 **Anti-spoiler**: Sistema de "mantener presionado" para revelar información
- 🎨 **Diseño premium**: Cards con efecto glass y animaciones suaves

## 🛠️ Tecnologías

- **Framework**: Next.js 16.1.6 (App Router)
- **Lenguaje**: TypeScript 5 (strict mode)
- **React**: 19.2.3
- **Estilos**: Tailwind CSS 4
- **UI Components**: shadcn/ui 3.8.4 (Radix UI primitives)
- **State Management**: Zustand 5.0.11
- **Validación**: Zod 4.3.6
- **Animaciones**: Framer Motion 12.33.0
- **Notificaciones**: Sonner 2.0.7 (toast)
- **Utilidades**: nanoid, lucide-react, class-variance-authority

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

- **`/game/players`** (`src/app/game/players/page.tsx`): Configuración de jugadores
  - Agregar/eliminar jugadores
  - Asignar avatares personalizados
  - Validación de nombres únicos

- **`/game/categories`** (`src/app/game/categories/page.tsx`): Selección de categorías
  - Selección múltiple de categorías disponibles
  - Vista previa de cada categoría con emoji y descripción
  - Opciones para seleccionar todas o limpiar selección

- **`/game/duration`** (`src/app/game/duration/page.tsx`): Configuración de duración
  - Establecer duración de la ronda (en minutos)
  - Opciones predefinidas y personalización

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

**Categorías disponibles:**
- 🍕 **Comida**: Platos y alimentos conocidos
- 🎬 **Películas**: Películas populares y reconocibles
- 🧰 **Objetos**: Objetos cotidianos y cosas del día a día
- ⚽ **Selección Argentina**: Jugadores de la Selección Argentina desde 1978 hasta hoy
- 📱 **Tecnología**: Apps, dispositivos y conceptos tecnológicos
- 🌎 **Lugares**: Ciudades, países y lugares famosos
- 🍥 **Anime**: Series y personajes de anime conocidos
- 🧉 **Cosas argentinas**: Cultura, costumbres y elementos típicos de Argentina

```typescript
export const GAME_CATEGORIES: readonly GameCategory[] = [
  { id: "food", label: "Comida", emoji: "🍕", ... },
  { id: "movies", label: "Películas", emoji: "🎬", ... },
  // ... 8 categorías en total
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

- **Node.js**: 20 o superior
- **Gestor de paquetes**: npm, yarn, pnpm o bun

### Instalación

```bash
# Clonar el repositorio (si aplica)
git clone <repository-url>

# Navegar al directorio del proyecto
cd impostor

# Instalar dependencias
npm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

El servidor de desarrollo incluye:
- Hot Module Replacement (HMR)
- TypeScript type checking
- ESLint en tiempo real

### Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

### Verificación de código

```bash
# Ejecutar el linter
npm run lint
```

## 🎯 Reglas del Juego

### Configuración

- **Jugadores**: Mínimo 3, máximo 20
- **Categorías**: Selecciona una o múltiples categorías con palabras o pares
- **Duración de ronda**: Configurable (por defecto 7 minutos)
- **Duración de turno**: Configurable (por defecto 30 segundos)
- **Modo de pista**: Elige el nivel de dificultad para el impostor:
  - `none`: Sin pistas (más difícil para el impostor)
  - `easy_similar`: Palabra similar (moderado)
  - `hard_category`: Solo nombre de categoría (más fácil para el impostor)

### Fases del Juego

1. **Setup**: 
   - Agrega jugadores (con nombres únicos y avatares opcionales)
   - Selecciona categorías
   - Configura duración y modo de pista
   - Inicia la partida

2. **Reveal**: 
   - Cada jugador ve su rol de forma privada (mantener presionado para revelar)
   - Los tripulantes ven la palabra secreta
   - El impostor ve su pista según el modo seleccionado

3. **Play**: 
   - Discusión con sistema de turnos opcional
   - Timer de ronda y turno individual
   - Los jugadores pueden pasar el teléfono entre turnos

4. **Vote**: 
   - Votación grupal para expulsar al impostor
   - Selección de un jugador sospechoso
   - Confirmación del voto

5. **Result**: 
   - Resultado final y revelación del impostor
   - Muestra la palabra secreta
   - Opción para jugar de nuevo

### Ganador

- **Tripulación gana**: Si votan correctamente al impostor
- **Impostor gana**: Si votan a alguien incorrecto o hacen skip

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en modo watch |
| `npm run build` | Construye la aplicación optimizada para producción |
| `npm start` | Inicia el servidor de producción (requiere build previo) |
| `npm run lint` | Ejecuta ESLint para verificar la calidad del código |

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
- `APP_NAME`: Nombre de la aplicación ("Impostor")
- `MIN_PLAYERS`: Mínimo de jugadores (default: 3)
- `MAX_PLAYERS`: Máximo de jugadores (default: 20)
- `DEFAULT_ROUND_SECONDS`: Duración de la ronda en segundos (default: 420 = 7 minutos)
- `DEFAULT_TURN_SECONDS`: Duración del turno en segundos (default: 30)

## 🔒 Características de Seguridad y Calidad

- **Anti-spoiler**: Sistema de "mantener presionado" para revelar información sensible
- **Validación**: Todos los inputs se validan con Zod schemas
- **Type Safety**: TypeScript strict mode sin `any` ni `as any`
- **Validación de nombres**: Los nombres de jugadores deben ser únicos
- **Validación de fases**: Las transiciones de fase están validadas en el store
- **Estado inmutable**: El estado se gestiona de forma predecible con Zustand

## 📱 Compatibilidad

- ✅ **Navegadores modernos**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- ✅ **Dispositivos móviles**: iOS 12+, Android 8+
- ✅ **Responsive design**: Mobile-first con soporte para tablets y desktop
- ✅ **PWA ready**: Optimizado para funcionar como Progressive Web App

## 🏗️ Arquitectura

### Principios de diseño

- **Feature-first**: Código organizado por características, no por tipo de archivo
- **Separación de responsabilidades**: Lógica separada de UI, modelos separados de store
- **Finite State Machine**: El juego se modela como una máquina de estados finita con fases explícitas
- **Type-safe**: TypeScript strict con tipos discriminados para fases
- **Validación centralizada**: Zod schemas para validación de datos

### Flujo de datos

```
UI Components → Zustand Store → Logic Functions → Models (Zod)
```

Las acciones del store validan invariantes y gestionan transiciones de fase. La UI nunca muta el estado directamente.

## 🤝 Contribuir

Este es un proyecto personal, pero las sugerencias y mejoras son bienvenidas.

## 📄 Licencia

Proyecto privado.

---

**Disfruta jugando Impostor con tus amigos! 🎮**

---

**Disfruta jugando Impostor con tus amigos! 🎮**

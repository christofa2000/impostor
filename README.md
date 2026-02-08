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
├── app/                    # Rutas de Next.js
│   ├── page.tsx          # Página principal
│   ├── game/
│   │   └── page.tsx      # Página del juego
│   ├── layout.tsx        # Layout principal
│   └── globals.css       # Estilos globales
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   └── common/           # Componentes compartidos
├── features/
│   └── game/
│       ├── models/       # Modelos Zod y tipos TypeScript
│       ├── store/        # Store Zustand
│       └── logic/        # Funciones puras de lógica
├── data/
│   └── categories.ts     # Categorías y palabras
└── lib/
    ├── constants.ts      # Constantes de la app
    └── utils.ts          # Utilidades (cn helper)
```

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

Edita `src/data/categories.ts` para agregar nuevas categorías con palabras o pares similares.

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

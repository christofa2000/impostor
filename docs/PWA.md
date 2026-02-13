# PWA – Impostor

Configuración de la aplicación como Progressive Web App (mobile-first, instalable en Android e iOS).

## Cómo funciona el service worker

El **service worker** es un script que el navegador ejecuta en segundo plano, separado de la página. Con `next-pwa` (y Workbox):

1. **Registro**: En producción, Next.js registra `sw.js` automáticamente. El SW se descarga y se instala.
2. **Alcance**: Controla las peticiones de la app (por defecto todo el origen). Intercepta `fetch` para cachear respuestas.
3. **Precaché**: En el build se genera una lista de recursos (HTML, JS, CSS) que el SW guarda en caché en la primera visita.
4. **Runtime cache**: Las peticiones subsiguientes (navegación, API, imágenes) se sirven desde caché cuando aplica, con estrategias (network-first, cache-first, etc.).
5. **Actualizaciones**: Cuando hay un nuevo build, el SW se actualiza; con `skipWaiting: true` el nuevo SW toma el control de inmediato.

Así la app puede cargar más rápido y seguir funcionando con conexión limitada o sin red (según lo cacheado).

## Cómo funciona el manifest

El **manifest** (`/public/manifest.json`) es un JSON que describe la PWA para el navegador y el sistema operativo:

- **name / short_name**: Nombre de la app (lista de apps, pantalla de inicio).
- **start_url**: URL que se abre al lanzar la app desde el icono (`/`).
- **display: "standalone"**: La app se abre sin barra de direcciones ni controles del navegador (como una app nativa).
- **orientation, background_color, theme_color**: Cómo se muestra el splash y la barra de estado.
- **icons**: Iconos en 192px y 512px para la instalación y la pantalla de inicio.

Next.js enlaza el manifest vía `metadata.manifest` en el layout; el navegador lo usa para “Añadir a pantalla de inicio” y criterios de instalabilidad.

## Por qué `display: standalone` elimina la barra del navegador

Los modos de `display` definen qué UI del navegador se muestra:

- **browser**: Pestañas, barra de direcciones, botones (navegación normal).
- **standalone**: Sin barra de direcciones ni pestañas; solo el contenido de la app y la barra de estado del sistema. Es el modo que usan las “apps instaladas” en móvil y escritorio.

Al instalar la PWA, el sistema usa el manifest y abre `start_url` en modo `standalone`, por eso no ves la barra del navegador.

## Cómo verificar que está correctamente instalada

1. **HTTPS**: La app debe servirse por HTTPS (en local, `localhost` suele contar como seguro).
2. **Manifest válido**: En DevTools → Application → Manifest: sin errores, iconos y `display: standalone` correctos.
3. **Service worker activo**: Application → Service Workers: debe aparecer `sw.js` (o el nombre configurado) como “activated” en producción.
4. **Criterios de instalación**: En Chrome (Android/Desktop), el banner “Instalar” aparece si se cumplen los criterios (manifest, SW, HTTPS, engagement). En iOS, la instalación es manual (Compartir → Añadir a pantalla de inicio).
5. **Modo standalone**: Tras instalar, abrir la app desde el icono y comprobar que no hay barra de direcciones (Chrome Android, Safari iOS en pantalla de inicio).

## Generar iconos PWA

Los iconos `icon-192.png` e `icon-512.png` se generan con el script de proyecto:

```bash
npm run icons
```

Requiere una imagen fuente (p. ej. `scripts/detective-source.png`). El script escribe en `public/` (incluyendo `icon-192.png` e `icon-512.png`). Si faltan, el manifest los referenciará y la instalación puede fallar hasta que existan.

## Build

El service worker lo genera **next-pwa** en el build. Next.js 16 usa Turbopack por defecto; next-pwa es un plugin de webpack, por eso el script de build usa `next build --webpack`. En desarrollo el SW está desactivado (`disable: process.env.NODE_ENV === "development"`).

## Resumen de archivos

| Archivo / Lugar | Función |
|-----------------|--------|
| `next.config.ts` | `withPWA()`: genera SW solo en producción (`disable` en development). |
| `public/manifest.json` | Definición de la PWA (nombre, iconos, `display`, colores). |
| `src/app/layout.tsx` | `metadata.manifest`, `viewport` (viewport-fit, themeColor), `appleWebApp`. |
| `src/app/globals.css` | `.safe-area-padding`, `background: var(--body-gradient)`, `background-attachment: fixed`, anti scroll fantasma. |
| `src/components/pwa-install.tsx` | Botón “Instalar” (beforeinstallprompt) e instrucciones para iOS. |

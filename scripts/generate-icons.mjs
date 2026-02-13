/**
 * Genera icon.png (512x512), apple-icon.png (180x180) y favicon.ico
 * desde una imagen fuente. Fondo oscuro sólido (#0a0a0a), optimizado PNG.
 *
 * Uso: node scripts/generate-icons.mjs <ruta-imagen-fuente>
 * Ejemplo: node scripts/generate-icons.mjs ./scripts/detective-source.png
 */

import sharp from "sharp";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Uso: node scripts/generate-icons.mjs <ruta-imagen-fuente>");
  process.exit(1);
}

const DARK_BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function main() {
  const publicDir = join(root, "public");
  const appDir = join(root, "src", "app");

  const resizeOpts = (w, h) => ({
    fit: "contain",
    position: "center",
    background: DARK_BG,
  });

  // 512x512: cuadrado, fondo oscuro, RGBA para compatibilidad
  const icon512 = await sharp(sourcePath)
    .resize(512, 512, resizeOpts(512, 512))
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

  writeFileSync(join(publicDir, "icon.png"), icon512);
  writeFileSync(join(publicDir, "icon-512.png"), icon512);
  writeFileSync(join(appDir, "icon.png"), icon512);
  console.log("OK public/icon.png, public/icon-512.png y src/app/icon.png (512x512)");

  // 192x192 para PWA manifest
  const icon192 = await sharp(sourcePath)
    .resize(192, 192, resizeOpts(192, 192))
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(publicDir, "icon-192.png"), icon192);
  console.log("OK public/icon-192.png (192x192)");

  // 180x180 apple-touch-icon (RGBA)
  const icon180 = await sharp(sourcePath)
    .resize(180, 180, resizeOpts(180, 180))
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

  writeFileSync(join(publicDir, "apple-icon.png"), icon180);
  writeFileSync(join(appDir, "apple-icon.png"), icon180);
  console.log("OK public/apple-icon.png y src/app/apple-icon.png (180x180)");

  // favicon.ico: PNG 32x32 RGBA embebido (Next.js exige RGBA)
  const faviconPng = await sharp(sourcePath)
    .resize(32, 32, resizeOpts(32, 32))
    .ensureAlpha()
    .png()
    .toBuffer();

  const ico32Len = faviconPng.length;
  const ico = Buffer.concat([
    Buffer.from([0, 0, 1, 0, 1, 0]),
    Buffer.from([
      32, 32, 0, 0, 0, 0, 0, 0,
      ico32Len & 0xff, (ico32Len >> 8) & 0xff, (ico32Len >> 16) & 0xff, 0,
      22, 0, 0, 0,
    ]),
    faviconPng,
  ]);
  writeFileSync(join(publicDir, "favicon.ico"), ico);
  writeFileSync(join(appDir, "favicon.ico"), ico);
  console.log("OK public/favicon.ico y src/app/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

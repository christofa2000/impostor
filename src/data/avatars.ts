export const AVATARS = [
  "/avatars/gandalf.webp",
  "/avatars/juana.webp",
  "/avatars/kakashi.webp",
  "/avatars/legolas.webp",
  "/avatars/leia.webp",
  "/avatars/maradona.webp",
  "/avatars/micael.webp",
  "/avatars/fede.webp",
  "/avatars/arik.webp",
  "/avatars/diego.webp",
  "/avatars/seba.webp",
  "/avatars/leinad.webp",
] as const;

export type AvatarSrc = (typeof AVATARS)[number];

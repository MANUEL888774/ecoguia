/**
 * Normaliza un texto para comparación:
 * 1. Convierte a minúsculas
 * 2. Descompone caracteres acentuados (NFD)
 * 3. Elimina marcas diacríticas (tildes)
 * 4. Elimina puntuación y guiones bajos
 * 5. Colapsa espacios múltiples
 * 6. Recorta espacios al inicio y fin
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

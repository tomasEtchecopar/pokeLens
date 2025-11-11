/**
 * Utility functions for Pokemon data transformation
 */

/**
 * Translates Pokemon type names from English to Spanish
 */
export function translateType(typeName: string): string {
  const typeTranslations: { [key: string]: string } = {
    'normal': 'Normal',
    'fire': 'Fuego',
    'water': 'Agua',
    'electric': 'Eléctrico',
    'grass': 'Planta',
    'ice': 'Hielo',
    'fighting': 'Lucha',
    'poison': 'Veneno',
    'ground': 'Tierra',
    'flying': 'Volador',
    'psychic': 'Psíquico',
    'bug': 'Bicho',
    'rock': 'Roca',
    'ghost': 'Fantasma',
    'dragon': 'Dragón',
    'dark': 'Siniestro',
    'steel': 'Acero',
    'fairy': 'Hada'
  };
  return typeTranslations[typeName.toLowerCase()] || typeName;
}
export function translateGeneration(generationName: string): string {
  const generationTranslations: { [key: string]: string } = {
    'generation-i': 'Generación 1',
    'generation-ii': 'Generación 2',
    'generation-iii': 'Generación 3',
    'generation-iv': 'Generación 4',
    'generation-v': 'Generación 5',
    'generation-vi': 'Generación 6',
    'generation-vii': 'Generación 7',
    'generation-viii': 'Generación 8',
    'generation-ix': 'Generación 9'
  };
  return generationTranslations[generationName.toLowerCase()] || generationName;
}
export function translateRegion(regionName: string): string {
  const regionTranslations: { [key: string]: string } = {
    'kanto': 'Kanto',
    'johto': 'Johto',
    'hoenn': 'Hoenn',
    'sinnoh': 'Sinnoh',
    'unova': 'Teselia',
    'kalos': 'Kalos',
    'alola': 'Alola',
    'galar': 'Galar',
    'paldea': 'Paldea'
  };
  return regionTranslations[regionName.toLowerCase()] || regionName;
}
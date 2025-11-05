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
    'generation-i': 'Generación I',
    'generation-ii': 'Generación II',
    'generation-iii': 'Generación III',
    'generation-iv': 'Generación IV',
    'generation-v': 'Generación V',
    'generation-vi': 'Generación VI',
    'generation-vii': 'Generación VII',
    'generation-viii': 'Generación VIII',
    'generation-ix': 'Generación IX'
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
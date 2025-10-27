/**
 * Utility functions for Pokemon data transformation
 */

/**
 * Translates Pokemon type names from English to Spanish
 */
export function translateType(typeName: string): string {
  const typeTranslations: { [key: string]: string } = {
    'normal': 'normal',
    'fire': 'fuego',
    'water': 'agua',
    'electric': 'eléctrico',
    'grass': 'planta',
    'ice': 'hielo',
    'fighting': 'lucha',
    'poison': 'veneno',
    'ground': 'tierra',
    'flying': 'volador',
    'psychic': 'psíquico',
    'bug': 'bicho',
    'rock': 'roca',
    'ghost': 'fantasma',
    'dragon': 'dragón',
    'dark': 'siniestro',
    'steel': 'acero',
    'fairy': 'hada'
  };
  return typeTranslations[typeName.toLowerCase()] || typeName;
}


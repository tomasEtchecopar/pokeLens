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
    '1': 'Generación 1',
    '2': 'Generación 2',
    '3': 'Generación 3',
    '4': 'Generación 4',
    '5': 'Generación 5',
    '6': 'Generación 6',
    '7': 'Generación 7',
    '8': 'Generación 8',
    '9': 'Generación 9'
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

export function translateRarity(rarityName: string): string {
  const rarityTranslations: { [key: string]: string } = {
    'common': 'Común',
    'rare': 'Raro',
    'epic': 'Épico',
    'legendary': 'Legendario'
  };
  return rarityTranslations[rarityName.toLowerCase()] || rarityName;
}

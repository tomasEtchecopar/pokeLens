import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pokeImg'
})
export class PokeImgPipe implements PipeTransform {

  transform(url: string): string {
    const parts = url.split('/');
    const id = parts[parts.length - 2];
    return id ? `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${id}.png` : ' ';
  }

}

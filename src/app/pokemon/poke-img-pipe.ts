import { Pipe, PipeTransform } from '@angular/core';

/**
 * Simple pipe that converts PokeAPI resource URLs to sprite image URLs.
 * Takes a resource URL, extracts the Pokemon ID, and returns a CDN image URL.
 */
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

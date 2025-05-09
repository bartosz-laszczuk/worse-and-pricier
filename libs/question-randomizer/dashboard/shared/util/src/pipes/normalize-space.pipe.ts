import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'normalizeSpace',
})
export class NormalizeSpacePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value
      .replace(/&nbsp;/g, ' ') // replace HTML entity
      .replace(/\u00A0/g, ' '); // replace actual Unicode character
  }
}

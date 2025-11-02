import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTags',
})
export class FormatTagsPipe implements PipeTransform {
  transform(tags: string[] | undefined): string {
    if (!tags || tags.length === 0) {
      return '';
    }
    return `[${tags.join(';')}]`;
  }
}

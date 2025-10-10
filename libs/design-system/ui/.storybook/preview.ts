import type { Preview } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideQuillConfig } from 'ngx-quill/config';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideAngularSvgIcon(),
        provideQuillConfig({
          modules: {
            syntax: false,
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ header: 1 }, { header: 2 }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
            ],
          },
        }),
      ],
    }),
  ],
};

export default preview;

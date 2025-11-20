import { provideHttpClient } from '@angular/common/http';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { provideRouter } from '@angular/router';

@Injectable({ providedIn: 'root' })
class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation(): Observable<Record<string, unknown>> {
    return of({});
  }
}

/**
 * Common test providers for component tests
 * Includes HTTP, SVG icons, i18n, and Firebase mocks
 */
export function getCommonTestProviders() {
  return [
    provideHttpClient(),
    provideAngularSvgIcon(),
    provideRouter([]),
    provideTransloco({
      config: {
        availableLangs: ['en', 'pl'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true,
      },
      loader: TranslocoLoaderMock,
    }),
    {
      provide: Auth,
      useValue: {
        currentUser: null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onAuthStateChanged: () => () => {},
      },
    },
    {
      provide: Firestore,
      useValue: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        collection: (_firestore: any, _path: string) => ({}),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        doc: (_firestore: any, _path: string) => ({}),
        collectionData: () => of([]),
        docData: () => of({}),
      },
    },
    {
      provide: Storage,
      useValue: {},
    },
    {
      provide: APP_CONFIG,
      useValue: {
        firebase: {
          apiKey: 'test',
          authDomain: 'test',
          projectId: 'test',
          storageBucket: 'test',
          messagingSenderId: 'test',
          appId: 'test',
        },
        production: false,
      },
    },
  ];
}

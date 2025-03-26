// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { AppConfig } from '@my-nx-monorepo/question-randomizer-shared-util';

export const environment: AppConfig = {
  production: false,
  firebase: {
    config: {
      apiKey: 'AIzaSyD1AtRHU735g0zqtlIAOD-hrf8x69y-Bws',
      authDomain: 'question-randomizer-1cf31.firebaseapp.com',
      projectId: 'question-randomizer-1cf31',
      storageBucket: 'question-randomizer-1cf31.appspot.com',
      messagingSenderId: '673434361767',
      appId: '1:673434361767:web:37991cdc5cb877aa14e082',
    },
    actionCodeSettings: {
      url: 'http://localhost:5200/profile/new',
      handleCodeInApp: true,
    },
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

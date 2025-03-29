// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { AppConfig } from '@my-nx-monorepo/question-randomizer-shared-util';

export const environment: AppConfig = {
  production: false,
  firebase: {
    config: {
      apiKey: 'AIzaSyAdyJqiJUMsOv2B5wnFyMkPo_iYWSwVmM8',
      authDomain: 'question-randomizer-508e7.firebaseapp.com',
      projectId: 'question-randomizer-508e7',
      storageBucket: 'question-randomizer-508e7.firebasestorage.app',
      messagingSenderId: '850105983052',
      appId: '1:850105983052:web:ac5549a9b740d2966d94e9',
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

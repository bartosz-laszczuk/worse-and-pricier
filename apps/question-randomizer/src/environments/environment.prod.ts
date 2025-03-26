import { AppConfig } from '@my-nx-monorepo/question-randomizer-shared-util';

export const environment: AppConfig = {
  production: true,
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
      url: 'https://question-randomizer-1cf31.web.app/profile/new',
      handleCodeInApp: true,
    },
  },
};

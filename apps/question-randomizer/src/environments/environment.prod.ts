import { AppConfig } from '@worse-and-pricier/question-randomizer-shared-util';

export const environment: AppConfig = {
  production: true,
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
      url: 'https://question-randomizer-1cf31.web.app/dashboard/email-confirmed',
      handleCodeInApp: true,
    },
  },
};

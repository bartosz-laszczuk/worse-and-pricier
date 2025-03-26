export interface AppConfig {
  production: boolean;
  firebase: {
    config: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
    actionCodeSettings: {
      url: string;
      handleCodeInApp: boolean;
    };
  };
}

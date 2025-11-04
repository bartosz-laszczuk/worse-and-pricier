module.exports = {
  rootTranslationsPath: 'apps/question-randomizer/src/assets/i18n/',
  langs: ['en', 'pl'],
  keysManager: {
    input: [
      'apps/**/*.ts',
      'apps/**/*.html',
      'libs/**/*.ts',
      'libs/**/*.html'
    ],
    output: [
      {
        path: 'apps/question-randomizer/src/assets/i18n',
        fileFormat: 'json'
      }
    ],
    marker: 'transloco',
    addMissingKeys: true,
    emitErrorOnExtraKeys: false,
    replace: false,
    removeExtraKeys: false,
    defaultValue: '{{key}}',
    unflat: true
  }
};

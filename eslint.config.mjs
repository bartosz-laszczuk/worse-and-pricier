import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            // UI libraries can only depend on other UI and util libraries
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:styles'],
            },
            // Feature libraries can depend on UI, data-access, and util
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:ui', 'type:data-access', 'type:util'],
            },
            // Data-access can depend on other data-access and util
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:ui'],
            },
            // Shell can depend on everything except app
            {
              sourceTag: 'type:shell',
              onlyDependOnLibsWithTags: ['type:shell', 'type:feature', 'type:ui', 'type:data-access', 'type:util', 'type:styles'],
            },
            // Util can only depend on other util
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            // Styles libraries can depend on util (for tokens)
            {
              sourceTag: 'type:styles',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            // Apps can depend on everything
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            // E2E can depend on apps
            {
              sourceTag: 'type:e2e',
              onlyDependOnLibsWithTags: ['type:app'],
            },
            // Design-system meta-package can depend on ui, styles, and util
            {
              sourceTag: 'type:design-system',
              onlyDependOnLibsWithTags: ['type:ui', 'type:styles', 'type:util'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];

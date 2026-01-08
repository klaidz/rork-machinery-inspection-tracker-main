const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const expoConfigArray = Array.isArray(expoConfig) ? expoConfig : [expoConfig];

const ignores = [
  'dist/**',
  '.expo/**',
  '**/.expo/**',
  '.expo/types/**',
  '**/.expo/types/**',
  '.expo/types/router.d.ts',
  '**/.expo/types/router.d.ts',
  'expo/**',
  '**/expo/**',
  'expo/types/**',
  'expo/types/router.d.ts',
];

module.exports = defineConfig([
  {
    files: ['.expo/types/router.d.ts', '**/.expo/types/router.d.ts'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    ignores,
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  ...expoConfigArray.map((config) => {
    if (!config || typeof config !== 'object') return config;
    const existingIgnores = Array.isArray(config.ignores) ? config.ignores : [];
    return {
      ...config,
      linterOptions: {
        ...(config.linterOptions ?? {}),
        reportUnusedDisableDirectives: 'off',
      },
      ignores: [...existingIgnores, ...ignores],
    };
  }),
  {
    ignores,
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
]);

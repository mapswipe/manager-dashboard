/// <reference types="vite/client" />

type ImportMetaEnvAugmented = import('@julr/vite-plugin-validate-env').ImportMetaEnvAugmented<
  typeof import('../../env').default
>

interface ImportMetaEnv extends ImportMetaEnvAugmented {
    // The custom environment variables that are passed through the vite
    APP_COMMIT_HASH: string;
    APP_VERSION: string;
    APP_ID: string;
    APP_ENVIRONMENT_LOOSE_VALIDATION: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

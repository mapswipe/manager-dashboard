import { defineConfig, ImportMetaEnvAugmented, Schema } from '@julr/vite-plugin-validate-env';

const looseValidation = import.meta.env.APP_ENVIRONMENT_LOOSE_VALIDATION;

// TODO: Integrate .env for CI and remove optional() call on required fields
export default defineConfig({
    APP_ENVIRONMENT: Schema.string.optional(),

    APP_GRAPHQL_API_DOMAIN: looseValidation
        ? Schema.string()
        : Schema.string({ format: 'url', protocol: true, tld: false }),

    APP_SENTRY_DSN: Schema.string.optional(),
    APP_SENTRY_TRACES_SAMPLE_RATE: Schema.string.optional(),

    // Used in application, automatically injected by vite
    APP_COMMIT_HASH: Schema.string.optional(),
    APP_VERSION: Schema.string.optional(),
})

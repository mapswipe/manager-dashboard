import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

const looseValidation = import.meta.env.APP_ENVIRONMENT_LOOSE_VALIDATION;

const urlStringOptions: Parameters<typeof Schema.string>[number] = looseValidation
? {
    format: 'url',
    protocol: true,
    tld: false,
} : undefined;

// TODO: Integrate .env for CI and remove optional() call on required fields
export default defineConfig({
    APP_ENVIRONMENT: Schema.string.optional(),

    APP_REST_API_DOMAIN: Schema.string(urlStringOptions),
    APP_GRAPHQL_API_DOMAIN: Schema.string(urlStringOptions),

    APP_SENTRY_DSN: Schema.string.optional(),
    APP_SENTRY_TRACES_SAMPLE_RATE: Schema.string.optional(),
    APP_FIREBASE_API_KEY: Schema.string.optional(),
    APP_FIREBASE_AUTH_DOMAIN: Schema.string.optional(),
    APP_FIREBASE_PROJECT_ID: Schema.string.optional(),
    APP_FIREBASE_AUTH_EMULATOR_URL: Schema.string.optional(urlStringOptions),

    APP_MAPILLARY_API_KEY: Schema.string.optional(),
})

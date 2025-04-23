import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

// TODO: Integrate .env for CI and remove optional() call on required fields
export default defineConfig({
    REACT_APP_SENTRY_DSN: Schema.string.optional(),
    REACT_APP_SENTRY_TRACES_SAMPLE_RATE: Schema.string.optional(),

    REACT_APP_GRAPHQL_API_ENDPOINT: Schema.string.optional({ format: 'url', protocol: true, tld: false }),

    // Used in codegen
    APP_GRAPHQL_CODEGEN_ENDPOINT: Schema.string.optional(), // NOTE: this is both url and file path

    REACT_APP_ENVIRONMENT: Schema.string.optional(),

    REACT_APP_FIREBASE_API_KEY: Schema.string(),
    REACT_APP_FIREBASE_AUTH_DOMAIN: Schema.string(),
    REACT_APP_FIREBASE_DATABASE_URL: Schema.string(),
    REACT_APP_FIREBASE_PROJECT_ID: Schema.string(),
    REACT_APP_FIREBASE_STORAGE_BUCKET: Schema.string(),
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: Schema.string.optional(),
    REACT_APP_FIREBASE_APP_ID: Schema.string(),

    REACT_APP_COMMUNITY_DASHBOARD_URL: Schema.string.optional(),
    REACT_APP_IMAGE_BING_API_KEY: Schema.string.optional(),
    REACT_APP_IMAGE_MAPBOX_API_KEY: Schema.string.optional(),
    REACT_APP_IMAGE_MAXAR_PREMIUM_API_KEY: Schema.string.optional(),

    // Used in application, automatically injected by vite
    REACT_APP_COMMIT_HASH: Schema.string.optional(),
    REACT_APP_VERSION: Schema.string.optional(),
})

import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

// TODO: Integrate .env for CI and remove optional() call on required fields
export default defineConfig({
    REACT_APP_ENVIRONMENT: Schema.string.optional(),
    REACT_APP_CSRF_TOKEN_KEY: Schema.string(),

    REACT_APP_GRAPHQL_API_ENDPOINT: Schema.string({ format: 'url', protocol: true, tld: false }),
    REACT_APP_GRAPHQL_CODEGEN_ENDPOINT: Schema.string.optional(),

    REACT_APP_BING_API_KEY: Schema.string.optional(),
    REACT_APP_MAPBOX_API_KEY: Schema.string.optional(),
    REACT_APP_MAXAR_PREMIUM_API_KEY: Schema.string.optional(),
    REACT_APP_MAXAR_STANDARD_API_KEY: Schema.string.optional(),

    REACT_APP_SENTRY_DSN: Schema.string.optional(),
    REACT_APP_SENTRY_TRACES_SAMPLE_RATE: Schema.string.optional(),

    // Used in application, automatically injected by vite
    REACT_APP_COMMIT_HASH: Schema.string.optional(),
    REACT_APP_VERSION: Schema.string.optional(),
})

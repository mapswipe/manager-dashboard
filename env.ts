import {
    Schema,
    defineConfig,
    overrideDefineForWebAppServe,
} from '@togglecorp/vite-plugin-validate-env';

const webAppServeEnabled = process.env.WEB_APP_SERVE_ENABLED?.toLowerCase() === 'true';

const urlStringOptions: Parameters<typeof Schema.string>[number] = {
    format: 'url',
    protocol: true,
    tld: false,
};

// TODO: Integrate .env for CI and remove optional() call on required fields
export default defineConfig({
    validator: 'builtin',
    schema: {
        APP_ENVIRONMENT: (key: string, value: string) => {
            const regex = /^(PROD|STAGE|testing|CI|alpha-\d+|ALPHA-\d+|SANDBOX-\d+|DEV)$/;
            const valid = !!value && (value.match(regex) !== null);
            if (!valid) {
                throw new Error(`Value for environment variable "${key}" must match regex "${regex}", instead received "${value}"`);
            }
            return value as ('PROD' | 'STAGE' | 'testing' | 'CI' | `alpha-${number}` | 'DEV' | `ALPHA-${number}`);
        },

        APP_REST_API_DOMAIN: Schema.string(urlStringOptions),
        APP_GRAPHQL_API_DOMAIN: Schema.string(urlStringOptions),

        APP_SENTRY_DSN: Schema.string.optional(),
        APP_SENTRY_TRACES_SAMPLE_RATE: Schema.string.optional(),
        APP_FIREBASE_API_KEY: Schema.string.optional(),
        APP_FIREBASE_AUTH_DOMAIN: Schema.string.optional(),
        APP_FIREBASE_PROJECT_ID: Schema.string.optional(),
        APP_FIREBASE_AUTH_EMULATOR_URL: Schema.string.optional(urlStringOptions),

        APP_MAPILLARY_API_KEY: Schema.string.optional(),
    },
    overrideDefine: webAppServeEnabled ? overrideDefineForWebAppServe : undefined,
})

import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import webfontDownload from 'vite-plugin-webfont-dl';
import reactSwc from '@vitejs/plugin-react-swc';
import { execSync } from 'child_process';
import { compression } from 'vite-plugin-compression2';
import checker from 'vite-plugin-checker';
import { ValidateEnv as validateEnv } from '@julr/vite-plugin-validate-env';
import { VitePluginRadar } from 'vite-plugin-radar';

import managerDashboardPackage from './package.json';

/* Get commit hash */
const commitHash = execSync('git rev-parse --short HEAD').toString();

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    const env = loadEnv(mode, process.cwd(), '')

    return {
        define: {
            'import.meta.REACT_APP_COMMIT_HASH': JSON.stringify(commitHash),
            'import.meta.env.REACT_APP_VERSION': JSON.stringify(managerDashboardPackage.version),
            'import.meta.env.REACT_APP_ID': JSON.stringify('mapswipe-manager-dashboard'),
        },
        plugins: [
            isProd ? checker({
                typescript: true,
                eslint: {
                    lintCommand: 'eslint ./app',
                },
                stylelint: {
                    lintCommand: 'stylelint "./app/**/*.css"',
                },
            }) : undefined,
            reactSwc(),
            tsconfigPaths(),
            webfontDownload(),
            validateEnv(),
            isProd ? compression() : undefined,
            VitePluginRadar({
                analytics: {
                    id: env.APP_GOOGLE_ANALYTICS_ID,
                },
            })
        ],
        css: {
            devSourcemap: isProd,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        envPrefix: 'REACT_APP_',
        server: {
            port: 3000,
            strictPort: true,
        },
        build: {
            outDir: 'build',
            sourcemap: isProd,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'mapbox-gl': ['mapbox-gl'],
                    }
                },
            },
        },
        test: {
            environment: 'happy-dom',
        },
    };
});

import { createContext } from 'react';

export type HealthCheckData = {
    'Cache backend: default': 'working' | string;
    DatabaseBackend: 'working' | string;
    'DatabaseBackend[default]': 'working' | string;
    DefaultFileStorageHealthCheck: 'working' | string;
    MigrationsHealthCheck: string;
    RedisHealthCheck: string;
    app: {
        environment: string;
        version: string;
        git: {
            branch: string | null;
            commit : string | null;
            repository: {
                url: string | null;
                branch: string | null;
                commit: string | null;
                commit_github_metadata: string | null;
            }
        }
    },
}

const HealthCheckContext = createContext<HealthCheckData | undefined>(
    undefined,
);

export default HealthCheckContext;

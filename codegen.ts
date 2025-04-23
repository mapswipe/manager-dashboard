import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: process.env.REACT_APP_GRAPHQL_CODEGEN_ENDPOINT,
    documents: [
        'app/**/*.tsx',
        'app/**/*.ts'
    ],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        './generated/types/': {
            preset: 'client'
        }
    }
}

export default config;

import { Cookies } from 'react-cookie';
import {
    ApolloClientOptions,
    HttpLink,
    HttpOptions,
    InMemoryCache,
    NormalizedCacheObject,
    split,
} from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

const GRAPHQL_ENDPOINT = import.meta.env.REACT_APP_GRAPHQL_API_ENDPOINT;
const cookies = new Cookies();
const headers: NonNullable<HttpOptions['headers']> = {
    'X-CSRFToken': cookies.get(import.meta.env.REACT_APP_CSRF_TOKEN_KEY),
};

const link = split(
    (operation) => operation.getContext().hasUpload,
    createUploadLink({
        uri: GRAPHQL_ENDPOINT,
        credentials: 'include',
        headers,
    }),
    new HttpLink({
        uri: GRAPHQL_ENDPOINT,
        credentials: 'include',
        headers,
    }),
);

/*
const link: ApolloLinkFromClient = ApolloLink.from([
    new RetryLink(),
    ApolloLink.split(
        (operation) => operation.getContext().hasUpload,
        createUploadLink({
            uri: GRAPHQL_ENDPOINT,
            credentials: 'include',
        }) as unknown as ApolloLink,
        ApolloLink.from([
            new RestLink({
                uri: 'https://osmnames.idmcdb.org',
            }) as unknown as ApolloLink,
            new BatchHttpLink({
                uri: GRAPHQL_ENDPOINT,
                credentials: 'include',
            }),
        ]),
    ),
]) as unknown as ApolloLinkFromClient;
*/

const apolloOptions: ApolloClientOptions<NormalizedCacheObject> = {
    link,
    cache: new InMemoryCache(),
    assumeImmutableResults: true,
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
    },
};

export default apolloOptions;

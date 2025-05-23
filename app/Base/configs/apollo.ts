import { Cookies } from 'react-cookie';
import {
    ApolloClientOptions,
    ApolloLink,
    concat,
    HttpLink,
    HttpOptions,
    InMemoryCache,
    NormalizedCacheObject,
    split,
} from '@apollo/client';
import { setContext } from 'apollo-link-context';
import { createUploadLink } from 'apollo-upload-client';

const COOKIE_NAME = `MAPSWIPE-${import.meta.env.APP_ENVIRONMENT}-CSRFTOKEN`;
const GRAPHQL_ENDPOINT = `${import.meta.env.APP_GRAPHQL_API_DOMAIN}/graphql/`;

const authLink = setContext(async (_, prevContext) => {
    const { headers } = prevContext;
    const cookies = new Cookies();
    const newHeaders: NonNullable<HttpOptions['headers']> = {
        ...headers,
        'X-CSRFToken': cookies.get(COOKIE_NAME),
    };
    return {
        headers: newHeaders,
    };
});

const link = split(
    (operation) => operation.getContext().hasUpload,
    createUploadLink({
        uri: GRAPHQL_ENDPOINT,
        credentials: 'include',
    }),
    new HttpLink({
        uri: GRAPHQL_ENDPOINT,
        credentials: 'include',
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
    link: concat(
        authLink as unknown as ApolloLink,
        link,
    ),
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

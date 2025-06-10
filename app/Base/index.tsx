import 'react-mde/lib/styles/css/react-mde-all.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Cookies } from 'react-cookie';
import { BrowserRouter } from 'react-router';
import {
    ApolloClient,
    ApolloProvider,
} from '@apollo/client';
import {
    ErrorBoundary,
    init,
    setUser as setUserOnSentry,
    User as SentryUser,
} from '@sentry/react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
    Client as UrqlClient,
    fetchExchange,
    Provider as UrqlProvider,
} from 'urql';

import AppRoutes from '#base/components/AppRoutes';
import AuthPopup from '#base/components/AuthPopup';
import Init from '#base/components/Init';
import Navbar from '#base/components/Navbar';
import PreloadMessage from '#base/components/PreloadMessage';
import apolloConfig from '#base/configs/apollo';
import sentryConfig from '#base/configs/sentry';
import NavbarContext, { type NavbarContextInterface } from '#base/context/NavbarContext';
import OptionContext, { Options } from '#base/context/OptionContext';
import UserContext, { type UserContextInterface } from '#base/context/UserContext';
import { sync } from '#base/hooks/useAuthSync';
import { User } from '#base/types/user';
import AlertContainer from '#components/AlertContainer';
import useAlertContextProviderValue from '#hooks/useAlertContextProviderValue';

import AlertContext from './context/AlertContext';

import styles from './styles.module.css';

if (sentryConfig) {
    init(sentryConfig);
}

const COOKIE_NAME = `MAPSWIPE-${import.meta.env.APP_ENVIRONMENT}-CSRFTOKEN`;
const GRAPHQL_ENDPOINT = `${import.meta.env.APP_GRAPHQL_API_DOMAIN}/graphql/`;

const cookies = new Cookies();
const apolloClient = new ApolloClient(apolloConfig);
const gqlClient = new UrqlClient({
    url: GRAPHQL_ENDPOINT,
    exchanges: [
        cacheExchange(),
        fetchExchange,
    ],
    fetchOptions: () => ({
        headers: {
            'X-CSRFToken': cookies.get(COOKIE_NAME),
        },
        credentials: 'include',
    }),
    // requestPolicy: 'network-only',
});

function Base() {
    const [user, setUser] = useState<User | undefined>();
    const [options, setOptions] = useState<Options>({});
    const [navbarVisibility, setNavbarVisibility] = useState(false);

    const authenticated = !!user;
    const setUserWithSentry: typeof setUser = useCallback(
        (u) => {
            if (typeof u === 'function') {
                setUser((oldUser) => {
                    const newUser = u(oldUser);

                    const sanitizedUser: SentryUser | null = newUser ? ({
                        id: newUser.id,
                        username: newUser.displayName,
                    }) : null;
                    sync(
                        !!sanitizedUser,
                        isDefined(sanitizedUser) ? String(sanitizedUser.id) : undefined,
                    );
                    setUserOnSentry(sanitizedUser);

                    return newUser;
                });
            } else {
                const sanitizedUser: SentryUser | null = u ? ({
                    id: u.id,
                    username: u.displayName,
                }) : null;
                sync(
                    !!sanitizedUser,
                    isDefined(sanitizedUser) ? String(sanitizedUser.id) : undefined,
                );
                setUserOnSentry(sanitizedUser);
                setUser(u);
            }
        },
        [setUser],
    );

    const optionContextValue: OptionContext = useMemo(
        () => ({
            options,
            setOptions,
        }),
        [options, setOptions],
    );

    const userContext: UserContextInterface = useMemo(
        () => ({
            authenticated,
            user,
            setUser: setUserWithSentry,
            navbarVisibility,
            setNavbarVisibility,
        }),
        [
            authenticated,
            user,
            setUserWithSentry,
            navbarVisibility,
            setNavbarVisibility,
        ],
    );

    const navbarContext: NavbarContextInterface = useMemo(
        () => ({
            navbarVisibility,
            setNavbarVisibility,
        }),
        [navbarVisibility, setNavbarVisibility],
    );

    const alertContextValue = useAlertContextProviderValue();

    return (
        <div className={styles.base}>
            <ErrorBoundary
                showDialog
                fallback={(
                    <PreloadMessage
                        heading="Oh no!"
                        content="Some error occurred!"
                    />
                )}
            >
                <UrqlProvider value={gqlClient}>
                    <ApolloProvider client={apolloClient}>
                        <OptionContext.Provider value={optionContextValue}>
                            <UserContext.Provider value={userContext}>
                                <AlertContext.Provider value={alertContextValue}>
                                    <NavbarContext.Provider value={navbarContext}>
                                        <AlertContainer />
                                        <AuthPopup />
                                        <BrowserRouter>
                                            <Init preloadClassName={styles.init}>
                                                <Navbar
                                                    className={_cs(
                                                        styles.navbar,
                                                        !navbarVisibility && styles.hidden,
                                                    )}
                                                />
                                                <AppRoutes
                                                    routeClassName={styles.view}
                                                />
                                            </Init>
                                        </BrowserRouter>
                                    </NavbarContext.Provider>
                                </AlertContext.Provider>
                            </UserContext.Provider>
                        </OptionContext.Provider>
                    </ApolloProvider>
                </UrqlProvider>
            </ErrorBoundary>
        </div>
    );
}

export default Base;

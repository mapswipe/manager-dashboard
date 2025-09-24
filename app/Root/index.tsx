import 'react-mde/lib/styles/css/react-mde-all.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapillary-js/dist/mapillary.css';

import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Cookies } from 'react-cookie';
import { Outlet } from 'react-router';
import {
    ErrorBoundary,
    setUser as setUserOnSentry,
    User as SentryUser,
} from '@sentry/react';
import { isDefined } from '@togglecorp/fujs';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
    Client as UrqlClient,
    fetchExchange,
    Provider as UrqlProvider,
} from 'urql';

import AuthPopup from '#base/components/AuthPopup';
import PreloadMessage from '#base/components/PreloadMessage';
import { sync } from '#base/hooks/useAuthSync';
import { User } from '#base/types/user';
import AlertContainer from '#components/AlertContainer';
import AlertContext from '#contexts/AlertContext';
import NavbarContext, { type NavbarContextInterface } from '#contexts/NavbarContext';
import OptionContext, { Options } from '#contexts/OptionContext';
import UserContext, { type UserContextInterface } from '#contexts/UserContext';
import schema from '#generated/schema.json';
import useAlertContextProviderValue from '#hooks/useAlertContextProviderValue';

const COOKIE_NAME = `MAPSWIPE-${import.meta.env.APP_ENVIRONMENT}-CSRFTOKEN`;
const GRAPHQL_ENDPOINT = `${import.meta.env.APP_GRAPHQL_API_DOMAIN}/graphql/`;

const cookies = new Cookies();
const gqlClient = new UrqlClient({
    url: GRAPHQL_ENDPOINT,
    exchanges: [
        cacheExchange({
            keys: new Proxy(
                {
                    AppEnumCollection: () => null,
                },
                {
                    get(target, prop) {
                        if (typeof prop === 'string' && prop.endsWith('Enum')) {
                            return (data: { key: string }) => data.key;
                        }

                        const fallback = (data: { id: string }) => data.id;

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return (target as any)[prop] || fallback;
                    },
                },
            ),
            schema,
        }),
        fetchExchange,
    ],
    fetchOptions: () => ({
        headers: {
            'X-CSRFToken': cookies.get(COOKIE_NAME),
        },
        credentials: 'include',
    }),
    requestPolicy: 'cache-and-network',
});

function Root() {
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
        <ErrorBoundary
            showDialog
            fallback={(
                <PreloadMessage>
                    Failed to load the page!
                </PreloadMessage>
            )}
        >
            <UrqlProvider value={gqlClient}>
                <OptionContext.Provider value={optionContextValue}>
                    <UserContext.Provider value={userContext}>
                        <AlertContext.Provider value={alertContextValue}>
                            <NavbarContext.Provider value={navbarContext}>
                                <AlertContainer />
                                <AuthPopup />
                                <Outlet />
                            </NavbarContext.Provider>
                        </AlertContext.Provider>
                    </UserContext.Provider>
                </OptionContext.Provider>
            </UrqlProvider>
        </ErrorBoundary>
    );
}

export default Root;

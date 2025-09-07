import './index.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router';
import {
    init,
    wrapCreateBrowserRouterV7,
} from '@sentry/react';

import routes, { RouteConfig } from '#base/configs/routes';
import sentryConfig from '#base/configs/sentry';

if (sentryConfig) {
    init(sentryConfig);
}

const authRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-authenticated',
);

const publicRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-anything',
);

const guestRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-not-authenticated',
);

function mapRoute(routeConfig: RouteConfig) {
    return {
        index: routeConfig.index,
        path: routeConfig.path,
        lazy: async () => {
            const { default: Component } = await routeConfig.load();
            return { Component };
        },
    };
}

const router = wrapCreateBrowserRouterV7(createBrowserRouter)([{
    lazy: async () => {
        const { default: Component } = await import('./Root');
        return { Component };
    },
    children: [{
        lazy: async () => {
            const { default: Component } = await import('#views/RootLayout');
            return { Component };
        },
        children: [
            {
                lazy: async () => {
                    const { default: Component } = await import('#views/GuestLayout');
                    return { Component };
                },
                children: guestRoutes.map(mapRoute),
            },
            {
                lazy: async () => {
                    const { default: Component } = await import('#views/AuthLayout');
                    return { Component };
                },
                children: authRoutes.map(mapRoute),
            },
            ...publicRoutes.map(mapRoute),
        ],
    }],
    // FIXME: add error element
    // errorElement:
}]);

const webappRootId = 'app-container';
const webappRootElement = document.getElementById(webappRootId);

if (!webappRootElement) {
    // eslint-disable-next-line no-console
    console.error(`Could not find html element with id '${webappRootId}'`);
} else {
    ReactDOM.createRoot(webappRootElement).render(
        <StrictMode>
            <RouterProvider
                router={router}
            />
        </StrictMode>,
    );
}

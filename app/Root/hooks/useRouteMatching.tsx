import { useContext } from 'react';
import { generatePath } from 'react-router';

import routes, { RouteKeys } from '#base/configs/routes';
import UserContext from '#contexts/UserContext';

export interface Attrs {
    [key: string]: string | number | undefined;
}

function useRouteMatching(routeKey: RouteKeys, attrs?: Attrs) {
    const { authenticated } = useContext(UserContext);
    const route = routes[routeKey];

    const {
        // title,
        visibility,
        path,
    } = route;

    if (visibility === 'is-not-authenticated' && authenticated) {
        return undefined;
    }

    if (visibility === 'is-authenticated' && !authenticated) {
        return undefined;
    }

    return {
        // NOTE: we just pass projectId here so that the permission check and
        // projectId param is in sync
        to: generatePath(path ?? '/', { ...attrs }),
        // children: title,
    };
}

export default useRouteMatching;

import { Suspense } from 'react';
import {
    Route,
    Routes,
} from 'react-router';
import { withSentryReactRouterV7Routing } from '@sentry/react';

import PreloadMessage from '#base/components/PreloadMessage';
import routes from '#base/configs/routes';

const RoutesWithSentry = withSentryReactRouterV7Routing(Routes);

interface Props {
    routeClassName?: string;
}

function AppRoutes(props: Props) {
    const { routeClassName: className } = props;

    return (
        <Suspense
            fallback={(
                <PreloadMessage
                    className={className}
                    content="Loading page..."
                />
            )}
        >
            <RoutesWithSentry>
                {Object.entries(routes).map(([key, route]) => (
                    <Route
                        key={key}
                        path={route.path}
                        element={route.load({ className })}
                    />
                ))}
            </RoutesWithSentry>
        </Suspense>
    );
}
export default AppRoutes;

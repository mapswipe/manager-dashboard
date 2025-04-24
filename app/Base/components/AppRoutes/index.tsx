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
                <Route
                    path={routes.home.path}
                    element={routes.home.load({ className })}
                />
                <Route
                    path={routes.login.path}
                    element={routes.login.load({ className })}
                />
                <Route
                    path={routes.projects.path}
                    element={routes.projects.load({ className })}
                />
                <Route
                    path={routes.teams.path}
                    element={routes.teams.load({ className })}
                />
                <Route
                    path={routes.userGroups.path}
                    element={routes.userGroups.load({ className })}
                />
                <Route
                    path={routes.newProject.path}
                    element={routes.newProject.load({ className })}
                />
                <Route
                    path={routes.editProject.path}
                    element={routes.editProject.load({ className })}
                />
                <Route
                    path={routes.newTutorial.path}
                    element={routes.newTutorial.load({ className })}
                />
                <Route
                    path={routes.fourHundredFour.path}
                    element={routes.fourHundredFour.load({ className })}
                />
            </RoutesWithSentry>
        </Suspense>
    );
}
export default AppRoutes;

import {
    useCallback,
    useContext,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql } from 'urql';

import SmartNavLink from '#base/components/SmartNavLink';
import route from '#base/configs/routes';
import UserContext from '#base/context/UserContext';
import Button from '#components/Button';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import { useLogoutMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import mapSwipeLogo from '#resources/images/mapswipe-logo.svg';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
} from '#utils/error';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGOUT_MUTATION = gql`
mutation Logout {
    logout
}
`;

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;
    const {
        user,
        setUser,
    } = useContext(UserContext);
    const alert = useAlert();

    const [
        { fetching: logoutPending },
        logout,
    ] = useLogoutMutation();

    const handleLogoutClick = useCallback(async () => {
        try {
            const result = await logout({});

            if (checkAndAlertGraphQLResultError(result, alert)) {
                return;
            }

            alert.show(
                'Logout successful!',
                {
                    description: 'Navigating to login page.',
                    variant: 'success',
                },
            );
            setUser(undefined);
        } catch (apolloError) {
            alertCombinedError(apolloError, alert);
        }
    }, [logout, setUser, alert]);

    return (
        <nav className={_cs(className, styles.navbar)}>
            <InlineLayout
                className={styles.content}
                start={(
                    <img
                        className={styles.logo}
                        src={mapSwipeLogo}
                        alt="MapSwipe"
                    />
                )}
                end={user && (
                    <ListLayout>
                        <div>
                            {user.displayName}
                        </div>
                        <Button
                            styleVariant="transparent"
                            colorVariant="text-on-dark"
                            name={undefined}
                            onClick={handleLogoutClick}
                            disabled={logoutPending}
                            withoutPadding
                        >
                            Logout
                        </Button>
                    </ListLayout>
                )}
                spacing="lg"
                withPadding
            >
                <ListLayout
                    spacing="lg"
                >
                    <SmartNavLink
                        route={route.home}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                    <SmartNavLink
                        route={route.projects}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                    <SmartNavLink
                        route={route.tutorials}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                    <SmartNavLink
                        route={route.teams}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                </ListLayout>
            </InlineLayout>
        </nav>
    );
}

export default Navbar;

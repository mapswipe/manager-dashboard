import {
    useCallback,
    useContext,
} from 'react';
import {
    gql,
    useMutation,
} from '@apollo/client';
import { _cs } from '@togglecorp/fujs';

import SmartNavLink from '#base/components/SmartNavLink';
import route from '#base/configs/routes';
import UserContext from '#base/context/UserContext';
import Button from '#components/Button';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import useAlert from '#hooks/useAlert';
import mapSwipeLogo from '#resources/images/mapswipe-logo.svg';
import {
    alertApolloError,
    checkAndAlertGraphQLResultError,
} from '#utils/error';

import styles from './styles.module.css';

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

    const [logout, { loading: logoutPending }] = useMutation(LOGOUT_MUTATION);

    const handleLogoutClick = useCallback(async () => {
        try {
            const result = await logout();

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
            alertApolloError(apolloError, alert);
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
                </ListLayout>
            </InlineLayout>
        </nav>
    );
}

export default Navbar;

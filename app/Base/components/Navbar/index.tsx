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
import mapSwipeLogo from '#resources/images/mapswipe-logo.svg';

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

    const [logout, { loading: logoutPending }] = useMutation(LOGOUT_MUTATION);

    const handleLogoutClick = useCallback(async () => {
        try {
            await logout();
            setUser(undefined);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }, [logout, setUser]);

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.container}>
                <div className={styles.appBrand}>
                    <img
                        className={styles.logo}
                        src={mapSwipeLogo}
                        alt="MapSwipe"
                    />
                </div>
                <div className={styles.navLinks}>
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
                        route={route.teams}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                    <SmartNavLink
                        route={route.userGroups}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                </div>
                {user && (
                    <div className={styles.userDetails}>
                        <div>
                            {user.displayName}
                        </div>
                        <Button
                            variant="action"
                            className={styles.logoutButton}
                            name={undefined}
                            onClick={handleLogoutClick}
                            disabled={logoutPending}
                        >
                            Logout
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

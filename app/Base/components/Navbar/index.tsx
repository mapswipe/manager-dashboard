import {
    useCallback,
    useContext,
} from 'react';
import { MdOutlineHealthAndSafety } from 'react-icons/md';
import { _cs } from '@togglecorp/fujs';
import { gql } from 'urql';

import SmartNavLink from '#base/components/SmartNavLink';
import route from '#base/configs/routes';
import HealthCheckContext from '#base/context/HealthCheckContext';
import UserContext from '#base/context/UserContext';
import Button from '#components/Button';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import Modal from '#components/Modal';
import TextOutput from '#components/TextOutput';
import { useLogoutMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useBooleanState from '#hooks/useBooleanState';
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
    const healthCheckData = useContext(HealthCheckContext);
    const alert = useAlert();

    const [
        { fetching: logoutPending },
        logout,
    ] = useLogoutMutation();

    const [
        showModal,
        setShowModalTrue,
        setShowModalFalse,
    ] = useBooleanState(false);

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
                        <div className={styles.icon}>
                            <Button
                                name={undefined}
                                styleVariant="transparent"
                                colorVariant="text-on-dark"
                                withoutPadding
                                onClick={setShowModalTrue}
                            >
                                <MdOutlineHealthAndSafety />
                            </Button>
                        </div>
                        {showModal && (
                            <Modal
                                heading="System health"
                                onClose={setShowModalFalse}
                                size="sm"
                                withHeaderBorder
                                footerActions={(
                                    <Button
                                        name={undefined}
                                        onClick={setShowModalFalse}
                                    >
                                        Done
                                    </Button>
                                )}
                            >
                                {healthCheckData && (
                                    Object.entries(healthCheckData).map(([key, value]) => {
                                        if (typeof value === 'string') {
                                            return (
                                                <div key={key}>
                                                    <TextOutput
                                                        icon={value === 'working' ? '✅ ' : '❌ '}
                                                        label={key}
                                                        value={value}
                                                    />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })
                                )}
                            </Modal>
                        )}
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
                withWrap
            >
                <ListLayout
                    spacing="lg"
                    withWrap
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
                    <SmartNavLink
                        route={route.userGroups}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                    <SmartNavLink
                        route={route.contributors}
                        className={styles.link}
                        activeClassName={styles.active}
                    />
                </ListLayout>
            </InlineLayout>
        </nav>
    );
}

export default Navbar;

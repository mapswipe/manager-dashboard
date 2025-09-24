import {
    useCallback,
    useContext,
} from 'react';
import { MdOutlineHealthAndSafety } from 'react-icons/md';
import { _cs } from '@togglecorp/fujs';
import { signOut } from 'firebase/auth';
import { gql } from 'urql';

import SmartNavLink from '#base/components/SmartNavLink';
import { firebaseAuth } from '#base/configs/firebase';
import Button from '#components/Button';
import ButtonLayout from '#components/ButtonLayout';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import Modal from '#components/Modal';
import TextOutput from '#components/TextOutput';
import HealthCheckContext from '#contexts/HealthCheckContext';
import UserContext from '#contexts/UserContext';
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

            if (firebaseAuth) {
                signOut(firebaseAuth);
            }

            setUser(undefined);
            alert.show(
                'Logout successful!',
                {
                    description: 'Navigating to login page.',
                    variant: 'success',
                },
            );
        } catch (apolloError) {
            alertCombinedError(apolloError, alert);
        }
    }, [logout, setUser, alert]);

    return (
        <nav className={_cs(className, styles.navbar)}>
            <InlineLayout
                className={styles.content}
                withCenterAlign
                start={(
                    <>
                        <img
                            className={styles.logo}
                            src={mapSwipeLogo}
                            alt="MapSwipe"
                        />
                        <div />
                    </>
                )}
                end={user && (
                    <ListLayout spacing="sm">
                        <Button
                            name={undefined}
                            styleVariant="transparent"
                            colorVariant="text-on-dark"
                            withoutPadding
                            onClick={setShowModalTrue}
                        >
                            <MdOutlineHealthAndSafety />
                        </Button>
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
                        <ButtonLayout
                            styleVariant="transparent"
                            colorVariant="text-on-dark"
                            withoutPadding
                            disabled
                        >
                            {user.displayName}
                        </ButtonLayout>
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
                spacing="md"
                withWrap
            >
                <ListLayout withWrap>
                    <SmartNavLink
                        route="home"
                        withoutPadding
                    >
                        Home
                    </SmartNavLink>
                    <SmartNavLink
                        route="projects"
                        withoutPadding
                    >
                        Projects
                    </SmartNavLink>
                    <SmartNavLink
                        route="tutorials"
                        withoutPadding
                    >
                        Tutorials
                    </SmartNavLink>
                    <SmartNavLink
                        route="teams"
                        withoutPadding
                    >
                        Teams
                    </SmartNavLink>
                    <SmartNavLink
                        route="userGroups"
                        withoutPadding
                    >
                        User groups
                    </SmartNavLink>
                    <SmartNavLink
                        route="contributors"
                        withoutPadding
                    >
                        Contributors
                    </SmartNavLink>
                </ListLayout>
            </InlineLayout>
        </nav>
    );
}

export default Navbar;

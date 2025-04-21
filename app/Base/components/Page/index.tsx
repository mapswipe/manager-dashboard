import React, {
    useContext,
    useEffect,
} from 'react';
import { redirect } from 'react-router';

import ErrorBoundary from '#base/components/ErrorBoundary';
import PageTitle from '#base/components/PageTitle';
import PreloadMessage from '#base/components/PreloadMessage';
import NavbarContext from '#base/context/NavbarContext';
import ProjectContext from '#base/context/ProjectContext';
import UserContext from '#base/context/UserContext';
import { Project } from '#base/types/project';

import styles from './styles.module.css';

type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface Props<T extends { className?: string }> {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.LazyExoticComponent<(props: T) => React.ReactElement<any, any> | null>;
    componentProps: React.PropsWithRef<T>;
    overrideProps: Partial<React.PropsWithRef<T>>;
    visibility: Visibility,
    checkPermissions?: (
        project: Project | undefined,
        skipProjectPermissionCheck: boolean,
    ) => boolean | undefined,
    navbarVisibility: boolean;

    path: string;
    loginPage?: string;
    defaultPage?: string;
}

function Page<T extends { className?: string }>(props: Props<T>) {
    const {
        component: Comp,
        componentProps,
        overrideProps,
        title,
        navbarVisibility,
        visibility,
        checkPermissions,

        loginPage = '/login/',
        defaultPage = '/',
        path,
    } = props;

    const {
        authenticated,
    } = useContext(UserContext);
    const {
        setNavbarVisibility,
    } = useContext(NavbarContext);
    const {
        project,
    } = useContext(ProjectContext);

    const redirectToSignIn = visibility === 'is-authenticated' && !authenticated;
    const redirectToHome = visibility === 'is-not-authenticated' && authenticated;
    const shouldRedirect = redirectToSignIn || redirectToHome;

    useEffect(
        () => {
            // NOTE: should not set visibility for redirection or, navbar will
            // flash
            if (!shouldRedirect) {
                setNavbarVisibility(navbarVisibility);
            }
        },
        // NOTE: setNavbarVisibility will not change
        // NOTE: navbarVisibility will not change
        // NOTE: adding path because Path component is reused when used in Switch > Routes
        [setNavbarVisibility, navbarVisibility, path, shouldRedirect],
    );

    if (redirectToSignIn) {
        redirect(loginPage);
    }

    if (redirectToHome) {
        redirect(defaultPage);
    }

    // FIXME: custom error message from checkPermissions
    // FIXME: add a "back to home" or somewhere page
    // FIXME: only hide page if page is successfully mounted
    if (checkPermissions && !checkPermissions(project, false)) {
        return (
            <>
                <PageTitle value={`403 - ${title}`} />
                <PreloadMessage
                    heading="Oh no!"
                    content="The page does not exist or you do not have permissions to view this page."
                />
            </>
        );
    }

    return (
        <>
            <PageTitle value={title} />
            <ErrorBoundary>
                <Comp
                    className={styles.page}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...overrideProps}
                />
            </ErrorBoundary>
        </>
    );
}

export default Page;

import {
    NavLink,
    NavLinkProps,
} from 'react-router';
import { _cs } from '@togglecorp/fujs';

import { RouteKeys } from '#base/configs/routes';
import useRouteMatching, { Attrs } from '#base/hooks/useRouteMatching';
import ButtonLayout, { ButtonLayoutProps } from '#components/ButtonLayout';

import styles from './styles.module.css';

export type Props = Omit<NavLinkProps, 'to'> & ButtonLayoutProps & {
    route: RouteKeys;
    attrs?: Attrs;
    activeClassName?: string;
};

function SmartNavLink(props: Props) {
    const {
        route,
        attrs,
        className,
        start,
        children,
        end,
        startContainerClassName,
        childrenContainerClassName,
        endContainerClassName,
        colorVariant = 'accent',
        styleVariant = 'transparent',
        withoutPadding,
        spacing,
        activeClassName,
        ...otherProps
    } = props;

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <NavLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            to={routeData.to}
            className={({ isActive }) => _cs(
                styles.smartNavLink,
                isActive && styles.active,
                isActive && activeClassName,
            )}
        >
            <ButtonLayout
                className={_cs(
                    styles.buttonLayout,
                    className,
                )}
                start={start}
                end={end}
                startContainerClassName={startContainerClassName}
                endContainerClassName={endContainerClassName}
                childrenContainerClassName={childrenContainerClassName}
                spacing={spacing}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                withoutPadding={withoutPadding}
            >
                {children}
            </ButtonLayout>
        </NavLink>
    );
}

export default SmartNavLink;

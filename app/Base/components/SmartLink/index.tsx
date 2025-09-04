import { IoChevronForward } from 'react-icons/io5';
import {
    Link,
    LinkProps,
} from 'react-router';
import { _cs } from '@togglecorp/fujs';

import useRouteMatching, {
    Attrs,
    RouteData,
} from '#base/hooks/useRouteMatching';
import ButtonLayout, { ButtonLayoutProps } from '#components/ButtonLayout';

import styles from './styles.module.css';

export type Props = Omit<LinkProps, 'to'> & ButtonLayoutProps & {
    route: RouteData;
    attrs?: Attrs;
    withLinkIcon?: boolean,
};

function SmartLink(props: Props) {
    const {
        withLinkIcon,
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
        ...otherProps
    } = props;

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <Link
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={styles.smartLink}
            to={routeData.to}
        >
            <ButtonLayout
                className={_cs(className, styles.buttonLayout)}
                start={start}
                end={(
                    <>
                        {withLinkIcon && <IoChevronForward className={styles.linkIcon} />}
                        {end}
                    </>
                )}
                startContainerClassName={startContainerClassName}
                endContainerClassName={endContainerClassName}
                childrenContainerClassName={childrenContainerClassName}
                spacing={spacing}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                withoutPadding={withoutPadding}
            >
                {children ?? routeData.children}
            </ButtonLayout>
        </Link>
    );
}

export default SmartLink;

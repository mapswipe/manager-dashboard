import { AnchorHTMLAttributes } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { PiArrowUpRight } from 'react-icons/pi';
import {
    Link,
    LinkProps,
} from 'react-router';
import { _cs } from '@togglecorp/fujs';

import { RouteKeys } from '#base/configs/routes';
import useRouteMatching, { type Attrs } from '#base/hooks/useRouteMatching';
import ButtonLayout, { ButtonLayoutProps } from '#components/ButtonLayout';

import styles from './styles.module.css';

type InternalLinkProps = Omit<LinkProps, 'to'> & {
    external?: false;
    route: RouteKeys;
    attrs?: Attrs;
    href?: never;
};

type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    external: true;
    href: string;
    route?: never;
    attrs?: never;
};

export type Props = (InternalLinkProps | ExternalLinkProps) & ButtonLayoutProps & {
    withLinkIcon?: boolean,
};

interface RouteLinkProps extends Omit<LinkProps, 'to'> {
    route: RouteKeys;
    attrs?: Attrs;
}

function RouteLink(props: RouteLinkProps) {
    const {
        route,
        attrs,
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
            to={routeData.to}
        />
    );
}

function SmartLink(props: Props) {
    const {
        withLinkIcon,
        external,
        route,
        attrs,
        href,
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
        disabled,
        ...otherProps
    } = props;

    const LinkIcon = external ? PiArrowUpRight : IoChevronForward;

    const content = (
        <ButtonLayout
            className={_cs(className, styles.buttonLayout)}
            disabled={disabled}
            start={start}
            end={(
                <>
                    {withLinkIcon && <LinkIcon className={styles.linkIcon} />}
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
            {children}
        </ButtonLayout>
    );

    if (external) {
        return (
            <a
                target="_blank"
                rel="noopener noreferrer"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                className={styles.smartLink}
                href={href}
            >
                {content}
            </a>
        );
    }

    return (
        <RouteLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={styles.smartLink}
            route={route}
            attrs={attrs}
        >
            {content}
        </RouteLink>
    );
}

export default SmartLink;

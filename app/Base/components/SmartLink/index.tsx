import {
    Link,
    LinkProps,
} from 'react-router';

import useRouteMatching, {
    Attrs,
    RouteData,
} from '#base/hooks/useRouteMatching';
import ButtonLayout, { type Props as ButtonLayoutProps } from '#components/ButtonLayout';

export type Props = Omit<LinkProps, 'to'> & ButtonLayoutProps & {
    route: RouteData;
    attrs?: Attrs;
};

function SmartLink(props: Props) {
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
        colorVariant,
        styleVariant = 'transparent',
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
            to={routeData.to}
        >
            <ButtonLayout
                className={className}
                start={start}
                end={end}
                startContainerClassName={startContainerClassName}
                endContainerClassName={endContainerClassName}
                childrenContainerClassName={childrenContainerClassName}
                spacing={spacing}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
            >
                {children ?? routeData.children}
            </ButtonLayout>
        </Link>
    );
}

export default SmartLink;

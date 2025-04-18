import React from 'react';
import {
    Link,
    LinkProps,
} from 'react-router-dom';

import useRouteMatching, {
    Attrs,
    RouteData,
} from '#base/hooks/useRouteMatching';
import {
    ButtonProps,
    useButtonFeatures,
} from '#components/Button';

export type Props = Omit<LinkProps, 'to'> & {
    route: RouteData;
    attrs?: Attrs;
    children?: React.ReactNode;
    variant?: ButtonProps<unknown>['variant'];
};

function SmartLink(props: Props) {
    const {
        route,
        attrs,
        children,
        variant,
        className,
        ...otherProps
    } = props;

    const extraProps = useButtonFeatures({
        className,
        variant,
    });

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <Link
            {...otherProps}
            {...extraProps}
            to={routeData.to}
        >
            {children ?? routeData.children}
        </Link>
    );
}

export default SmartLink;

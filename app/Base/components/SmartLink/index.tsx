import {
    Link,
    LinkProps,
} from 'react-router';

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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...extraProps}
            to={routeData.to}
        >
            {children ?? routeData.children}
        </Link>
    );
}

export default SmartLink;

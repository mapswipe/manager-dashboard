import { _cs } from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    paddingSpacings,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    spacing?: SpacingType;
}

function Tag(props: Props) {
    const {
        className,
        children,
        spacing,
    } = props;

    const spacingClassName = useSpacingToken({
        spacing,
        modes: paddingSpacings,
        offset: -2,
    });

    return (
        <div
            className={_cs(
                styles.tag,
                spacingClassName,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Tag;

import { _cs } from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    paddingSpacings,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

type TagColorVariant = 'text' | 'primary' | 'accent' | 'success' | 'danger';

interface Props {
    className?: string;
    children?: React.ReactNode;
    spacing?: SpacingType;
    colorVariant?: TagColorVariant;
}

function Tag(props: Props) {
    const {
        className,
        children,
        spacing,
        colorVariant = 'primary',
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
                colorVariant === 'text' && styles.colorVariantText,
                colorVariant === 'primary' && styles.colorVariantPrimary,
                colorVariant === 'accent' && styles.colorVariantAccent,
                colorVariant === 'success' && styles.colorVariantSuccess,
                colorVariant === 'danger' && styles.colorVariantDanger,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Tag;

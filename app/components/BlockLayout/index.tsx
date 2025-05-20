import { useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useSpacingToken, {
    SpacingMode,
    type SpacingType,
} from '#hooks/useSpacingToken';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    start?: React.ReactNode;
    children: React.ReactNode;
    end?: React.ReactNode;
    startContainerClassName?: string;
    childrenContainerClassName?: string;
    endContainerClassName?: string;
    spacing?: SpacingType;
    withPadding?: boolean;
    withStartSeparator?: boolean;
    withEndSeparator?: boolean;
}

const gapSpacings: SpacingMode[] = ['row-gap', 'column-gap'];
const paddingSpacings: SpacingMode[] = ['padding-block', 'padding-inline'];

function BlockLayout(props: Props) {
    const {
        className,
        start,
        children,
        end,
        startContainerClassName,
        childrenContainerClassName,
        endContainerClassName,
        spacing,
        withPadding,
        withStartSeparator,
        withEndSeparator,
    } = props;

    const spacingModes = useMemo<SpacingMode[]>(() => {
        if (!withPadding) {
            return gapSpacings;
        }

        return [
            ...gapSpacings,
            ...paddingSpacings,
        ];
    }, [withPadding]);

    const spacingClassName = useSpacingToken({
        spacing,
        modes: spacingModes,
    });

    const innerSpacingClassName = useSpacingToken({
        spacing,
        modes: gapSpacings,
    });

    return (
        <div
            className={_cs(
                styles.blockLayout,
                spacingClassName,
                className,
            )}
        >
            {start && (
                <div
                    className={_cs(
                        styles.startContent,
                        innerSpacingClassName,
                        startContainerClassName,
                    )}
                >
                    {start}
                </div>
            )}
            {withStartSeparator && <hr className={styles.separator} />}
            {isDefined(children) && (
                <div
                    className={_cs(
                        styles.children,
                        innerSpacingClassName,
                        childrenContainerClassName,
                    )}
                >
                    {children}
                </div>
            )}
            {withEndSeparator && <hr className={styles.separator} />}
            {end && (
                <div
                    className={_cs(
                        styles.endContent,
                        endContainerClassName,
                        innerSpacingClassName,
                    )}
                >
                    {end}
                </div>
            )}
        </div>
    );
}

export default BlockLayout;

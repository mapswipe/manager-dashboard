import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    fullSpacings,
    gapSpacings,
    SpacingMode,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

export interface Props {
    elementRef?: React.RefObject<HTMLDivElement>;
    className?: string;
    start?: React.ReactNode;
    children?: React.ReactNode;
    end?: React.ReactNode;
    startContainerClassName?: string;
    childrenContainerClassName?: string;
    endContainerClassName?: string;
    spacing?: SpacingType;
    spacingOffset?: number;
    withPadding?: boolean;
}

function InlineLayout(props: Props) {
    const {
        className,
        elementRef,
        start,
        children,
        end,
        startContainerClassName,
        childrenContainerClassName,
        endContainerClassName,
        spacing,
        spacingOffset,
        withPadding,
    } = props;

    const spacingModes = useMemo<SpacingMode[]>(() => {
        if (!withPadding) {
            return gapSpacings;
        }

        return fullSpacings;
    }, [withPadding]);

    const spacingClassName = useSpacingToken({
        spacing,
        modes: spacingModes,
        offset: spacingOffset ?? 0,
    });

    const innerSpacingClassName = useSpacingToken({
        spacing,
        modes: gapSpacings,
    });

    return (
        <div
            ref={elementRef}
            className={_cs(
                styles.inlineLayout,
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
            <div
                className={_cs(
                    styles.children,
                    innerSpacingClassName,
                    childrenContainerClassName,
                )}
            >
                {children}
            </div>
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

export default InlineLayout;

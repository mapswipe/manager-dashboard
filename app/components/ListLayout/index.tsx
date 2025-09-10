import {
    RefObject,
    useLayoutEffect,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import useFallbackRef from '#hooks/useFallbackRef';
import useSpacingToken from '#hooks/useSpacingToken';
import {
    fullSpacings,
    gapSpacings,
    getSpacingValue,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

export type ListLayoutType = 'inline' | 'block' | 'grid';

interface Props extends React.HTMLProps<HTMLDivElement> {
    className?: string;
    layout?: ListLayoutType;
    spacing?: SpacingType;
    children: React.ReactNode;
    withPadding?: boolean;
    withWrap?: boolean;
    numPreferredGridColumns?: number;
    minGridColumnSize?: string;
    spacingOffset?: number;
    elementRef?: RefObject<HTMLDivElement>;
    withFullWidth?: boolean;
}

function ListLayout(props: Props) {
    const {
        className,
        layout = 'inline',
        spacing,
        withPadding,
        withWrap,
        children,
        numPreferredGridColumns = 2,
        minGridColumnSize = '16rem',
        spacingOffset,
        withFullWidth,
        elementRef: elementRefFromProps,
        ...divElementProps
    } = props;

    const elementRef = useFallbackRef(elementRefFromProps);

    useLayoutEffect(() => {
        if (layout === 'grid') {
            elementRef.current?.style.setProperty(
                '--num-preferred-grid-columns',
                String(numPreferredGridColumns),
            );

            elementRef.current?.style.setProperty(
                '--min-grid-column-size',
                String(minGridColumnSize),
            );

            const paddingPartitions = withPadding ? 2 : 0;
            const gapPartitions = numPreferredGridColumns - 1;
            const numPartitions = paddingPartitions + gapPartitions;
            elementRef.current?.style.setProperty(
                '--reserved-space',
                `calc(${getSpacingValue(spacing)} * ${numPartitions})`,
            );
        }
    }, [numPreferredGridColumns, minGridColumnSize, layout, withPadding, spacing, elementRef]);

    const spacingClassName = useSpacingToken({
        spacing,
        offset: spacingOffset,
        modes: withPadding ? fullSpacings : gapSpacings,
    });

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divElementProps}
            ref={elementRef}
            className={_cs(
                styles.listLayout,
                layout === 'inline' && styles.inlineLayout,
                layout === 'block' && styles.blockLayout,
                layout === 'grid' && styles.gridLayout,
                layout !== 'grid' && spacingClassName,
                withWrap && styles.withWrap,
                withFullWidth && styles.withFullWidth,
                className,
            )}
        >
            {layout === 'grid' && (
                <div
                    className={_cs(
                        styles.gridContent,
                        spacingClassName,
                    )}
                >
                    {children}
                </div>
            )}
            {layout !== 'grid' && children}
        </div>
    );
}

export default ListLayout;

import {
    useLayoutEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    fullSpacings,
    gapSpacings,
    getSpacingValue,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

interface Props {
    className?: string;
    layout?: 'block' | 'inline' | 'grid';
    spacing?: SpacingType;
    children: React.ReactNode;
    withPadding?: boolean;
    withWrap?: boolean;
    numPreferredGridColumns?: 2 | 3 | 4 | 5;
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
    } = props;

    const elementRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (layout === 'grid') {
            elementRef.current?.style.setProperty(
                '--num-preferred-grid-columns',
                String(numPreferredGridColumns),
            );

            const paddingPartitions = withPadding ? 2 : 0;
            const gapPartitions = numPreferredGridColumns - 1;
            const numPartitions = paddingPartitions + gapPartitions;
            elementRef.current?.style.setProperty(
                '--reserved-space',
                `calc(${getSpacingValue(spacing)} * ${numPartitions})`,
            );
        }
    }, [numPreferredGridColumns, layout, withPadding, spacing]);

    const spacingClassName = useSpacingToken({
        spacing,
        modes: withPadding ? fullSpacings : gapSpacings,
    });

    return (
        <div
            ref={elementRef}
            className={_cs(
                styles.listLayout,
                layout === 'inline' && styles.inlineLayout,
                layout === 'block' && styles.blockLayout,
                layout === 'grid' && styles.gridLayout,
                layout !== 'grid' && spacingClassName,
                withWrap && styles.withWrap,
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

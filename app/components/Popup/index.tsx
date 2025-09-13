import { CSSProperties } from 'react';
import { _cs } from '@togglecorp/fujs';

import ListLayout, { ListLayoutType } from '#components/ListLayout';
import Portal from '#components/Portal';
import useAttachedFloatPlacement from '#hooks/useAttachedFloatPlacement';
import { SpacingType } from '#utils/styles';

import styles from './styles.module.css';

export interface PopupProps {
    className?: string;
    contentClassName?: string;
    pointerClassName?: string;
    parentRef: React.RefObject<HTMLElement>;
    elementRef?: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
    preferredWidth?: CSSProperties['width'];
    spacing?: SpacingType;
    contentLayout?: ListLayoutType;
    contentNumPreferredGridColumns?: number;
}

function Popup(props: PopupProps) {
    const {
        parentRef,
        children,
        className,
        contentClassName,
        elementRef,
        spacing,
        contentLayout = 'block',
        contentNumPreferredGridColumns,
        preferredWidth,
        pointerClassName,
    } = props;

    const {
        contentPlacementStyle,
        pointerPlacementStyle,
        width,
        orientation,
    } = useAttachedFloatPlacement(parentRef, preferredWidth);

    return (
        <Portal>
            <div
                ref={elementRef}
                style={{
                    ...contentPlacementStyle,
                    width,
                }}
                className={_cs(
                    styles.popup,
                    orientation.vertical === 'bottom' && styles.topOrientation,
                    className,
                )}
            >
                <ListLayout
                    layout={contentLayout}
                    numPreferredGridColumns={contentNumPreferredGridColumns}
                    className={_cs(styles.content, contentClassName)}
                    spacing={spacing}
                    withPadding
                >
                    { children }
                </ListLayout>
                <div
                    className={_cs(
                        styles.pointer,
                        orientation.vertical === 'bottom' && styles.topOrientation,
                        pointerClassName,
                    )}
                    style={pointerPlacementStyle}
                >
                    <svg
                        className={styles.icon}
                        viewBox="0 0 200 100"
                    >
                        <path
                            d="M0 100 L100 0 L200 100Z"
                        />
                    </svg>
                </div>
            </div>
        </Portal>
    );
}

export default Popup;

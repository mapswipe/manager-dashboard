import {
    CSSProperties,
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    bound,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

const ONE_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
// px
const MIN_WIDTH = 16 * ONE_REM;
const VERTICAL_OFFSET = 0.5 * ONE_REM;

type Orientation = {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
};

const defaultOrientation: Orientation = {
    vertical: 'bottom',
    horizontal: 'right',
};

function getPreferredOrientation(position: DOMRect): Orientation {
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;

    const centerX = position.x + position.width / 2;
    const centerY = position.y + position.height / 2;

    return {
        horizontal: centerX < windowCenterX ? 'left' : 'right',
        vertical: centerY < windowCenterY ? 'top' : 'bottom',
    };
}

interface PlacementStyle {
    top: CSSProperties['top'];
    left: CSSProperties['left'];
    right: CSSProperties['right'];
    bottom: CSSProperties['bottom'];
}

const defaultPlacement: PlacementStyle = {
    top: 'unset',
    left: 'unset',
    right: 'unset',
    bottom: 'unset',
};

function resolveWidth(width: React.CSSProperties['width']): number | undefined {
    if (typeof width === 'number') return width; // already px
    if (typeof width === 'string' && width.endsWith('px')) {
        return parseFloat(width);
    }
    if (typeof width === 'string' && width.endsWith('rem')) {
        return parseFloat(width) * ONE_REM;
    }

    // could add % or other units handling here if needed
    return undefined; // unsupported (%, auto, etc.)
}

function useAttachedFloatPlacement(
    parentRef: React.RefObject<HTMLElement | undefined>,
    preferredWidth?: CSSProperties['width'],
) {
    const [placements, setPlacements] = useState<{
        contentPlacementStyle: PlacementStyle,
        pointerPlacementStyle: PlacementStyle,
        width: string,
        orientation: Orientation,
    }>({
        contentPlacementStyle: defaultPlacement,
        pointerPlacementStyle: defaultPlacement,
        width: 'auto',
        orientation: defaultOrientation,
    });

    const calculatePlacement = useCallback(() => {
        if (isNotDefined(parentRef.current)) {
            return;
        }

        const parentBCR = parentRef.current.getBoundingClientRect();
        const {
            x: parentX,
            y: parentY,
            width: parentWidth,
            height: parentHeight,
        } = parentBCR;

        const horizontalPadding = ONE_REM;
        const minX = horizontalPadding;
        const maxX = window.innerWidth - horizontalPadding;
        const maxWidth = window.innerWidth - 2 * horizontalPadding;

        const orientation = getPreferredOrientation(parentBCR);
        const parentCenterX = parentX + parentWidth / 2;

        const resolvedPreferredWidth = resolveWidth(preferredWidth);
        const width = bound(
            isDefined(resolvedPreferredWidth) ? resolvedPreferredWidth : parentWidth,
            MIN_WIDTH,
            maxWidth,
        );

        let x1 = parentCenterX - width / 2;
        let x2 = parentCenterX + width / 2;

        if (x1 < minX) {
            const diff = minX - x1 - horizontalPadding;
            x1 = minX;
            x2 += diff;
        }

        if (x2 > maxX) {
            const diff = x2 - maxX - horizontalPadding;
            x2 = maxX;
            x1 -= diff;
        }

        setPlacements({
            contentPlacementStyle: {
                bottom: orientation.vertical === 'bottom'
                    ? `${window.innerHeight - parentY + VERTICAL_OFFSET}px`
                    : 'unset',
                top: orientation.vertical === 'top'
                    ? `${parentY + parentHeight + VERTICAL_OFFSET}px`
                    : 'unset',
                left: orientation.horizontal === 'left' ? `${x1}px` : 'unset',
                right: orientation.horizontal === 'right' ? `${window.innerWidth - x2}px` : 'unset',
            },
            pointerPlacementStyle: {
                left: `${parentCenterX}px`,
                top: orientation.vertical === 'top' ? `${parentY + parentHeight}px` : `${parentY - VERTICAL_OFFSET}px`,
                right: 'unset',
                bottom: 'unset',
            },
            width: `${x2 - x1}px`,
            orientation,
        });
    }, [parentRef, preferredWidth]);

    useEffect(() => {
        calculatePlacement();
        // TODO: throttle and debounce callbacks
        const handleScroll = calculatePlacement;
        const handleResize = calculatePlacement;

        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize, true);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize, true);
        };
    }, [calculatePlacement]);

    return placements;
}

export default useAttachedFloatPlacement;

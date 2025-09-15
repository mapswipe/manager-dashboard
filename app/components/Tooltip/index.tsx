import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Popup from '#components/Popup';
import useDebouncedValue from '#hooks/useDebouncedValue';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    preferredWidth?: number;
    children?: React.ReactNode;
}

function Tooltip(props: Props) {
    const {
        className,
        preferredWidth,
        children,
    } = props;

    const [hasParentRef, setHasParentRef] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const parentRef = useRef<HTMLElement>();
    const dummyRef = useRef<HTMLDivElement>(null);

    const showPopupDelayed = useDebouncedValue(showPopup);

    useEffect(
        () => {
            const handleMouseEnter = () => {
                setShowPopup(true);
            };

            const handleMouseOut = () => {
                setShowPopup(false);
            };

            if (isNotDefined(dummyRef.current)) {
                return undefined;
            }

            const {
                current: {
                    parentNode,
                },
            } = dummyRef;

            if (isNotDefined(parentNode)) {
                return undefined;
            }

            parentRef.current = parentNode as HTMLElement;
            parentNode.addEventListener('mouseover', handleMouseEnter);
            parentNode.addEventListener('mouseout', handleMouseOut);
            setHasParentRef(true);

            return () => {
                parentNode.removeEventListener('mouseover', handleMouseEnter);
                parentNode.removeEventListener('mouseout', handleMouseOut);
            };
        },
        [],
    );

    return (
        <>
            {!hasParentRef && (
                <div
                    className={styles.tooltipDummy}
                    ref={dummyRef}
                />
            )}
            {(showPopup || showPopupDelayed) && (
                <Popup
                    className={_cs(styles.tooltipContent, className)}
                    parentRef={parentRef as React.RefObject<HTMLElement>}
                    preferredWidth={preferredWidth}
                    pointerClassName={styles.pointer}
                >
                    {children}
                </Popup>
            )}
        </>
    );
}

export default Tooltip;

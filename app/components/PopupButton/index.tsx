import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    IoIosArrowDown,
    IoIosArrowUp,
} from 'react-icons/io';
import { _cs } from '@togglecorp/fujs';

import Button, { Props as ButtonProps } from '#components/Button';
import Popup from '#components/Popup';
import useBlurEffect from '#hooks/useBlurEffect';

import styles from './styles.module.css';

export interface PopupButtonProps<NAME extends number | string | undefined> extends Omit<ButtonProps<NAME>, 'label' | 'elementRef'> {
    popupClassName?: string;
    popupContentClassName?: string;
    label: React.ReactNode;
    componentRef?: React.MutableRefObject<{
        setPopupVisibility: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    persistent?: boolean;
    arrowHidden?: boolean;
    defaultShown?: boolean;
}

function PopupButton<NAME extends number | string | undefined>(props: PopupButtonProps<NAME>) {
    const {
        popupClassName,
        children,
        label,
        end,
        componentRef,
        arrowHidden,
        persistent = false,
        defaultShown,
        ...otherProps
    } = props;

    const buttonRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const [popupShown, setPopupShown] = useState(defaultShown ?? false);

    useEffect(
        () => {
            if (componentRef) {
                componentRef.current = {
                    setPopupVisibility: setPopupShown,
                };
            }
        },
        [componentRef],
    );

    const handleShowPopup: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        () => {
            setPopupShown((prevValue) => !prevValue);
        },
        [],
    );

    const handlePopupBlur = useCallback(
        (clickedInside: boolean, clickedInParent: boolean) => {
            // const isClickedWithin = clickedInside || clickedInParent;
            if (clickedInParent) {
                return;
            }

            if (clickedInside && persistent) {
                return;
            }

            setPopupShown(false);
        },
        [setPopupShown, persistent],
    );

    useBlurEffect(
        popupShown,
        handlePopupBlur,
        popupRef,
        buttonRef,
    );

    return (
        <>
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                name={undefined}
                layoutElementRef={buttonRef}
                onClick={handleShowPopup}
                end={(
                    <>
                        {end}
                        {!arrowHidden && popupShown && <IoIosArrowUp />}
                        {!arrowHidden && !popupShown && <IoIosArrowDown />}
                    </>
                )}
            >
                {label}
            </Button>
            {popupShown && (
                <Popup
                    elementRef={popupRef}
                    parentRef={buttonRef}
                    className={_cs(styles.popup, popupClassName)}
                    contentClassName={styles.popupContent}
                >
                    {children}
                </Popup>
            )}
        </>
    );
}

export default PopupButton;

import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import InputInteractivityContext, { InputInteractivityContextProps } from '#base/context/InputInteractivityContext';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import InputLabel from '#components/InputLabel';

import styles from './styles.module.css';

export interface Props {
    inputId: string;
    className?: string;
    children: React.ReactNode;
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    elementRef?: React.RefObject<HTMLDivElement>;
}

function InputContainerLayout(props: Props) {
    const {
        className,
        disabled = false,
        elementRef,
        error,
        hint,
        inputId,
        children,
        label,
        readOnly,
    } = props;

    const [focused, setFocused] = useState<boolean>(false);
    const [hovered, setHovered] = useState<boolean>(false);

    const handleMouseOver = useCallback(() => {
        setHovered(true);
    }, []);

    const handleMouseOut = useCallback(() => {
        setHovered(false);
    }, []);

    const interactivityContextValue = useMemo<InputInteractivityContextProps>(() => ({
        focused,
        setFocused,
        hovered,
        setHovered,
        disabled,
    }), [focused, hovered, disabled]);

    return (
        <InputInteractivityContext.Provider value={interactivityContextValue}>
            <div
                ref={elementRef}
                className={_cs(
                    className,
                    styles.inputContainerLayout,
                    disabled && styles.disabled,
                    readOnly && styles.readOnly,
                )}
                onFocus={handleMouseOver}
                onBlur={handleMouseOut}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            >
                {label && (
                    <InputLabel inputId={inputId}>
                        {label}
                    </InputLabel>
                )}
                {children}
                {error && (
                    <InputError>
                        {error}
                    </InputError>
                )}
                {!error && hint && (
                    <InputHint>
                        {hint}
                    </InputHint>
                )}
            </div>
        </InputInteractivityContext.Provider>
    );
}

export default InputContainerLayout;

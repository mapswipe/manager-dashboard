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
import ListLayout from '#components/ListLayout';
import { SpacingType } from '#utils/styles';

export interface Props {
    inputId: string;
    className?: string;
    focusedClassName?: string;
    hoveredClassName?: string;
    children: React.ReactNode;
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    elementRef?: React.RefObject<HTMLDivElement>;
    spacing?: SpacingType;
    spacingOffset?: number;
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
        focusedClassName,
        hoveredClassName,
        spacing,
        spacingOffset = -2,
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
        readOnly,
    }), [focused, hovered, disabled, readOnly]);

    return (
        <InputInteractivityContext.Provider value={interactivityContextValue}>
            <ListLayout
                elementRef={elementRef}
                className={_cs(
                    className,
                    focused && focusedClassName,
                    hovered && hoveredClassName,
                )}
                onFocus={handleMouseOver}
                onBlur={handleMouseOut}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                layout="block"
                spacing={spacing}
                spacingOffset={spacingOffset}
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
            </ListLayout>
        </InputInteractivityContext.Provider>
    );
}

export default InputContainerLayout;

import {
    useCallback,
    useId,
    useMemo,
    useState,
} from 'react';

import InputInteractivityContext, { InputInteractivityContextProps } from '#base/context/InputInteractivityContext';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import InputLabel from '#components/InputLabel';
import ListLayout, { ListLayoutType } from '#components/ListLayout';
import { SpacingType } from '#utils/styles';

import { Props as InputContainerProps } from '../InputContainer';
import Radio from './Radio';

export interface Props<Name, Option, Value> extends Omit<InputContainerProps, 'input' | 'actions' | 'icons' | 'inputId'> {
    options: Option[];
    keySelector: (item: Option, index: number, data: Option[]) => Value;
    labelSelector: (item: Option, index: number, data: Option[]) => React.ReactNode;
    value: Value | undefined | null;
    name: Name;
    onChange: (newValue: Value, name: Name) => void;
    className?: string;
    radioListLayout?: ListLayoutType;
    radioListNumPreferredGridColumn?: number;
    spacing?: SpacingType;
}

function RadioInput<
    const N,
    O,
    V extends boolean | string | number,
>(props: Props<N, O, V>) {
    const {
        options,
        keySelector,
        labelSelector,
        value,
        name,
        onChange,
        className,
        disabled = false,
        error,
        hint,
        label,
        readOnly,
        radioListLayout,
        radioListNumPreferredGridColumn,
        spacing,
    } = props;

    const inputId = useId();

    const handleRadioClick = useCallback((radioKey: V) => {
        if (onChange && !readOnly) {
            onChange(radioKey, name);
        }
    }, [readOnly, onChange, name]);

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
            <ListLayout
                className={className}
                onFocus={handleMouseOver}
                onBlur={handleMouseOut}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                spacing={spacing}
                spacingOffset={-1}
                layout="block"
            >
                {label && (
                    <InputLabel inputId={inputId}>
                        {label}
                    </InputLabel>
                )}
                <ListLayout
                    layout={radioListLayout}
                    numPreferredGridColumns={radioListNumPreferredGridColumn}
                    spacing={spacing}
                    spacingOffset={-2}
                    withWrap
                >
                    {options?.map((option, i) => {
                        const key = keySelector(option, i, options);
                        const radioLabel = labelSelector(option, i, options);

                        return (
                            <Radio
                                key={String(key)}
                                value={value === key}
                                name={key}
                                onClick={handleRadioClick}
                                inputName={typeof name === 'string' ? name : undefined}
                                label={radioLabel}
                                disabled={disabled}
                                spacing={spacing}
                            />
                        );
                    })}
                </ListLayout>
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

export default RadioInput;

import {
    useCallback,
    useId,
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import InputInteractivityContext, { InputInteractivityContextProps } from '#base/context/InputInteractivityContext';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import InputLabel from '#components/InputLabel';

import { Props as InputContainerProps } from '../InputContainer';
import Radio from './Radio';

import styles from './styles.module.css';

export interface Props<Name, Option, Value> extends Omit<InputContainerProps, 'input' | 'actions' | 'icons' | 'inputId'> {
    options: Option[];
    keySelector: (item: Option, index: number, data: Option[]) => Value;
    labelSelector: (item: Option, index: number, data: Option[]) => React.ReactNode;
    value: Value | undefined | null;
    name: Name;
    onChange: (newValue: Value, name: Name) => void;
    className?: string;
    radioListLayout?: 'inline' | 'block';
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
        radioListLayout = 'inline',
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
            <div
                className={_cs(styles.radioInput, className)}
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
                <div
                    className={_cs(
                        styles.radioList,
                        radioListLayout === 'block' && styles.blockLayout,
                        radioListLayout === 'inline' && styles.inlineLayout,
                    )}
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
                            />
                        );
                    })}
                </div>
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

export default RadioInput;

import React, {
    useCallback,
    useId,
    useLayoutEffect,
    useState,
} from 'react';
import {
    bound,
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';

function isValidNumericString(val: string) {
    return /^[+-]?\d+(\.\d+)?$/.test(val);
}
function isValidDecimalTrailingZeroString(val: string) {
    return /^[+-]?\d+\.\d*0$/.test(val);
}

export type Props<N> = Omit<InputContainerProps, 'input' | 'inputId'>
    & Omit<RawInputProps<N>, 'onChange' | 'value' | 'containerRef' | 'inputSectionRef'>
    & {
        value: number | undefined | null;
        onChange?: (
            value: number | undefined,
            name: N,
            e: React.FormEvent<HTMLInputElement> | undefined,
        ) => void;
    };

function NumberInput<const N>(props: Props<N>) {
    const {
        actions,
        className,
        disabled,
        error,
        hint,
        icons,
        label,
        readOnly,
        onChange,
        name,
        value,
        spacing,
        ...rawInputProps
    } = props;

    const inputId = useId();
    const [tempValue, setTempValue] = useState<string | undefined>();

    useLayoutEffect(
        () => {
            // NOTE: we don't clear tempValue if it is equal to input value
            // eg. tempValue: 1.00000, value: 1
            setTempValue((val) => (
                isDefined(val) && isValidNumericString(val) && +val === value
                    ? val
                    : undefined
            ));
        },
        [value],
    );

    const handleChange = React.useCallback(
        (
            v: string | undefined,
            n: N,
            event: React.FormEvent<HTMLInputElement> | undefined,
        ) => {
            if (!onChange) {
                return;
            }

            if (isFalsyString(v)) {
                setTempValue(undefined);
                onChange(undefined, n, event);
                return;
            }

            if (!isValidNumericString(v)) {
                setTempValue(v);
                return;
            }

            // NOTE: we set tempValue if it is valid but is a transient state
            // eg. 1.0000 is valid but transient
            setTempValue(
                isValidDecimalTrailingZeroString(v)
                    ? v
                    : undefined,
            );
            const numericValue = bound(
                +v,
                -Number.MAX_SAFE_INTEGER,
                Number.MAX_SAFE_INTEGER,
            );
            onChange(numericValue, n, event);
        },
        [onChange],
    );

    const handleFocusOut = useCallback(
        () => {
            setTempValue(undefined);
        },
        [],
    );

    const finalValue = tempValue ?? (isDefined(value) ? String(value) : undefined);

    return (
        <InputContainer
            inputId={inputId}
            actions={actions}
            className={className}
            disabled={disabled}
            error={error}
            hint={hint}
            icons={icons}
            label={label}
            readOnly={readOnly}
            spacing={spacing}
            // invalid={isTruthyString(tempValue)}
            input={(
                <RawInput<N>
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
                    readOnly={readOnly}
                    disabled={disabled}
                    onChange={handleChange}
                    onBlur={handleFocusOut}
                    name={name}
                    value={finalValue}
                    id={inputId}
                />
            )}
        />
    );
}

export default NumberInput;

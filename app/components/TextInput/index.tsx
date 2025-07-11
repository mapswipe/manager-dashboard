import { useId } from 'react';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawInput, { Props as RawInputProps } from '../RawInput';

export type TextInputProps<N> = Omit<InputContainerProps, 'input' | 'inputId'>
    & Omit<RawInputProps<N>, 'containerRef' | 'inputSectionRef'>;

function TextInput<const N>(props: TextInputProps<N>) {
    const {
        actions,
        className,
        disabled,
        error,
        hint,
        icons,
        label,
        readOnly,
        type = 'text',
        ...textInputProps
    } = props;

    const inputId = useId();

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
            input={(
                <RawInput<N>
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...textInputProps}
                    id={inputId}
                    readOnly={readOnly}
                    disabled={disabled}
                    type={type}
                />
            )}
        />
    );
}

export default TextInput;

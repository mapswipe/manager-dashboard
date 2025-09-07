import { useId } from 'react';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { RawTextAreaProps } from '../RawTextArea';

export type TextInputProps<N> = Omit<InputContainerProps, 'input' | 'inputId'>
    & Omit<RawTextAreaProps<N>, 'containerRef' | 'inputSectionRef'>;

function TextArea<const N>(props: TextInputProps<N>) {
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
        spacing,
        ...textAreaProps
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
            spacing={spacing}
            input={(
                <RawTextArea<N>
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...textAreaProps}
                    readOnly={readOnly}
                    disabled={disabled}
                    type={type}
                    id={inputId}
                />
            )}
        />
    );
}

export default TextArea;

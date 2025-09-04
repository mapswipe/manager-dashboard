import {
    useCallback,
    useId,
} from 'react';

import Button from '#components/Button';
import { ButtonStyleVariant } from '#components/ButtonLayout';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import ListLayout from '#components/ListLayout';
import { SpacingType } from '#utils/styles';

interface Props<Value extends string | number | boolean, Option, Name> extends Omit<InputContainerProps, 'input' | 'inputId'> {
    options: Option[];
    keySelector: (item: Option, index: number, data: Option[]) => Value;
    labelSelector: (item: Option, index: number, data: Option[]) => React.ReactNode;
    value: Value | undefined | null;
    name: Name;
    onChange: (newValue: Value, name: Name) => void;
    className?: string;
    spacing?: SpacingType;
    activeSegmentStyleVariant?: ButtonStyleVariant;
}

function SegmentInput<
    Value extends string | number | boolean,
    Option,
    const Name,
>(props: Props<Value, Option, Name>) {
    const {
        options,
        keySelector,
        labelSelector,
        value,
        name,
        onChange,
        actions,
        className,
        disabled,
        error,
        hint,
        icons,
        label,
        readOnly,
        spacing,
        activeSegmentStyleVariant = 'filled',
    } = props;

    const inputId = useId();

    const handleSegmentClick = useCallback((newValue: Value) => {
        onChange(newValue, name);
    }, [onChange, name]);

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
                <ListLayout
                    spacingOffset={-1}
                    spacing={spacing}
                    withWrap
                >
                    {options.map((option, i) => {
                        const key = keySelector(option, i, options);
                        const optionLabel = labelSelector(option, i, options);

                        return (
                            <Button
                                id={inputId}
                                styleVariant={key === value ? activeSegmentStyleVariant : 'transparent'}
                                colorVariant={key === value ? 'accent' : 'text'}
                                name={key}
                                key={String(key)}
                                onClick={handleSegmentClick}
                                spacingOffset={-1}
                                spacing={spacing}
                            >
                                {optionLabel}
                            </Button>
                        );
                    })}
                </ListLayout>
            )}
        />
    );
}

export default SegmentInput;

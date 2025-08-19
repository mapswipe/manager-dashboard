import { useCallback } from 'react';
import {
    IoAdd,
    IoTrashBin,
} from 'react-icons/io5';
import { isNotDefined } from '@togglecorp/fujs';
import {
    getErrorObject,
    ObjectError,
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import ColorSelectInput from '#components/ColorSelectInput';
import Container from '#components/Container';
import IconSelectInput from '#components/domain/IconSelectInput';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';

import { PartialCustomSubOptionInputFields } from './SubOptionInput/schema';
import { PartialCustomOptionInputFields } from './schema';
import SubOptionInput from './SubOptionInput';

interface Props {
    className?: string;
    index: number;
    value: PartialCustomOptionInputFields;
    onChange: (
        value: SetValueArg<PartialCustomOptionInputFields>,
        index: number,
    ) => void;
    error: ObjectError<PartialCustomOptionInputFields> | undefined;
    onRemove: (index: number) => void;
    disabled?: boolean,
}

function CustomOptionInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
        disabled,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    const {
        setValue: setSubOptionValue,
        removeValue: removeSubOption,
    } = useFormArray(
        'subOptions' as const,
        setFieldValue,
    );

    const addSubOption = useCallback((newSubOptionIndex: number) => {
        const newSubOption: PartialCustomSubOptionInputFields = {
            clientId: ulid(),
            value: newSubOptionIndex,
        };

        setFieldValue(
            (oldValue: PartialCustomSubOptionInputFields[] | undefined) => (
                [...(oldValue ?? []), newSubOption]
            ),
            'subOptions' as const,
        );
    }, [setFieldValue]);

    return (
        <Container
            className={className}
            heading={`Option #${index + 1}`}
            headingLevel={5}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="transparent"
                    colorVariant="danger"
                    start={<IoTrashBin />}
                    withoutPadding
                    disabled={disabled}
                >
                    Remove
                </Button>
            )}
            withHeaderBorder
        >
            <ListLayout layout="grid">
                <ListLayout layout="block">
                    <ListLayout
                        layout="grid"
                        minGridColumnSize="8rem"
                    >
                        <IconSelectInput
                            label="Icon"
                            name="icon"
                            value={value.icon}
                            onChange={setFieldValue}
                            error={error?.icon}
                            nonClearable
                            disabled={disabled}
                        />
                        <ColorSelectInput
                            label="Color"
                            name="iconColor"
                            value={value.iconColor}
                            onChange={setFieldValue}
                            error={error?.iconColor}
                            disabled={disabled}
                        />
                        <NumberInput
                            label="Value"
                            name="value"
                            value={value.value}
                            onChange={setFieldValue}
                            error={error?.value}
                            disabled={disabled}
                        />
                    </ListLayout>
                    <TextInput
                        label="Title"
                        name="title"
                        value={value.title}
                        onChange={setFieldValue}
                        error={error?.title}
                        disabled={disabled}
                    />
                    <TextArea
                        label="Description"
                        name="description"
                        value={value.description}
                        onChange={setFieldValue}
                        error={error?.description}
                        disabled={disabled}
                    />
                </ListLayout>
                <Container
                    heading="Sub options"
                    headingLevel={5}
                    headerActions={(
                        <Button
                            name={value?.subOptions?.length ?? 0}
                            onClick={addSubOption}
                            styleVariant="transparent"
                            start={<IoAdd />}
                            withoutPadding
                            disabled={disabled}
                        >
                            Add sub option
                        </Button>
                    )}
                    headerDescription={(
                        <NonFieldError error={error?.subOptions} />
                    )}
                    empty={isNotDefined(value.subOptions) || value.subOptions.length === 0}
                >
                    {value?.subOptions?.map((subOption, subOptionIndex) => (
                        <SubOptionInput
                            key={subOption.clientId}
                            index={subOptionIndex}
                            value={subOption}
                            onChange={setSubOptionValue}
                            error={getErrorObject(
                                getErrorObject(error?.subOptions)?.[subOption.clientId],
                            )}
                            onRemove={removeSubOption}
                            disabled={disabled}
                        />
                    ))}
                </Container>
            </ListLayout>
        </Container>
    );
}

export default CustomOptionInput;

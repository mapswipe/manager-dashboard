import { useCallback } from 'react';
import { IoAdd } from 'react-icons/io5';
import { PiTrash } from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';
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
import GridLayoutItem from '#components/GridLayoutItem';
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
            value: (index + 1) * 10 + newSubOptionIndex,
        };

        setFieldValue(
            (oldValue: PartialCustomSubOptionInputFields[] | undefined) => (
                [...(oldValue ?? []), newSubOption]
            ),
            'subOptions' as const,
        );
    }, [setFieldValue, index]);

    return (
        <Container
            className={className}
            heading={`Option #${index + 1}`}
            headingLevel={5}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="translucent"
                    colorVariant="danger"
                    disabled={disabled}
                    spacing="sm"
                >
                    <PiTrash />
                </Button>
            )}
            withShadow
            withBackground
            withPadding
        >
            <ListLayout layout="block">
                <ListLayout
                    layout="grid"
                    minGridColumnSize="6rem"
                    spacing="sm"
                >
                    <TextInput
                        label="Title"
                        name="title"
                        value={value.title}
                        onChange={setFieldValue}
                        error={error?.title}
                        disabled={disabled}
                        spacing="sm"
                        hint="Provide 'Title' for each answer option (e.g. Yes, No, Offset)"
                    />
                    <NumberInput
                        label="Value"
                        name="value"
                        value={value.value}
                        onChange={setFieldValue}
                        error={error?.value}
                        disabled={disabled}
                        spacing="sm"
                        hint="Choose the value for each answer choice (e.g. 1 - Yes, 0 - No, 3 - Offset)"
                    />
                    <IconSelectInput
                        label="Icon"
                        name="icon"
                        value={value.icon}
                        onChange={setFieldValue}
                        error={error?.icon}
                        nonClearable
                        disabled={disabled}
                        spacing="sm"
                        hint="Choose the icon for each answer choice (e.g. Checkmark - Yes, Close - No, Flag - Offset)"
                    />
                    <ColorSelectInput
                        label="Color"
                        name="iconColor"
                        value={value.iconColor}
                        onChange={setFieldValue}
                        error={error?.iconColor}
                        disabled={disabled}
                        spacing="sm"
                        hint="Choose the color for each answer choice (e.g. Green - Yes, Red - No, Orange - Offset)"
                    />
                    <GridLayoutItem columnSpan={2}>
                        <TextArea
                            label="Description"
                            name="description"
                            value={value.description}
                            onChange={setFieldValue}
                            error={error?.description}
                            disabled={disabled}
                            spacing="sm"
                            placeholder="Provide a brief description for each answer option (e.g. for Yes - The mapped outline does match the building footprint)"
                        />
                    </GridLayoutItem>
                </ListLayout>
                <NonFieldError error={error?.subOptions} />
                {isDefined(value.subOptions) && value.subOptions.length > 0 && (
                    <Container
                        heading="Sub options"
                        headingLevel={6}
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
                )}
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
            </ListLayout>
        </Container>
    );
}

export default CustomOptionInput;

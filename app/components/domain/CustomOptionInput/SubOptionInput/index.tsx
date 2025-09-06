import { PiTrash } from 'react-icons/pi';
import {
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import GridLayoutItem from '#components/GridLayoutItem';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';

import { PartialCustomSubOptionInputFields } from './schema';

interface Props {
    className?: string;
    index: number;
    value: PartialCustomSubOptionInputFields;
    onChange: (
        value: SetValueArg<PartialCustomSubOptionInputFields>,
        index: number,
    ) => void;
    error: ObjectError<PartialCustomSubOptionInputFields> | undefined;
    onRemove: (index: number) => void;
    disabled?: boolean;
}

function SubOptionInput(props: Props) {
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

    return (
        <InlineLayout
            className={className}
            start={`#${index + 1}`}
            end={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="transparent"
                    colorVariant="danger"
                    withoutPadding
                    disabled={disabled}
                >
                    <PiTrash />
                </Button>
            )}
            withCenterAlign
            spacing="sm"
        >
            <ListLayout
                layout="grid"
                numPreferredGridColumns={3}
                withFullWidth
                minGridColumnSize="3rem"
                spacing="sm"
            >
                <NumberInput
                    placeholder="Value"
                    name="value"
                    value={value.value}
                    onChange={setFieldValue}
                    error={error?.value}
                    disabled={disabled}
                    spacing="sm"
                />
                <GridLayoutItem columnSpan={2}>
                    <TextInput
                        placeholder="Description"
                        name="description"
                        value={value.description}
                        onChange={setFieldValue}
                        error={error?.description}
                        disabled={disabled}
                        spacing="sm"
                    />
                </GridLayoutItem>
            </ListLayout>
        </InlineLayout>
    );
}

export default SubOptionInput;

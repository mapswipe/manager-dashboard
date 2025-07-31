import { IoTrashBin } from 'react-icons/io5';
import {
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import GridLayoutItem from '#components/GridLayoutItem';
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
}

function SubOptionInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    return (
        <Container
            className={className}
            heading={`Sub Option #${index + 1}`}
            headingLevel={6}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="transparent"
                    colorVariant="danger"
                    start={<IoTrashBin />}
                    withoutPadding
                >
                    Remove
                </Button>
            )}
        >
            <ListLayout
                layout="grid"
                numPreferredGridColumns={3}
                minGridColumnSize="6rem"
            >
                <GridLayoutItem columnSpan={1}>
                    <NumberInput
                        label="Value"
                        name="value"
                        value={value.value}
                        onChange={setFieldValue}
                        error={error?.value}
                    />
                </GridLayoutItem>
                <GridLayoutItem columnSpan={2}>
                    <TextInput
                        label="Description"
                        name="description"
                        value={value.description}
                        onChange={setFieldValue}
                        error={error?.description}
                    />
                </GridLayoutItem>
            </ListLayout>
        </Container>
    );
}

export default SubOptionInput;

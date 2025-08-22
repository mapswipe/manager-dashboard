import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';

import { PartialValidateImagePropertyInputFields } from './schema';

interface Props {
    className?: string;
    value: PartialValidateImagePropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialValidateImagePropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialValidateImagePropertyInputFields>;
    disabled?: boolean;
}

function ValidateImagePropertyInput(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <ListLayout
            className={className}
            layout="grid"
            numPreferredGridColumns={2}
            minGridColumnSize="6rem"
        >
            <GridLayoutItem
                columnSpan={2}
            >
                <TextInput
                    icons="URL:"
                    name="url"
                    value={value?.url}
                    onChange={setFieldValue}
                    error={error?.url}
                    disabled={disabled}
                />
            </GridLayoutItem>
            <NumberInput
                icons="Width:"
                name="width"
                value={value?.width}
                onChange={setFieldValue}
                error={error?.width}
                disabled={disabled}
            />
            <NumberInput
                icons="Height:"
                name="height"
                value={value?.height}
                onChange={setFieldValue}
                error={error?.height}
                disabled={disabled}
            />
            <GridLayoutItem
                columnSpan={2}
            >
                <TextArea
                    label="Annotation"
                    name="url"
                    value={JSON.stringify(value?.annotation)}
                    // onChange={setFieldValue}
                    error={error?.url}
                    disabled={disabled}
                />
            </GridLayoutItem>
        </ListLayout>
    );
}

export default ValidateImagePropertyInput;

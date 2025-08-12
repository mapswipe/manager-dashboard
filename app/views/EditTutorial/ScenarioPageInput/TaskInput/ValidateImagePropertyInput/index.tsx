import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
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
            numPreferredGridColumns={3}
            minGridColumnSize="6rem"
        >
            <TextInput
                label="URL"
                name="url"
                value={value?.url}
                onChange={setFieldValue}
                error={error?.url}
                disabled={disabled}
            />
            <NumberInput
                label="Width"
                name="width"
                value={value?.width}
                onChange={setFieldValue}
                error={error?.width}
                disabled={disabled}
            />
            <NumberInput
                label="Height"
                name="height"
                value={value?.height}
                onChange={setFieldValue}
                error={error?.height}
                disabled={disabled}
            />
        </ListLayout>
    );
}

export default ValidateImagePropertyInput;

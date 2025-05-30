import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';

import { PartialFindPropertyInputFields } from './schema';

interface Props {
    className?: string;
    value: PartialFindPropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialFindPropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialFindPropertyInputFields>;
    disabled?: boolean;
}

function FindPropertyInput(props: Props) {
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
        >
            <NumberInput
                name="tileX"
                label="X"
                value={value?.tileX}
                onChange={setFieldValue}
                error={error?.tileX}
                disabled={disabled}
            />
            <NumberInput
                name="tileY"
                label="Y"
                value={value?.tileY}
                onChange={setFieldValue}
                error={error?.tileY}
                disabled={disabled}
            />
            <NumberInput
                name="tileZ"
                label="Z"
                value={value?.tileZ}
                onChange={setFieldValue}
                error={error?.tileZ}
                disabled={disabled}
            />
        </ListLayout>
    );
}

export default FindPropertyInput;

import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';

import { PartialComparePropertyInputFields } from './schema';

interface Props {
    className?: string;
    value: PartialComparePropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialComparePropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialComparePropertyInputFields>;
    disabled?: boolean;
}

function ComparePropertyInput(props: Props) {
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

export default ComparePropertyInput;

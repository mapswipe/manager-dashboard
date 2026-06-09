import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';

import { PartialLocateObjectPropertyInputFields } from './schema';

interface Props {
    className?: string;
    value: PartialLocateObjectPropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialLocateObjectPropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialLocateObjectPropertyInputFields>;
    disabled?: boolean;
}

function LocateObjectPropertyInput(props: Props) {
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
            spacing="sm"
        >
            <NumberInput
                name="tileX"
                icons="X:"
                value={value?.tileX}
                onChange={setFieldValue}
                error={error?.tileX}
                disabled={disabled}
            />
            <NumberInput
                name="tileY"
                icons="Y:"
                value={value?.tileY}
                onChange={setFieldValue}
                error={error?.tileY}
                disabled={disabled}
            />
            <NumberInput
                name="tileZ"
                icons="Z:"
                value={value?.tileZ}
                onChange={setFieldValue}
                error={error?.tileZ}
                disabled={disabled}
            />
        </ListLayout>
    );
}

export default LocateObjectPropertyInput;

import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import NumberInput from '#components/NumberInput';

import { PartialCompletenessPropertyInputFields } from './schema';

interface Props {
    className?: string;
    value: PartialCompletenessPropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialCompletenessPropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialCompletenessPropertyInputFields>;
    disabled?: boolean;
}

function CompletenessPropertyInput(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <div className={className}>
            <NumberInput
                name="tileX"
                label="tileX"
                value={value?.tileX}
                onChange={setFieldValue}
                error={error?.tileX}
                disabled={disabled}
            />
            <NumberInput
                name="tileY"
                label="tileY"
                value={value?.tileY}
                onChange={setFieldValue}
                error={error?.tileY}
                disabled={disabled}
            />
            <NumberInput
                name="tileZ"
                label="tileZ"
                value={value?.tileZ}
                onChange={setFieldValue}
                error={error?.tileZ}
                disabled={disabled}
            />
        </div>
    );
}

export default CompletenessPropertyInput;

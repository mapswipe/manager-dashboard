import { _cs } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';

import { PartialValidatePropertyInputFields } from './schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    value: PartialValidatePropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialValidatePropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialValidatePropertyInputFields>;
    disabled?: boolean;
}

function ValidatePropertyInput(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <div className={_cs(className, styles.validatePropertyInput)}>
            <NumberInput
                label="Identifier"
                name="identifier"
                value={value?.identifier}
                error={error?.identifier}
                onChange={setFieldValue}
                disabled={disabled}
            />
            <TextArea
                className={styles.geometry}
                label="Object Geometry"
                name="objectGeometry"
                value={value?.objectGeometry}
                error={error?.objectGeometry}
                onChange={setFieldValue}
                disabled={disabled}
                rows={22}
            />
        </div>
    );
}

export default ValidatePropertyInput;

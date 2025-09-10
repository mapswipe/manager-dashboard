import { _cs } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';

import { PartialStreetPropertyInputFields } from './schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    value: PartialStreetPropertyInputFields | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialStreetPropertyInputFields>) => void;
    error: LeafError | ObjectError<PartialStreetPropertyInputFields>;
    disabled?: boolean;
}

function StreetPropertyInput(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <div className={_cs(className, styles.streetPropertyInput)}>
            <TextInput
                label="Mapillary Image ID"
                name="mapillaryImageId"
                value={value?.mapillaryImageId}
                error={error?.mapillaryImageId}
                onChange={setFieldValue}
                disabled={disabled}
            />
            <TextArea
                className={styles.geometry}
                label="Geometry"
                name="geometry"
                value={value?.geometry}
                error={error?.geometry}
                onChange={setFieldValue}
                disabled={disabled}
                rows={22}
            />
        </div>
    );
}

export default StreetPropertyInput;

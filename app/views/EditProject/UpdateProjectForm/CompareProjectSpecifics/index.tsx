import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import NumberInput from '#components/NumberInput';

import TileServerInput from '../TileServerInput';
import {
    defaultTileServerInputFormValue,
    PartialTileServerInputFields,
} from '../TileServerInput/schema';
import { type PartialCompareSpecificFields } from './schema';

import styles from './styles.module.css';

interface Props {
    value: PartialCompareSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialCompareSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialCompareSpecificFields>) => void;
    disabled?: boolean;
}

function CompareProjectSpecifics(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialTileServerInputFields>(
        'tileServerProperty',
        setFieldValue,
        defaultTileServerInputFormValue,
    );

    const setTileServerBInputFieldValue = useFormObject<'tileServerBProperty', PartialTileServerInputFields>(
        'tileServerBProperty',
        setFieldValue,
        defaultTileServerInputFormValue,
    );

    return (
        <div className={styles.compare}>
            <NumberInput
                label="Zoom level"
                name="zoomLevel"
                value={value?.zoomLevel}
                onChange={setFieldValue}
                error={error?.zoomLevel}
                disabled={disabled}
            />
            <TileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
            />
            <TileServerInput
                label="Tile server B"
                value={value?.tileServerBProperty}
                error={error?.tileServerBProperty}
                setFieldValue={setTileServerBInputFieldValue}
                disabled={disabled}
            />
        </div>
    );
}

export default CompareProjectSpecifics;

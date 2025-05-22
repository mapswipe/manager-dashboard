import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import NumberInput from '#components/NumberInput';
import AssetInput from '#views/EditProject/AssetInput';

import TileServerInput from '../TileServerInput';
import {
    defaultTileServerInputFormValue,
    PartialTileServerInputFields,
} from '../TileServerInput/schema';
import { type PartialCompletenessSpecificFields } from './schema';

import styles from './styles.module.css';

interface Props {
    projectId: string;
    value: PartialCompletenessSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialCompletenessSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialCompletenessSpecificFields>) => void;
    disabled?: boolean;
}

function CompletenessProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialTileServerInputFields>(
        'tileServerProperty' as const,
        setFieldValue,
        defaultTileServerInputFormValue,
    );

    const setTileServerBInputFieldValue = useFormObject<'tileServerBProperty', PartialTileServerInputFields>(
        'tileServerBProperty' as const,
        setFieldValue,
        defaultTileServerInputFormValue,
    );

    return (
        <div className={styles.completeness}>
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
                value={value?.tileServerBProperty}
                error={error?.tileServerBProperty}
                setFieldValue={setTileServerBInputFieldValue}
                disabled={disabled}
            />
            <AssetInput
                label="AOI geometry"
                projectId={projectId}
                name="aoiGeometry"
                onChange={setFieldValue}
                value={value?.aoiGeometry}
                error={error?.aoiGeometry}
                hint="Upload your project area as GeoJSON File (max. 1MB). Make sure that you provide a single polygon geometry."
                disabled={disabled}
            />
        </div>
    );
}

export default CompletenessProjectSpecifics;

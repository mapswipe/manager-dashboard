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
    defaultTileServerInputValue,
    PartialTileServerInputFields,
} from '../TileServerInput/schema';
import { type PartialCompareSpecificFields } from './schema';

interface Props {
    projectId: string;
    value: PartialCompareSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialCompareSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialCompareSpecificFields>) => void;
    disabled?: boolean;
}

function CompareProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialTileServerInputFields>(
        'tileServerProperty',
        setFieldValue,
        defaultTileServerInputValue,
    );

    const setTileServerBInputFieldValue = useFormObject<'tileServerBProperty', PartialTileServerInputFields>(
        'tileServerBProperty',
        setFieldValue,
        defaultTileServerInputValue,
    );

    return (
        <>
            <AssetInput
                label="AOI geometry"
                projectId={projectId}
                name="aoiGeometry"
                onChange={setFieldValue}
                value={value?.aoiGeometry}
                error={error?.aoiGeometry}
                hint="Upload your project area as GeoJSON File (max. 1MB). Make sure that you provide a single polygon geometry."
                disabled={disabled}
                withoutPreview
            />
            <TileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
            />
            <TileServerInput
                label="Tile server B"
                value={value?.tileServerBProperty}
                error={error?.tileServerBProperty}
                setFieldValue={setTileServerBInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
            />
            <NumberInput
                label="Zoom level"
                name="zoomLevel"
                value={value?.zoomLevel}
                onChange={setFieldValue}
                error={error?.zoomLevel}
                disabled={disabled}
            />
        </>
    );
}

export default CompareProjectSpecifics;

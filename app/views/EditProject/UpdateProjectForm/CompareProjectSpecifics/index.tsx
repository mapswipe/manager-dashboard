import { isDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import AssetInput from '#components/domain/AssetInput';
import RasterTileServerInput from '#components/domain/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    type PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';
import ZoomLevelSelectInput from '#components/ZoomLevelSelectInput';
import { ProjectAssetInputTypeEnum } from '#generated/types/graphql';

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

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialRasterTileServerInputFields>(
        'tileServerProperty',
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    const setTileServerBInputFieldValue = useFormObject<'tileServerBProperty', PartialRasterTileServerInputFields>(
        'tileServerBProperty',
        setFieldValue,
        defaultRasterTileServerInputValue,
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
                inputType={ProjectAssetInputTypeEnum.AoiGeometry}
                hint="Upload your project area as GeoJSON File (max. 1MB). Make sure that you provide a single polygon geometry."
                disabled={disabled}
                withoutPreview
            />
            <RasterTileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
                zoomLevel={isDefined(value?.zoomLevel) ? value.zoomLevel : undefined}
            />
            <RasterTileServerInput
                label="Tile server B"
                value={value?.tileServerBProperty}
                error={error?.tileServerBProperty}
                setFieldValue={setTileServerBInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
                zoomLevel={isDefined(value?.zoomLevel) ? value.zoomLevel : undefined}
            />
            <ZoomLevelSelectInput
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

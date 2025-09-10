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

import { PartialOverlayTileServerPropertyInputFields } from './OverlayTileServerPropertyInput/schema';
import OverlayTileServerPropertyInput from './OverlayTileServerPropertyInput';
import { type PartialCompletenessSpecificFields } from './schema';

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

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialRasterTileServerInputFields>(
        'tileServerProperty' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    const setOverlayTileServerInputFieldValue = useFormObject<'overlayTileServerProperty', PartialOverlayTileServerPropertyInputFields>(
        'overlayTileServerProperty' as const,
        setFieldValue,
        {},
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
                hint="Upload your project area as GeoJSON File (max. 1MB)"
                disabled={disabled}
                withoutPreview
            />
            <ZoomLevelSelectInput
                name="zoomLevel"
                value={value?.zoomLevel}
                onChange={setFieldValue}
                error={error?.zoomLevel}
                disabled={disabled}
            />
            <RasterTileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
                zoomLevel={value?.zoomLevel}
            />
            <OverlayTileServerPropertyInput
                value={value?.overlayTileServerProperty}
                error={error?.overlayTileServerProperty}
                setFieldValue={setOverlayTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
                baseTileServer={value?.tileServerProperty}
                zoomLevel={value?.zoomLevel}
            />
        </>
    );
}

export default CompletenessProjectSpecifics;

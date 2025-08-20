import {
    getLayerName,
    MapOrder,
} from '@togglecorp/re-map';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';
import { type } from 'arktype';

import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import RasterTileMapSource from '#components/domain/RasterTileMapSource';
import RasterTileServerInput from '#components/domain/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import { ProjectOverlayRasterTileServerConfig } from '#generated/types/graphql';

import { PartialOverlayRasterTileConfigInputFields } from './schema';

interface Props {
    aoiGeoJsonAssetId: string | undefined;
    value: PartialOverlayRasterTileConfigInputFields | undefined | null;
    error: LeafError | ObjectError<PartialOverlayRasterTileConfigInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialOverlayRasterTileConfigInputFields>) => void;
    disabled?: boolean;
    baseTileServer: PartialRasterTileServerInputFields | undefined;
    zoomLevel?: number;
}

function OverlayRasterTileConfigInput(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
        disabled,
        aoiGeoJsonAssetId,
        baseTileServer,
        zoomLevel,
    } = props;

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServer', PartialRasterTileServerInputFields>(
        'tileServer' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    const tileConfigValue = type.object.as<ProjectOverlayRasterTileServerConfig>()(
        value,
    );

    return (
        <>
            <NumberInput
                label="Opacity"
                name="opacity"
                value={value?.opacity}
                onChange={setFieldValue}
                error={error?.opacity}
                disabled={disabled}
            />
            <ListLayout layout="grid">
                <RasterTileServerInput
                    label={null}
                    value={value?.tileServer}
                    error={error?.tileServer}
                    setFieldValue={setTileServerInputFieldValue}
                    disabled={disabled}
                    aoiGeoJsonAssetId={aoiGeoJsonAssetId}
                    withoutPreview
                />
                <BaseMap baseTileServer={baseTileServer}>
                    <DefaultMapContainer />
                    <GeoJsonAssetMapSource
                        geoJsonAssetId={aoiGeoJsonAssetId}
                        zoomLevel={zoomLevel}
                    />
                    {!(tileConfigValue instanceof type.errors) && (
                        <RasterTileMapSource
                            tileConfig={tileConfigValue}
                        />
                    )}
                    <MapOrder
                        ordering={[
                            getLayerName('base-tile-source', 'base-tile-layer', true),
                            getLayerName(
                                `overlay-raster-source-${value?.tileServer?.name}`,
                                `overlay-raster-layer-${value?.tileServer?.name}`,
                                true,
                            ),
                        ]}
                    />
                </BaseMap>
            </ListLayout>
        </>
    );
}

export default OverlayRasterTileConfigInput;

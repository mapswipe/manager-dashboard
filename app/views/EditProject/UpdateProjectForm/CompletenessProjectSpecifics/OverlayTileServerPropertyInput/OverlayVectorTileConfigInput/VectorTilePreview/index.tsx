import {
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    getLayerName,
    MapOrder,
} from '@togglecorp/re-map';
import { type } from 'arktype';

import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import MapZoomViewSelectInput, { MapZoomViewType } from '#components/domain/MapZoomViewSelectInput';
import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import VectorTileMapSource from '#components/domain/VectorTileMapSource';
import { vectorTileServerNameToTileInputKey } from '#components/domain/VectorTileServerInput/schema';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import { ProjectOverlayVectorTileServerConfig } from '#generated/types/graphql';

import { PartialOverlayVectorTileConfigInputFields } from '../schema';

interface Props {
    className?: string;
    baseTileServer: PartialRasterTileServerInputFields | undefined;
    aoiGeometryAssetId?: string;
    vectorTileConfig: PartialOverlayVectorTileConfigInputFields | undefined;
    zoomLevel?: number;
}

function VectorTilePreview(props: Props) {
    const {
        className,
        baseTileServer,
        vectorTileConfig,
        aoiGeometryAssetId,
        zoomLevel,
    } = props;

    const [zoomView, setZoomView] = useState<MapZoomViewType>('aoiBounds');

    const sourceLayer = useMemo(() => {
        if (isNotDefined(vectorTileConfig) || isNotDefined(vectorTileConfig.tileServer)) {
            return {};
        }

        const { name } = vectorTileConfig.tileServer;

        if (isNotDefined(name)) {
            return undefined;
        }

        const tileServer = vectorTileConfig.tileServer[
            vectorTileServerNameToTileInputKey[name]
        ];

        return tileServer?.sourceLayer;
    }, [vectorTileConfig]);

    const vectorTileConfigValue = type.object.as<ProjectOverlayVectorTileServerConfig>()(
        vectorTileConfig,
    );

    return (
        <ListLayout
            layout="block"
            className={className}
        >
            <BaseMap baseTileServer={baseTileServer}>
                <DefaultMapContainer compact />
                {!(vectorTileConfigValue instanceof type.errors) && (
                    <VectorTileMapSource
                        tileConfig={vectorTileConfigValue}
                    />
                )}
                <GeoJsonAssetMapSource
                    geoJsonAssetId={aoiGeometryAssetId}
                    zoomLevel={zoomView === 'zoomLevel' ? zoomLevel : undefined}
                />
                <MapOrder
                    ordering={[
                        getLayerName('base-tile-source', 'base-tile-layer', true),
                        getLayerName(
                            `overlay-source-${vectorTileConfig?.tileServer?.name}`,
                            `overlay-fill-layer-${sourceLayer}`,
                            true,
                        ),
                        getLayerName(
                            `overlay-source-${vectorTileConfig?.tileServer?.name}`,
                            `overlay-line-layer-${sourceLayer}`,
                            true,
                        ),
                    ]}
                />
            </BaseMap>
            {isDefined(zoomLevel) && (
                <InlineLayout withCenteredContent>
                    <MapZoomViewSelectInput
                        value={zoomView}
                        onChange={setZoomView}
                    />
                </InlineLayout>
            )}
        </ListLayout>
    );
}

export default VectorTilePreview;

import { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    getLayerName,
    MapContainer,
    MapOrder,
} from '@togglecorp/re-map';
import { type } from 'arktype';

import BaseMap from '#components/domain/BaseMap';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import VectorTileMapSource from '#components/domain/VectorTileMapSource';
import { vectorTileServerNameToTileInputKey } from '#components/domain/VectorTileServerInput/schema';
import { ProjectOverlayVectorTileServerConfig } from '#generated/types/graphql';

import { PartialOverlayVectorTileConfigInputFields } from '../schema';

import styles from './styles.module.css';

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
        <BaseMap baseTileServer={baseTileServer}>
            <MapContainer
                className={_cs(styles.vectorTilePreview, className)}
            />
            {!(vectorTileConfigValue instanceof type.errors) && (
                <VectorTileMapSource
                    tileConfig={vectorTileConfigValue}
                />
            )}
            <GeoJsonAssetMapSource
                geoJsonAssetId={aoiGeometryAssetId}
                zoomLevel={zoomLevel}
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
    );
}

export default VectorTilePreview;

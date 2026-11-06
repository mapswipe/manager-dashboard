import {
    ComponentProps,
    useContext,
    useMemo,
} from 'react';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { removeNull } from '@togglecorp/toggle-form';

import TileServerContext from '#contexts/TileServerContext';
import {
    ProjectOverlayRasterTileServerConfig,
    RasterTileServerNameEnum,
} from '#generated/types/graphql';
import { standardizeQuadKey } from '#utils/geo';

interface Props {
    tileConfig: ProjectOverlayRasterTileServerConfig | undefined;
    tileSize?: number;
}

function RasterTileMapSource(props: Props) {
    const {
        tileConfig,
        tileSize,
    } = props;

    const { raster: rasterTileServers } = useContext(TileServerContext);

    const {
        url,
        credits,
    } = useMemo(() => {
        const rasterTileServerMapping = listToMap(
            rasterTileServers,
            ({ type }) => type,
        );

        if (isNotDefined(tileConfig) || isNotDefined(tileConfig.tileServer)) {
            return {};
        }

        const { name } = tileConfig.tileServer;

        if (isNotDefined(name)) {
            return {};
        }

        if (name === RasterTileServerNameEnum.Custom) {
            return {
                url: tileConfig.tileServer.custom?.url,
                credits: tileConfig.tileServer.custom?.credits,
            };
        }

        return {
            url: rasterTileServerMapping[name]?.url,
            credits: rasterTileServerMapping[name]?.credits,
        };
    }, [tileConfig, rasterTileServers]);

    const sourceOptions = useMemo<ComponentProps<typeof MapSource>['sourceOptions']>(() => {
        if (isNotDefined(url)) {
            return undefined;
        }

        // NOTE: No zoom range, as the app fetches the overlay at the project zoom
        return removeNull({
            type: 'raster',
            // NOTE: maplibre uses `quadkey` but mapswipe backend uses `quad_key`
            tiles: [standardizeQuadKey(url)],
            tileSize: tileSize ?? null,
            attribution: credits ?? '',
        });
    }, [url, credits, tileSize]);

    const rasterLayerOptions = useMemo<Omit<maplibregl.RasterLayerSpecification, 'id' | 'source'> | undefined>(() => {
        if (isNotDefined(tileConfig)) {
            return undefined;
        }

        return {
            type: 'raster',
            paint: {
                'raster-opacity': tileConfig.opacity,
            },
        };
    }, [tileConfig]);

    if (isNotDefined(sourceOptions) || isNotDefined(rasterLayerOptions)) {
        return null;
    }

    if (isNotDefined(tileConfig) || isNotDefined(tileConfig.tileServer)) {
        return null;
    }

    const sourceKey = `overlay-raster-source-${tileConfig.tileServer.name}`;
    const rasterLayerKey = `overlay-raster-layer-${tileConfig.tileServer.name}`;

    return (
        <MapSource
            key={sourceKey}
            sourceKey={sourceKey}
            sourceOptions={sourceOptions}
        >
            <MapLayer
                key={rasterLayerKey}
                layerKey={rasterLayerKey}
                layerOptions={rasterLayerOptions}
            />
        </MapSource>
    );
}

export default RasterTileMapSource;

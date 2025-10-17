import {
    ComponentProps,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
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
import useDebouncedValue from '#hooks/useDebouncedValue';
import { standardizeQuadKey } from '#utils/geo';

interface Props {
    tileConfig: ProjectOverlayRasterTileServerConfig | undefined;
}

function RasterTileMapSource(props: Props) {
    const { tileConfig } = props;

    const { raster: rasterTileServers } = useContext(TileServerContext);

    const {
        url,
        credits,
        minZoom,
        maxZoom,
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
                minZoom: tileConfig.tileServer.custom?.minZoom,
                maxZoom: tileConfig.tileServer.custom?.maxZoom,
            };
        }

        return {
            url: rasterTileServerMapping[name]?.url,
            credits: rasterTileServerMapping[name]?.credits,
            minZoom: rasterTileServerMapping[name]?.minZoom,
            maxZoom: rasterTileServerMapping[name]?.maxZoom,
        };
    }, [tileConfig, rasterTileServers]);

    // FIXME(frozenhelium): This is a hack to fix cases when layer is added before source
    const [mountLayer, setMountLayer] = useState(false);
    useEffect(
        () => {
            setMountLayer(isDefined(url));
        },
        [url],
    );
    const debouncedMounted = useDebouncedValue(mountLayer, 1000);

    const sourceOptions = useMemo<ComponentProps<typeof MapSource>['sourceOptions']>(() => {
        if (isNotDefined(url)) {
            return undefined;
        }

        return removeNull({
            type: 'raster',
            // NOTE: maplibre uses `quadkey` but mapswipe backend uses `quad_key`
            tiles: [standardizeQuadKey(url)],
            attribution: credits ?? '',
            minzoom: minZoom ?? null,
            maxzoom: maxZoom ?? null,
        });
    }, [url, credits, minZoom, maxZoom]);

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
            {debouncedMounted && (
                <MapLayer
                    key={rasterLayerKey}
                    layerKey={rasterLayerKey}
                    layerOptions={rasterLayerOptions}
                />
            )}
        </MapSource>
    );
}

export default RasterTileMapSource;

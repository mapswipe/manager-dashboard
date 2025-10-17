import {
    useContext,
    useMemo,
} from 'react';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import Map from '@togglecorp/re-map';
import { removeNull } from '@togglecorp/toggle-form';
import { type } from 'arktype';

import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import TileServerContext from '#contexts/TileServerContext';
import { RasterTileServerNameEnum } from '#generated/types/graphql';
import { standardizeQuadKey } from '#utils/geo';

const FALLBACK_TILE_URL = 'https://tiles.versatiles.org/assets/styles/eclipse/style.json';

const defaultMapOptions: Omit<maplibregl.MapOptions, 'container' | 'style' | 'children'> = {
    center: [0, 0],
    zoom: 1,
    attributionControl: false,
    scrollZoom: false,
    boxZoom: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
};

interface Props {
    baseTileServer: PartialRasterTileServerInputFields | undefined;
    children?: React.ReactNode;
    tileSize?: number;
    disablePan?: boolean;
}

function BaseMap(props: Props) {
    const {
        baseTileServer,
        children,
        tileSize = 512,
        disablePan,
    } = props;

    const { raster: rasterTileServers } = useContext(TileServerContext);

    const mapInfo = useMemo(() => {
        const rasterTileServerMapping = listToMap(
            rasterTileServers,
            ({ type: tileType }) => tileType,
        );

        if (isNotDefined(baseTileServer)) {
            return FALLBACK_TILE_URL;
        }

        const { name } = baseTileServer;

        if (isNotDefined(name)) {
            return {
                url: undefined,
                credits: undefined,
                minzoom: undefined,
                maxzoom: undefined,
            };
        }

        if (name === RasterTileServerNameEnum.Custom) {
            return {
                url: baseTileServer.custom?.url,
                credits: baseTileServer.custom?.credits,
                minzoom: baseTileServer.custom?.minZoom,
                maxzoom: baseTileServer.custom?.maxZoom,
            };
        }

        return {
            url: rasterTileServerMapping[name]?.url,
            credits: rasterTileServerMapping[name]?.credits,
            minzoom: baseTileServer.custom?.minZoom,
            maxzoom: baseTileServer.custom?.maxZoom,
        };
    }, [baseTileServer, rasterTileServers]);

    const mapStyle = useMemo(() => {
        if (typeof mapInfo === 'string') {
            return mapInfo;
        }

        const result = type('string.url')(mapInfo.url);

        if (result instanceof type.errors) {
            const spec: maplibregl.StyleSpecification = {
                version: 8,
                sources: {},
                layers: [],
            };
            return spec;
        }

        const spec: maplibregl.StyleSpecification = {
            version: 8,
            sources: {
                'base-tile-source': removeNull({
                    type: 'raster',
                    // NOTE: maplibre uses `quadkey` but mapswipe backend uses `quad_key`
                    tiles: [standardizeQuadKey(result)],
                    tileSize,
                    attribution: mapInfo.credits ?? '',
                    minzoom: mapInfo.minzoom ?? null,
                    maxzoom: mapInfo.maxzoom ?? null,
                }),
            },
            layers: [{
                id: 'base-tile-layer',
                type: 'raster',
                source: 'base-tile-source',
            }],
        };
        return spec;
    }, [mapInfo, tileSize]);

    const mapOptions = useMemo(() => ({
        ...defaultMapOptions,
        dragPan: !disablePan,
    }), [disablePan]);

    return (
        <Map
            mapStyle={mapStyle}
            mapOptions={mapOptions}
        >
            {children}
        </Map>
    );
}

export default BaseMap;

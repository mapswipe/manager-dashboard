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

import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import TileServerContext from '#contexts/TileServerContext';
import { RasterTileServerNameEnum } from '#generated/types/graphql';
import { standardizeQuadKey } from '#utils/geo';

const FALLBACK_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const FALLBACK_TILE_CREDITS = 'Map data from OpenStreetMap';

const defaultMapOptions: Omit<maplibregl.MapOptions, 'container' | 'style' | 'children'> = {
    center: [0, 0],
    zoom: 0,
    attributionControl: false,
    scrollZoom: false,
    doubleClickZoom: false,
};

interface Props {
    baseTileServer: PartialRasterTileServerInputFields | undefined;
    children?: React.ReactNode;
    tileSize?: number;
}

function BaseMap(props: Props) {
    const {
        baseTileServer,
        children,
        tileSize = 256,
    } = props;

    const { raster: rasterTileServers } = useContext(TileServerContext);

    const {
        url,
        credits,
        minzoom,
        maxzoom,
    } = useMemo(() => {
        const rasterTileServerMapping = listToMap(
            rasterTileServers,
            ({ type }) => type,
        );

        if (isNotDefined(baseTileServer)) {
            return {
                url: FALLBACK_TILE_URL,
                credits: FALLBACK_TILE_CREDITS,
                minzoom: undefined,
                maxzoom: undefined,
            };
        }

        const { name } = baseTileServer;

        if (isNotDefined(name)) {
            return {
                url: FALLBACK_TILE_URL,
                credits: FALLBACK_TILE_CREDITS,
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

    const mapStyle = useMemo<maplibregl.StyleSpecification | undefined>(() => {
        if (isNotDefined(url)) {
            return undefined;
        }

        return {
            version: 8,
            sources: {
                'base-tile-source': removeNull({
                    type: 'raster',
                    // NOTE: maplibre uses `quadkey` but mapswipe backend uses `quad_key`
                    tiles: [standardizeQuadKey(url)],
                    tileSize,
                    attribution: credits ?? '',
                    minzoom: minzoom ?? null,
                    maxzoom: maxzoom ?? null,
                }),
            },
            layers: [{
                id: 'base-tile-layer',
                type: 'raster',
                source: 'base-tile-source',
            }],
        };
    }, [url, tileSize, credits, minzoom, maxzoom]);

    return (
        <Map
            mapStyle={mapStyle}
            mapOptions={defaultMapOptions}
        >
            {children}
        </Map>
    );
}

export default BaseMap;

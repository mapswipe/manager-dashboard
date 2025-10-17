import {
    useContext,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
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

    const rasterTileServerMapping = useMemo(() => listToMap(
        rasterTileServers,
        ({ type: tileType }) => tileType,
    ), [rasterTileServers]);

    const name = baseTileServer?.name;
    const custom = name === RasterTileServerNameEnum.Custom
        ? baseTileServer?.custom
        : undefined;

    const tileUrl = isDefined(name) ? rasterTileServerMapping[name]?.url : undefined;
    const tileCredits = isDefined(name) ? rasterTileServerMapping[name]?.credits : undefined;
    const minZoom = isDefined(name) ? rasterTileServerMapping[name]?.minZoom : undefined;
    const maxZoom = isDefined(name) ? rasterTileServerMapping[name]?.maxZoom : undefined;

    const baseTileServerDefined = isDefined(baseTileServer);

    const mapInfo = useMemo(() => {
        if (!baseTileServerDefined) {
            return FALLBACK_TILE_URL;
        }

        if (isNotDefined(name)) {
            return undefined;
        }

        if (name === RasterTileServerNameEnum.Custom) {
            if (isNotDefined(custom)) {
                return undefined;
            }

            return {
                url: custom.url,
                credits: custom.credits,
                minzoom: custom.minZoom,
                maxzoom: custom.maxZoom,
            };
        }

        return {
            url: tileUrl,
            credits: tileCredits,
            minzoom: minZoom,
            maxzoom: maxZoom,
        };
    }, [baseTileServerDefined, custom, maxZoom, minZoom, name, tileCredits, tileUrl]);

    const mapStyle = useMemo(() => {
        if (typeof mapInfo === 'string') {
            return mapInfo;
        }

        if (isNotDefined(mapInfo)) {
            return undefined;
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

    const mapKey = useMemo(() => (
        // FIXME(frozenhelium): map key is added here
        // to completely destroy and create a new map
        // to avoid race condition while recreating layers and sources
        randomString()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [mapStyle]);

    if (isNotDefined(mapStyle)) {
        return null;
    }

    return (
        <Map
            key={mapKey}
            mapStyle={mapStyle}
            mapOptions={mapOptions}
        >
            {children}
        </Map>
    );
}

export default BaseMap;

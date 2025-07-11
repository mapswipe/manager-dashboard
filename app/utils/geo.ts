import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

export function tileToLng(x: number, z: number) {
    return (x / (2 ** z)) * 360 - 180;
}

export function tileToLat(y: number, z: number) {
    const n = Math.PI - 2 * Math.PI * (y / (2 ** z));
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export function createGeoJsonFromTiles(
    tiles: {
        tileX: number | undefined,
        tileY: number | undefined,
        tileZ: number | undefined,
        reference: number | undefined,
    }[] | undefined,
) {
    if (isNotDefined(tiles) || tiles.length === 0) {
        return undefined;
    }

    const geojson: GeoJSON.GeoJSON = {
        type: 'FeatureCollection' as const,
        features: tiles.map((tile) => {
            const {
                tileX,
                tileY,
                tileZ,
                reference,
            } = tile;

            if (isNotDefined(tileX) || isNotDefined(tileY) || isNotDefined(tileZ)) {
                return undefined;
            }

            const west = tileToLng(tileX, tileZ);
            const east = tileToLng(tileX + 1, tileZ);
            const north = tileToLat(tileY, tileZ);
            const south = tileToLat(tileY + 1, tileZ);

            const feature = {
                type: 'Feature' as const,
                geometry: {
                    type: 'Polygon' as const,
                    coordinates: [[
                        [west, south],
                        [east, south],
                        [east, north],
                        [west, north],
                        [west, south],
                    ]],
                },
                properties: {
                    tile_x: tileX,
                    tile_y: tileY,
                    tile_z: tileZ,
                    reference: reference ?? 0,
                },
            };

            return feature;
        }).filter(isDefined),
    };

    return geojson;
}

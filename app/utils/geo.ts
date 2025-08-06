import { bboxToTile } from '@mapbox/tilebelt';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import turfBbox from '@turf/bbox';

type BoundingBox = [number, number, number, number];

export function getCenterFromBBox(bbox: BoundingBox | undefined): [number, number] {
    if (isNotDefined(bbox)) {
        return [0, 0];
    }

    const [minLon, minLat, maxLon, maxLat] = bbox;
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;
    return [centerLon, centerLat] as const; // [longitude, latitude]
}

export function getBbox(geoJson: GeoJSON.GeoJSON | undefined) {
    if (isNotDefined(geoJson)) {
        return undefined;
    }

    const bounds = turfBbox(geoJson);
    return [bounds[0], bounds[1], bounds[2], bounds[3]];
}

export function getZoomLevelFromBbox(bbox: BoundingBox | undefined) {
    if (isNotDefined(bbox)) {
        return 14;
    }

    const tile = bboxToTile(bbox);
    return tile[2];
}

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

    const tilesSafe = tiles.map((tile) => {
        const {
            tileX,
            tileY,
            tileZ,
        } = tile;

        if (isNotDefined(tileX) || isNotDefined(tileY) || isNotDefined(tileZ)) {
            return undefined;
        }

        return {
            ...tile,
            tileX,
            tileY,
            tileZ,
        };
    }).filter(isDefined);

    if (tilesSafe.length === 0) {
        return undefined;
    }

    const geojson: GeoJSON.GeoJSON = {
        type: 'FeatureCollection' as const,
        features: tilesSafe.map((tile) => {
            const {
                tileX,
                tileY,
                tileZ,
                reference,
            } = tile;

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

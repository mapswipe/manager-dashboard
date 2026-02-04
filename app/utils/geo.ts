import {
    bboxToTile,
    getChildren,
    tileToGeoJSON,
} from '@mapbox/tilebelt';
import {
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import turfBbox from '@turf/bbox';

export type BoundingBox = [number, number, number, number];

export function getCenterFromBBox(bbox: BoundingBox | undefined): [number, number] {
    if (isNotDefined(bbox)) {
        return [0, 0];
    }

    const [minLon, minLat, maxLon, maxLat] = bbox;
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;
    return [centerLon, centerLat] as const; // [longitude, latitude]
}

export function getBbox(geoJson: GeoJSON.GeoJSON | undefined): BoundingBox | undefined {
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

export function standardizeQuadKey(url: string) {
    // NOTE: maplibre uses `quadkey` but mapswipe backend uses `quad_key`
    return url.replace('{quad_key}', '{quadkey}');
}

export function createSubGridGeoJsonFromTile(
    x: number,
    y: number,
    z: number,
    subgridSize: 1 | 2 | 3,
    reference: (number | undefined)[] | undefined,
) {
    let childrenTiles = getChildren(
        [x, y, z],
    );

    if (subgridSize > 1) {
        new Array(subgridSize - 1).keys().forEach(() => {
            childrenTiles = childrenTiles.flatMap((tile) => (
                getChildren(tile)
            ));
        });
    }

    // 1, 2  ->  1.1 1.2  2.1 2.2
    // 3, 4      1.3 1.4  2.3 2.4
    //
    //           3.1 3.2  4.1 4.2
    //           3.3 3.4  4.3 4.4
    // For this, list would look like [1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2,3, ...]
    // Ordering it to [1.1, 1.2, 2.1, 2.2, 1.3, 1.4, 2.3, ...]
    // Fixing the order of subgrids (since they're created recursively)
    childrenTiles.sort(
        (a, b) => compareNumber(a[1], b[1]) || compareNumber(a[0], b[0]),
    );

    const geojson: GeoJSON.GeoJSON = {
        type: 'FeatureCollection' as const,
        features: childrenTiles.map((tile, i) => ({
            type: 'Feature' as const,
            geometry: tileToGeoJSON(tile),
            properties: {
                tile_x: x,
                tile_y: y,
                tile_z: z,
                reference: reference?.[i],
            },
        })),
    };

    return geojson;
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

            const feature = {
                type: 'Feature' as const,
                geometry: tileToGeoJSON([tileX, tileY, tileZ]),
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

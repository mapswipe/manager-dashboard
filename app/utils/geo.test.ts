import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    BoundingBox,
    getFitBbox,
    getRasterMaxViewZoom,
    getRasterTileZoom,
} from './geo';

describe('getFitBbox', () => {
    it('grows a point to 20 m around it', () => {
        const [minLon, minLat, maxLon, maxLat] = getFitBbox([85.3, 27.7, 85.3, 27.7]);

        const heightInMeters = (maxLat - minLat) * 111_320;
        const widthInMeters = (maxLon - minLon) * 111_320 * Math.cos((27.7 * Math.PI) / 180);

        expect(heightInMeters).toBeCloseTo(20);
        expect(widthInMeters).toBeCloseTo(20);
        expect((minLon + maxLon) / 2).toBeCloseTo(85.3);
        expect((minLat + maxLat) / 2).toBeCloseTo(27.7);
    });

    it('keeps a bbox larger than 20 m', () => {
        const bbox: BoundingBox = [85.3, 27.7, 85.31, 27.71];

        expect(getFitBbox(bbox)).toEqual(bbox);
    });

    it('grows only the dimension below 20 m', () => {
        const [minLon, minLat, maxLon, maxLat] = getFitBbox([85.3, 27.7, 85.31, 27.7]);

        expect(minLon).toBe(85.3);
        expect(maxLon).toBe(85.31);
        expect((maxLat - minLat) * 111_320).toBeCloseTo(20);
    });
});

describe('getRasterTileZoom', () => {
    it('fetches 256 px tiles one zoom above the map zoom', () => {
        expect(getRasterTileZoom(16, 256, 22)).toBe(17);
    });

    it('fetches 512 px tiles at the map zoom', () => {
        expect(getRasterTileZoom(16, 512, 22)).toBe(16);
    });

    it('rounds a fractional map zoom', () => {
        expect(getRasterTileZoom(16.4, 256, 22)).toBe(17);
        expect(getRasterTileZoom(16.6, 256, 22)).toBe(18);
    });

    it('caps at the max zoom', () => {
        expect(getRasterTileZoom(21, 256, 19)).toBe(19);
    });

    it('does not go below zoom 0', () => {
        expect(getRasterTileZoom(0, 512, 22)).toBe(0);
    });
});

describe('getRasterMaxViewZoom', () => {
    it('is one zoom below the max zoom for 256 px tiles', () => {
        expect(getRasterMaxViewZoom(256, 19)).toBe(18);
        expect(getRasterTileZoom(18, 256, 19)).toBe(19);
    });

    it('is the max zoom for 512 px tiles', () => {
        expect(getRasterMaxViewZoom(512, 19)).toBe(19);
    });
});

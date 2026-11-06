import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    BoundingBox,
    getFitBbox,
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

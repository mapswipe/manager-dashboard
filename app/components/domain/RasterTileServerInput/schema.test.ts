import {
    accumulateErrors,
    accumulateValues,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    describe,
    expect,
    it,
} from 'vitest';

import { RasterTileServerNameEnum } from '#generated/types/graphql';

import tileServerFormSchema, {
    type PartialRasterTileServerInputFields,
    type TileInputKeys,
    tileServerWithZoomRangeFormSchema,
} from './schema';

type TestCase = [TileInputKeys, PartialRasterTileServerInputFields];

describe('tileServerWithZoomRangeFormSchema', () => {
    it('accepts a layer switched to custom before custom is set', () => {
        const value: PartialRasterTileServerInputFields = {
            name: RasterTileServerNameEnum.Custom,
            bing: { credits: 'Bing' },
        };

        expect(() => accumulateErrors(
            value,
            tileServerWithZoomRangeFormSchema,
            value,
            undefined,
        )).not.toThrow();
    });

    it.each([
        ['custom', {
            name: RasterTileServerNameEnum.Custom,
            custom: {
                url: 'https://example.com/{z}/{x}/{y}.png',
                credits: 'Example',
                minZoom: 18,
                maxZoom: 17,
            },
        }],
        ['bing', {
            name: RasterTileServerNameEnum.Bing,
            bing: { credits: 'Bing', minZoom: 18, maxZoom: 17 },
        }],
    ] satisfies TestCase[])('rejects an inverted zoom range for %s', (key, value) => {
        const errors = getErrorObject(accumulateErrors(
            value,
            tileServerWithZoomRangeFormSchema,
            value,
            undefined,
        ));

        expect(getErrorObject(errors?.[key])?.minZoom).toBeDefined();
    });

    it('sends the zoom range of a preset', () => {
        const value: PartialRasterTileServerInputFields = {
            name: RasterTileServerNameEnum.Bing,
            bing: { credits: 'Bing', minZoom: 1, maxZoom: 19 },
        };

        expect(accumulateValues(
            value,
            tileServerWithZoomRangeFormSchema,
            value,
            undefined,
        )).toEqual(value);
    });
});

describe('tileServerFormSchema', () => {
    it.each([
        ['custom', {
            name: RasterTileServerNameEnum.Custom,
            custom: {
                url: 'https://example.com/{z}/{x}/{y}.png',
                credits: 'Example',
                minZoom: 1,
                maxZoom: 19,
            },
        }],
        ['bing', {
            name: RasterTileServerNameEnum.Bing,
            bing: { credits: 'Bing', minZoom: 1, maxZoom: 19 },
        }],
    ] satisfies TestCase[])('does not send the zoom range for %s', (key, value) => {
        const values = accumulateValues(
            value,
            tileServerFormSchema,
            value,
            undefined,
        );

        expect(values[key]).not.toHaveProperty('minZoom');
        expect(values[key]).not.toHaveProperty('maxZoom');
    });
});

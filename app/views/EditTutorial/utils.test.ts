import {
    describe,
    expect,
    it,
} from 'vitest';

import { SubGridSizeEnum } from '#generated/types/graphql';

import {
    getValidReferenceValues,
    transformCompareGeoJson,
    transformCompletenessGeoJson,
    transformFindGeoJson,
    transformLocateGeoJson,
    transformStreetGeoJson,
    transformValidateGeoJson,
} from './utils';

const polygon: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
};

function createFeatureCollection(
    propertiesList: GeoJSON.GeoJsonProperties[],
): GeoJSON.GeoJSON {
    return {
        type: 'FeatureCollection',
        features: propertiesList.map((properties) => ({
            type: 'Feature',
            geometry: polygon,
            properties,
        })),
    };
}

describe('getValidReferenceValues', () => {
    it('flattens option values and sub-option values', () => {
        expect(getValidReferenceValues([
            { value: 1, subOptions: [{ value: 11 }, { value: 12 }] },
            { value: 2 },
        ])).toEqual([1, 11, 12, 2]);
    });

    it('keeps the falsy option value 0 and drops valueless sub-options', () => {
        expect(getValidReferenceValues([
            { value: 0, subOptions: [{ value: 11 }, {}] },
            { value: 2 },
        ])).toEqual([0, 11, 2]);
    });

    it('skips options without a value along with their sub-options', () => {
        expect(getValidReferenceValues([
            { subOptions: [{ value: 5 }] },
        ])).toBeUndefined();
    });

    it('returns undefined for missing or empty options', () => {
        expect(getValidReferenceValues(undefined)).toBeUndefined();
        expect(getValidReferenceValues(null)).toBeUndefined();
        expect(getValidReferenceValues([])).toBeUndefined();
    });
});

describe('transformValidateGeoJson', () => {
    const validOptions = [0, 1];

    it('maps each feature to its own scenario page, sorted by screen', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 2, reference: 1, id: 200 },
            { screen: 1, reference: 0, id: 100 },
        ]), validOptions);

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        expect(result.scenarioPages.map(
            (page) => page.scenarioPageNumber,
        )).toEqual([1, 2]);

        const [firstPage] = result.scenarioPages;
        expect(firstPage.tasks).toHaveLength(1);

        const [task] = firstPage.tasks ?? [];
        expect(task.reference).toBe(0);
        expect(task.projectTypeSpecifics?.validate?.identifier).toBe(100);
        expect(JSON.parse(
            task.projectTypeSpecifics?.validate?.objectGeometry ?? '',
        )).toEqual(polygon);
    });

    it('reports a validation error for malformed properties', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 1 },
        ]), validOptions);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error.length).toBeGreaterThan(0);
    });

    it('errors when the project has no custom options', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 1, reference: 0, id: 100 },
        ]), undefined);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('custom options');
    });

    it('rejects reference values outside the custom options', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 1, reference: 9, id: 100 },
        ]), validOptions);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('invalid reference value(s): 9 for screen 1');
        expect(result.error).toContain('valid values are 0, 1');
    });

    it('rejects duplicated screens', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 1, reference: 0, id: 100 },
            { screen: 1, reference: 1, id: 101 },
            { screen: 2, reference: 0, id: 102 },
        ]), validOptions);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('duplicated screen(s): 1');
    });

    it('rejects non-serial screens', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 1, reference: 0, id: 100 },
            { screen: 3, reference: 0, id: 101 },
        ]), validOptions);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('screens must be serial');
        expect(result.error).toContain('found: 1, 3');
    });

    it('aggregates multiple problems into one error', () => {
        const result = transformValidateGeoJson(createFeatureCollection([
            { screen: 2, reference: 9, id: 100 },
            { screen: 2, reference: 0, id: 101 },
        ]), validOptions);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('duplicated screen(s): 2');
        expect(result.error).toContain('screens must be serial');
        expect(result.error).toContain('invalid reference value(s): 9 for screen 2');
    });
});

describe('transformFindGeoJson', () => {
    // tile_x encodes the screen so mis-grouped tasks are detectable
    const makeScreen = (screen: number) => Array.from(
        new Array(6).keys(),
    ).map((i) => ({
        screen,
        reference: i % 2,
        tile_x: screen * 100 + i,
        tile_y: 20 + i,
        tile_z: 18,
    }));

    it('groups features by screen into sorted scenario pages', () => {
        const result = transformFindGeoJson(createFeatureCollection([
            ...makeScreen(2),
            ...makeScreen(1),
        ]));

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        expect(result.scenarioPages.map(
            (page) => page.scenarioPageNumber,
        )).toEqual([1, 2]);

        expect(result.scenarioPages[0].tasks?.map(
            (task) => task.projectTypeSpecifics?.find?.tileX,
        )).toEqual([100, 101, 102, 103, 104, 105]);
        expect(result.scenarioPages[1].tasks?.map(
            (task) => task.projectTypeSpecifics?.find?.tileX,
        )).toEqual([200, 201, 202, 203, 204, 205]);

        const [task] = result.scenarioPages[0].tasks ?? [];
        expect(task.projectTypeSpecifics?.find).toEqual({
            tileX: 100,
            tileY: 20,
            tileZ: 18,
        });
    });

    it('rejects screens without exactly 6 features', () => {
        const result = transformFindGeoJson(createFeatureCollection([
            {
                screen: 1,
                reference: 0,
                tile_x: 1,
                tile_y: 2,
                tile_z: 18,
            },
        ]));

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('expected to have 6 instances');
    });

    it('rejects non-serial screens', () => {
        const result = transformFindGeoJson(createFeatureCollection([
            ...makeScreen(2),
            ...makeScreen(3),
        ]));

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('screens must be serial');
        expect(result.error).toContain('found: 2, 3');
    });

    it('rejects reference values outside the tile options', () => {
        const [first, ...others] = makeScreen(1);
        const result = transformFindGeoJson(createFeatureCollection([
            { ...first, reference: 9 },
            ...others,
        ]));

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('invalid reference value(s): 9 for screen 1');
        expect(result.error).toContain('valid values are 0, 1, 2, 3');
    });
});

describe('transformStreetGeoJson', () => {
    const validOptions = [0, 1];

    it('maps the string id to mapillaryImageId and serializes geometry', () => {
        const result = transformStreetGeoJson(createFeatureCollection([
            { screen: 1, reference: 0, id: 'mapillary-123' },
        ]), validOptions);

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        const [task] = result.scenarioPages[0].tasks ?? [];
        expect(task.projectTypeSpecifics?.street?.mapillaryImageId).toBe('mapillary-123');
        expect(JSON.parse(
            task.projectTypeSpecifics?.street?.geometry ?? '',
        )).toEqual(polygon);
    });

    it('rejects numeric ids', () => {
        const result = transformStreetGeoJson(createFeatureCollection([
            { screen: 1, reference: 0, id: 123 },
        ]), validOptions);

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('id');
    });
});

describe('transformCompareGeoJson', () => {
    it('accepts repeated screens and maps compare specifics', () => {
        const result = transformCompareGeoJson(createFeatureCollection([
            {
                screen: 1,
                reference: 0,
                tile_x: 1,
                tile_y: 2,
                tile_z: 18,
            },
            {
                screen: 1,
                reference: 1,
                tile_x: 3,
                tile_y: 4,
                tile_z: 18,
            },
        ]));

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        expect(result.scenarioPages).toHaveLength(1);
        expect(result.scenarioPages[0].tasks).toHaveLength(2);

        const [task] = result.scenarioPages[0].tasks ?? [];
        expect(task.projectTypeSpecifics?.compare).toEqual({
            tileX: 1,
            tileY: 2,
            tileZ: 18,
        });
    });

    it('rejects non-serial screens', () => {
        const result = transformCompareGeoJson(createFeatureCollection([
            {
                screen: 2,
                reference: 0,
                tile_x: 1,
                tile_y: 2,
                tile_z: 18,
            },
        ]));

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('screens must be serial');
    });
});

describe('transformCompletenessGeoJson', () => {
    it('accepts repeated screens and maps completeness specifics', () => {
        const result = transformCompletenessGeoJson(createFeatureCollection([
            {
                screen: 1,
                reference: 0,
                tile_x: 1,
                tile_y: 2,
                tile_z: 18,
            },
            {
                screen: 1,
                reference: 1,
                tile_x: 3,
                tile_y: 4,
                tile_z: 18,
            },
        ]));

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        expect(result.scenarioPages).toHaveLength(1);
        expect(result.scenarioPages[0].tasks).toHaveLength(2);

        const [task] = result.scenarioPages[0].tasks ?? [];
        expect(task.projectTypeSpecifics?.completeness).toEqual({
            tileX: 1,
            tileY: 2,
            tileZ: 18,
        });
    });

    it('rejects reference values outside the tile options', () => {
        const result = transformCompletenessGeoJson(createFeatureCollection([
            {
                screen: 1,
                reference: 9,
                tile_x: 1,
                tile_y: 2,
                tile_z: 18,
            },
        ]));

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('invalid reference value(s): 9 for screen 1');
    });
});

describe('transformLocateGeoJson', () => {
    const validOptions = [0, 1, 2, 3, 4];

    const locateProperties = (
        screen: number,
        references: number[],
    ) => ({
        screen,
        references,
        tile_x: 5,
        tile_y: 6,
        tile_z: 14,
    });

    it('expands each feature into one task per sub-grid cell', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, [1, 2, 3, 4])]),
            SubGridSizeEnum.Size_2X2,
            validOptions,
        );

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        expect(result.scenarioPages).toHaveLength(1);

        const tasks = result.scenarioPages[0].tasks ?? [];
        expect(tasks.map((task) => task.reference)).toEqual([1, 2, 3, 4]);
        expect(tasks.map((task) => task.taskPartitionIndex)).toEqual([0, 1, 2, 3]);
        tasks.forEach((task) => {
            expect(task.projectTypeSpecifics?.locate).toEqual({
                tileX: 5,
                tileY: 6,
                tileZ: 14,
            });
        });
    });

    it('derives the sub-grid cell count from the sub-grid size', () => {
        const references = Array.from(new Array(16).keys());
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, references)]),
            SubGridSizeEnum.Size_4X4,
            references,
        );

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        const tasks = result.scenarioPages[0].tasks ?? [];
        expect(tasks).toHaveLength(16);
        expect(tasks.map((task) => task.taskPartitionIndex)).toEqual(references);
        expect(tasks.map((task) => task.reference)).toEqual(references);
    });

    it('rejects features with more references than sub-grid cells', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, [0, 1, 2, 3, 4])]),
            SubGridSizeEnum.Size_2X2,
            validOptions,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('has 5 references but the sub-grid has 4 cells');
    });

    it('rejects features with fewer references than sub-grid cells', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, [4])]),
            SubGridSizeEnum.Size_2X2,
            validOptions,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('has 1 references but the sub-grid has 4 cells');
    });

    it('rejects non-serial screens', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([
                locateProperties(1, [1, 2, 3, 4]),
                locateProperties(3, [1, 2, 3, 4]),
            ]),
            SubGridSizeEnum.Size_2X2,
            validOptions,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('screens must be serial');
        expect(result.error).toContain('found: 1, 3');
    });

    it('rejects duplicated screens', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([
                locateProperties(1, [1, 2, 3, 4]),
                locateProperties(1, [1, 2, 3, 4]),
            ]),
            SubGridSizeEnum.Size_2X2,
            validOptions,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('duplicated screen(s): 1');
    });

    it('rejects reference values outside the custom options', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, [1, 2, 3, 9])]),
            SubGridSizeEnum.Size_2X2,
            validOptions,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('invalid reference value(s): 9 for screen 1');
    });

    it('errors when the sub-grid size is unknown', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, [1, 2, 3, 4])]),
            undefined,
            validOptions,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('Could not determine the sub-grid size');
    });

    it('aggregates missing sub-grid size and missing custom options', () => {
        const result = transformLocateGeoJson(
            createFeatureCollection([locateProperties(1, [1, 2, 3, 4])]),
            undefined,
            undefined,
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.error).toContain('Could not determine the sub-grid size');
        expect(result.error).toContain('custom options');
    });
});

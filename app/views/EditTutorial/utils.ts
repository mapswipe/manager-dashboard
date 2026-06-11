import {
    compareNumber,
    getDuplicates,
    isDefined,
    isNotDefined,
    listToGroupList,
    Maybe,
    unique,
} from '@togglecorp/fujs';
import { type } from 'arktype';
import { ulid } from 'ulid';

import { SubGridSizeEnum } from '#generated/types/graphql';
import {
    defaultTileOptions,
    subgridSizeToValueMap,
} from '#utils/common';

import { PartialScenarioPageInputFields } from './ScenarioPageInput/schema';
import { ComparePropertyInputFields } from './ScenarioPageInput/TaskInput/ComparePropertyInput/schema';
import { CompletenessPropertyInputFields } from './ScenarioPageInput/TaskInput/CompletenessPropertyInput/schema';
import { FindPropertyInputFields } from './ScenarioPageInput/TaskInput/FindPropertyInput/schema';
import { LocateObjectPropertyInputFields } from './ScenarioPageInput/TaskInput/LocateObjectPropertyInput/schema';
import { PartialProjectTypeSpecifics } from './ScenarioPageInput/TaskInput/schema';
import { StreetPropertyInputFields } from './ScenarioPageInput/TaskInput/StreetPropertyInput/schema';
import { ValidatePropertyInputFields } from './ScenarioPageInput/TaskInput/ValidatePropertyInput/schema';

const PositionType = type.number.array();

const PolygonType = type({
    type: "'Polygon'",
    coordinates: PositionType.array().array(),
});
const MultiPolygonType = type({
    type: "'MultiPolygon'",
    coordinates: PositionType.array().array().array(),
});

const CommonFeaturePropertyType = type({
    screen: type.number,
    reference: type.number,
});
const TileFeaturePropertyType = type({
    tile_x: type.number,
    tile_y: type.number,
    tile_z: type.number,
});

const ValidateFeaturePropertyType = type.merge(
    CommonFeaturePropertyType,
    {
        // This is not used anymore
        // id: '"string" | "number"',
        id: type.number,
    },
);

const FindFeaturePropertyType = type.merge(
    CommonFeaturePropertyType,
    TileFeaturePropertyType,
    {
        // This is not used anymore
        // task_id: 'string',
    },
);
const CompareFeaturePropertyType = type.merge(
    CommonFeaturePropertyType,
    TileFeaturePropertyType,
    {
        // This is not used anymore
        // task_id: 'string',
    },
);
const LocateObjectPropertyType = type.merge(
    TileFeaturePropertyType,
    {
        screen: type.number,
        references: type.number.array(),
        // This is not used anymore
        // task_id: 'string',
    },
);

const CompletenessFeaturePropertyType = type.merge(
    CommonFeaturePropertyType,
    TileFeaturePropertyType,
    {
        // This is not used anymore
        // task_id: 'string',
    },
);

const StreetFeaturePropertyType = type({
    '...': CommonFeaturePropertyType,
    id: 'string',
});

const ValidateTutorialGeoJsonType = type({
    type: '"FeatureCollection"',
    features: type({
        geometry: PolygonType.or(MultiPolygonType),
        properties: ValidateFeaturePropertyType,
    }).array(),
});

const FindTutorialGeoJsonType = type({
    type: '"FeatureCollection"',
    features: type({
        geometry: PolygonType.or(MultiPolygonType),
        properties: FindFeaturePropertyType,
    }).array(),
});

const CompareTutorialGeoJsonType = type({
    type: '"FeatureCollection"',
    features: type({
        geometry: PolygonType.or(MultiPolygonType),
        properties: CompareFeaturePropertyType,
    }).array(),
});

const LocateObjectTutorialGeoJsonType = type({
    type: '"FeatureCollection"',
    features: type({
        geometry: PolygonType.or(MultiPolygonType),
        properties: LocateObjectPropertyType,
    }).array(),
});

const CompletenessTutorialGeoJsonType = type({
    type: '"FeatureCollection"',
    features: type({
        geometry: PolygonType.or(MultiPolygonType),
        properties: CompletenessFeaturePropertyType,
    }).array(),
});

const StreetTutorialGeoJsonType = type({
    type: '"FeatureCollection"',
    features: type({
        geometry: PolygonType.or(MultiPolygonType),
        properties: StreetFeaturePropertyType,
    }).array(),
});

export type TutorialGeoJsonTransformResult = {
    ok: true,
    scenarioPages: PartialScenarioPageInputFields[],
} | {
    ok: false,
    error: string,
};

const noOptionsError = 'Could not determine the valid reference values for this project. Please configure the custom options for the project before uploading scenarios.';

// FIXME: Get this from the server
const tileOptionValues = defaultTileOptions.map((option) => option.value);

interface ReferenceCustomOption {
    value?: Maybe<number>;
    subOptions?: Maybe<Maybe<{ value?: Maybe<number> }>[]>;
}

// NOTE: mirrors the option flattening in CustomOptionSelectInput: both the
// option values and the sub-option values are selectable as a reference, but
// an option without a value is skipped along with its sub-options.
export function getValidReferenceValues(
    customOptions: Maybe<Maybe<ReferenceCustomOption>[]>,
): number[] {
    if (isNotDefined(customOptions)) {
        return [];
    }

    const values = customOptions.flatMap((option) => {
        if (isNotDefined(option) || isNotDefined(option.value)) {
            return [];
        }

        const subOptionValues = option.subOptions
            ?.map((subOption) => subOption?.value)
            .filter(isDefined) ?? [];

        return [option.value, ...subOptionValues];
    });

    return values;
}

function checkScreensUnique(screens: number[]): string[] {
    const duplicateScreens = getDuplicates(screens, (screen) => screen);

    if (duplicateScreens.length === 0) {
        return [];
    }

    return [`expected each screen to appear only once (duplicated screen(s): ${duplicateScreens.join(', ')})`];
}

function checkScreensSerial(screens: number[]): string[] {
    const sortedScreens = unique(screens, (screen) => screen)
        .toSorted(compareNumber);

    const screensAreSerial = sortedScreens.every(
        (screen, index) => screen === index + 1,
    );

    if (screensAreSerial) {
        return [];
    }

    return [`screens must be serial (1, 2, 3, …); found: ${sortedScreens.join(', ')}`];
}

function checkScreenFeatureCount(screens: number[], expectedCount: number): string[] {
    // FIXME: We can identify mismatches using listToGroupList transformer
    const groupedScreens = listToGroupList(
        screens,
        (screen) => screen,
    );

    const mismatches = Object.values(groupedScreens).map((group) => {
        if (group.length === expectedCount) {
            return undefined;
        }

        return {
            screen: group[0],
            numEntries: group.length,
        };
    }).filter(isDefined);

    if (mismatches.length === 0) {
        return [];
    }

    const description = mismatches.map(
        ({ screen, numEntries }) => `${numEntries} for screen ${screen}`,
    ).join(', ');

    return [`expected to have ${expectedCount} instance(s) of every screen (found ${description})`];
}

function checkReferenceValues(
    references: { screen: number, reference: number }[],
    validReferenceValues: number[],
): string[] {
    const invalidReferences = references.filter(
        ({ reference }) => !validReferenceValues.includes(reference),
    );

    if (invalidReferences.length === 0) {
        return [];
    }

    const description = invalidReferences.map(
        ({ screen, reference }) => `${reference} for screen ${screen}`,
    ).join(', ');

    return [`invalid reference value(s): ${description}; valid values are ${validReferenceValues.join(', ')}`];
}

// Validation common to the tile based project types, where multiple features
// share a screen and the reference values come from the default tile options.
function checkTileGroupedFeatures(
    features: { properties: { screen: number, reference: number } }[],
    expectedCount: number,
): string[] {
    const screens = features.map((feature) => feature.properties.screen);

    return [
        ...checkScreenFeatureCount(screens, expectedCount),
        ...checkScreensSerial(screens),
        ...checkReferenceValues(
            features.map((feature) => ({
                screen: feature.properties.screen,
                reference: feature.properties.reference,
            })),
            tileOptionValues,
        ),
    ];
}

// Validation common to the project types where each feature is its own
// scenario screen and the reference values come from the project's custom
// options.
function checkSingletonFeatures(
    features: { properties: { screen: number, reference: number } }[],
    validReferenceValues: number[] | undefined,
): string[] {
    const screens = features.map((feature) => feature.properties.screen);

    const problems = [
        ...checkScreensUnique(screens),
        ...checkScreensSerial(screens),
    ];

    if (isNotDefined(validReferenceValues) || validReferenceValues.length === 0) {
        problems.push(noOptionsError);
        return problems;
    }
    problems.push(...checkReferenceValues(
        features.map((feature) => ({
            screen: feature.properties.screen,
            reference: feature.properties.reference,
        })),
        validReferenceValues,
    ));

    return problems;
}

interface TileGroupedFeatureProperties {
    screen: number;
    reference: number;
    tile_x: number;
    tile_y: number;
    tile_z: number;
}

// Groups features by screen into one scenario page per screen, with one task
// per feature on that screen (used by the tile based project types).
function buildTileGroupedScenarioPages(
    features: { properties: TileGroupedFeatureProperties }[],
    buildSpecifics: (properties: TileGroupedFeatureProperties) => PartialProjectTypeSpecifics,
): PartialScenarioPageInputFields[] {
    // FIXME: We can easily process using listToGroupList transformer
    const featuresByScreen = listToGroupList(
        features,
        (feature) => feature.properties.screen,
    );

    return unique(
        features,
        (feature) => feature.properties.screen,
    ).toSorted(
        (a, b) => compareNumber(a.properties.screen, b.properties.screen),
    ).map(({ properties }) => ({
        clientId: ulid(),
        scenarioPageNumber: properties.screen,
        tasks: featuresByScreen[properties.screen].map((feature) => ({
            clientId: ulid(),
            reference: feature.properties.reference,
            projectTypeSpecifics: buildSpecifics(feature.properties),
        })),
    }));
}

// Maps each feature to its own scenario page with a single task (used by the
// project types where one feature represents one screen).
function buildSingletonScenarioPages<
    FEATURE extends { properties: { screen: number, reference: number } },
>(
    features: FEATURE[],
    buildSpecifics: (feature: FEATURE) => PartialProjectTypeSpecifics,
): PartialScenarioPageInputFields[] {
    const scenarioPages = features.map((feature) => ({
        clientId: ulid(),
        scenarioPageNumber: feature.properties.screen,
        tasks: [
            {
                clientId: ulid(),
                reference: feature.properties.reference,
                projectTypeSpecifics: buildSpecifics(feature),
            },
        ],
    }));

    return scenarioPages.toSorted((a, b) => (
        compareNumber(a.scenarioPageNumber, b.scenarioPageNumber)
    ));
}

export function transformValidateGeoJson(
    geoJson: GeoJSON.GeoJSON,
    validReferenceValues: number[] | undefined,
): TutorialGeoJsonTransformResult {
    const result = ValidateTutorialGeoJsonType(geoJson);
    if (result instanceof type.errors) {
        return { ok: false, error: result.summary };
    }

    const problems = checkSingletonFeatures(result.features, validReferenceValues);
    if (problems.length > 0) {
        return { ok: false, error: problems.join('\n') };
    }

    return {
        ok: true,
        scenarioPages: buildSingletonScenarioPages(
            result.features,
            (feature) => ({
                // FIXME: Why objectGeometry is string?
                validate: {
                    identifier: feature.properties.id,
                    objectGeometry: JSON.stringify(feature.geometry, null, 4),
                } satisfies ValidatePropertyInputFields,
            }),
        ),
    };
}

export function transformFindGeoJson(
    geoJson: GeoJSON.GeoJSON,
): TutorialGeoJsonTransformResult {
    const result = FindTutorialGeoJsonType(geoJson);
    if (result instanceof type.errors) {
        return { ok: false, error: result.summary };
    }

    const problems = checkTileGroupedFeatures(result.features, 6);
    if (problems.length > 0) {
        return { ok: false, error: problems.join('\n') };
    }

    return {
        ok: true,
        scenarioPages: buildTileGroupedScenarioPages(
            result.features,
            (properties) => ({
                find: {
                    tileX: properties.tile_x,
                    tileY: properties.tile_y,
                    tileZ: properties.tile_z,
                } satisfies FindPropertyInputFields,
            }),
        ),
    };
}

export function transformCompareGeoJson(
    geoJson: GeoJSON.GeoJSON,
): TutorialGeoJsonTransformResult {
    const result = CompareTutorialGeoJsonType(geoJson);
    if (result instanceof type.errors) {
        return { ok: false, error: result.summary };
    }

    const problems = checkTileGroupedFeatures(result.features, 1);
    if (problems.length > 0) {
        return { ok: false, error: problems.join('\n') };
    }

    return {
        ok: true,
        scenarioPages: buildTileGroupedScenarioPages(
            result.features,
            (properties) => ({
                compare: {
                    tileX: properties.tile_x,
                    tileY: properties.tile_y,
                    tileZ: properties.tile_z,
                } satisfies ComparePropertyInputFields,
            }),
        ),
    };
}

export function transformCompletenessGeoJson(
    geoJson: GeoJSON.GeoJSON,
): TutorialGeoJsonTransformResult {
    const result = CompletenessTutorialGeoJsonType(geoJson);
    if (result instanceof type.errors) {
        return { ok: false, error: result.summary };
    }

    const problems = checkTileGroupedFeatures(result.features, 1);
    if (problems.length > 0) {
        return { ok: false, error: problems.join('\n') };
    }

    return {
        ok: true,
        scenarioPages: buildTileGroupedScenarioPages(
            result.features,
            (properties) => ({
                completeness: {
                    tileX: properties.tile_x,
                    tileY: properties.tile_y,
                    tileZ: properties.tile_z,
                } satisfies CompletenessPropertyInputFields,
            }),
        ),
    };
}

export function transformStreetGeoJson(
    geoJson: GeoJSON.GeoJSON,
    validReferenceValues: number[] | undefined,
): TutorialGeoJsonTransformResult {
    const result = StreetTutorialGeoJsonType(geoJson);
    if (result instanceof type.errors) {
        return { ok: false, error: result.summary };
    }

    const problems = checkSingletonFeatures(result.features, validReferenceValues);
    if (problems.length > 0) {
        return { ok: false, error: problems.join('\n') };
    }

    return {
        ok: true,
        scenarioPages: buildSingletonScenarioPages(
            result.features,
            (feature) => ({
                street: {
                    mapillaryImageId: feature.properties.id,
                    geometry: JSON.stringify(feature.geometry, null, 4),
                } satisfies StreetPropertyInputFields,
            }),
        ),
    };
}

export function transformLocateGeoJson(
    geoJson: GeoJSON.GeoJSON,
    subgridSize: SubGridSizeEnum | undefined,
    validReferenceValues: number[] | undefined,
): TutorialGeoJsonTransformResult {
    const result = LocateObjectTutorialGeoJsonType(geoJson);
    if (result instanceof type.errors) {
        return { ok: false, error: result.summary };
    }

    const screens = result.features.map((feature) => feature.properties.screen);

    // Each Locate feature is one parent tile rendered as a single scenario
    // screen, so a screen must not appear on more than one feature.
    const problems = [
        ...checkScreensUnique(screens),
        ...checkScreensSerial(screens),
    ];

    const numSubGrids = isDefined(subgridSize)
        ? (2 ** subgridSizeToValueMap[subgridSize]) ** 2
        : undefined;

    if (isNotDefined(numSubGrids)) {
        problems.push('Could not determine the sub-grid size for this project. Please configure the project before uploading scenarios.');
    } else {
        // Each feature should carry exactly one reference per sub-grid cell.
        result.features.forEach((feature) => {
            if (feature.properties.references.length !== numSubGrids) {
                problems.push(
                    `Feature on screen ${feature.properties.screen} has ${feature.properties.references.length} references but the sub-grid has ${numSubGrids} cells.`,
                );
            }
        });
    }

    if (isNotDefined(validReferenceValues) || validReferenceValues.length === 0) {
        problems.push(noOptionsError);
    } else {
        problems.push(...checkReferenceValues(
            result.features.flatMap((feature) => (
                feature.properties.references.map((reference) => ({
                    screen: feature.properties.screen,
                    reference,
                }))
            )),
            validReferenceValues,
        ));
    }

    if (problems.length > 0) {
        return { ok: false, error: problems.join('\n') };
    }

    // FIXME: We can easily process using listToGroupList transformer
    const featuresByScreen = listToGroupList(
        result.features,
        (feature) => feature.properties.screen,
    );

    const scenarioPages: PartialScenarioPageInputFields[] = unique(
        result.features,
        (feature) => feature.properties.screen,
    ).toSorted(
        (a, b) => compareNumber(a.properties.screen, b.properties.screen),
    ).map(({ properties }) => ({
        clientId: ulid(),
        scenarioPageNumber: properties.screen,
        tasks: featuresByScreen[properties.screen].flatMap((feature) => (
            Array.from(new Array(numSubGrids).keys()).map((index) => ({
                clientId: ulid(),
                reference: feature.properties.references[index],
                taskPartitionIndex: index,
                projectTypeSpecifics: {
                    locate: {
                        tileX: feature.properties.tile_x,
                        tileY: feature.properties.tile_y,
                        tileZ: feature.properties.tile_z,
                    } satisfies LocateObjectPropertyInputFields,
                },
            }))
        )),
    }));

    return { ok: true, scenarioPages };
}

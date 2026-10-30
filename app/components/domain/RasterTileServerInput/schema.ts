import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    addCondition,
    greaterThanOrEqualToCondition,
    integerCondition,
    lessThanOrEqualToCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    ProjectRasterTileServerConfigInput,
    RasterTileServerCommonConfigInput,
    RasterTileServerCustomConfigInput,
    RasterTileServerNameEnum,
} from '#generated/types/graphql';
import { imageryUrlCondition } from '#utils/common';
import { DeepNonNullable } from '#utils/types';

export type TileInputKeys = Exclude<keyof ProjectRasterTileServerConfigInput, 'name'>;
export const rasterTileServerNameToTileInputKey: Record<RasterTileServerNameEnum, TileInputKeys> = {
    [RasterTileServerNameEnum.Bing]: 'bing',
    [RasterTileServerNameEnum.Custom]: 'custom',
    [RasterTileServerNameEnum.Mapbox]: 'mapbox',
    [RasterTileServerNameEnum.MaxarPremium]: 'maxarPremium',
    [RasterTileServerNameEnum.MaxarStandard]: 'maxarStandard',
    [RasterTileServerNameEnum.Esri]: 'esri',
    [RasterTileServerNameEnum.EsriBeta]: 'esriBeta',
};

export type PartialRasterTileServerInputFields = PartialForm<
    DeepNonNullable<ProjectRasterTileServerConfigInput>
>;
type RasterTileServerFormSchema = ObjectSchema<PartialRasterTileServerInputFields>;

type RasterTileServerFormFields = ReturnType<RasterTileServerFormSchema['fields']>;

export type PartialCustomRasterTileServerConfigFields = PartialForm<
    DeepNonNullable<RasterTileServerCustomConfigInput>
>;
type CustomRasterTileServerConfigSchema = ObjectSchema<PartialCustomRasterTileServerConfigFields>;

export type PartialCommonRasterTileServerConfigFields = PartialForm<
    DeepNonNullable<RasterTileServerCommonConfigInput>
>;
type CommonRasterTileServerConfigSchema = ObjectSchema<PartialCommonRasterTileServerConfigFields>;

const MIN_ZOOM_LEVEL = 0;
const MAX_ZOOM_LEVEL = 22;
const DEFAULT_CUSTOM_MAX_ZOOM = 19;

export const defaultCustomRasterTileServerValue: PartialCustomRasterTileServerConfigFields = {
    maxZoom: DEFAULT_CUSTOM_MAX_ZOOM,
};

export const defaultRasterTileServerInputValue: PartialRasterTileServerInputFields = {
    name: RasterTileServerNameEnum.Custom,
    custom: defaultCustomRasterTileServerValue,
};

const zoomLevelValidations = [
    integerCondition,
    greaterThanOrEqualToCondition(MIN_ZOOM_LEVEL),
    lessThanOrEqualToCondition(MAX_ZOOM_LEVEL),
];

const tileServerFormSchema: RasterTileServerFormSchema = {
    fields: (value): RasterTileServerFormFields => {
        const defaultRasterTileServerFieldSchema: RasterTileServerFormFields = {
            custom: { forceValue: undefinedValue },
            bing: { forceValue: undefinedValue },
            mapbox: { forceValue: undefinedValue },
            maxarStandard: { forceValue: undefinedValue },
            maxarPremium: { forceValue: undefinedValue },
            esri: { forceValue: undefinedValue },
            esriBeta: { forceValue: undefinedValue },
        };

        const baseSchema: RasterTileServerFormFields = {
            name: {
                required: true,
            },
        };

        const schema = addCondition(
            baseSchema,
            value,
            ['name'],
            ['bing', 'esri', 'esriBeta', 'mapbox', 'maxarPremium', 'maxarStandard', 'custom'],
            (): RasterTileServerFormFields => {
                const defaultValue = {};

                if (isNotDefined(value)) {
                    return defaultValue;
                }

                const { name } = value;

                if (isNotDefined(name)) {
                    return defaultValue;
                }

                const key = rasterTileServerNameToTileInputKey[name];

                if (name === RasterTileServerNameEnum.Custom) {
                    return {
                        ...defaultRasterTileServerFieldSchema,
                        [key]: {
                            fields: (
                                customValue: PartialCustomRasterTileServerConfigFields | undefined,
                            ): ReturnType<CustomRasterTileServerConfigSchema['fields']> => ({
                                url: {
                                    required: true,
                                    validations: [imageryUrlCondition],
                                },
                                credits: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                },
                                minZoom: {
                                    validations: isDefined(customValue?.maxZoom)
                                        ? [
                                            ...zoomLevelValidations,
                                            lessThanOrEqualToCondition(customValue.maxZoom),
                                        ]
                                        : zoomLevelValidations,
                                },
                                maxZoom: {
                                    validations: zoomLevelValidations,
                                },
                            }),
                        },
                    };
                }

                return {
                    ...defaultRasterTileServerFieldSchema,
                    [key]: {
                        fields: (): ReturnType<CommonRasterTileServerConfigSchema['fields']> => ({
                            credits: {
                                required: true,
                                requiredValidation: requiredStringCondition,
                            },
                        }),
                    },
                };
            },
        );

        return schema;
    },
};

export default tileServerFormSchema;

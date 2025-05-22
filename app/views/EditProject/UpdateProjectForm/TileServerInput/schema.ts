import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    ProjectTileServerConfigInput,
    TileServerCommonConfigInput,
    TileServerCustomConfigInput,
    TileServerNameEnum,
} from '#generated/types/graphql';
import { imageryUrlCondition } from '#utils/common';
import { DeepNonNullable } from '#utils/types';

export type TileInputKeys = Exclude<keyof ProjectTileServerConfigInput, 'name'>;
export const tileServerNameToTileInputKey: Record<TileServerNameEnum, TileInputKeys> = {
    [TileServerNameEnum.Bing]: 'bing',
    [TileServerNameEnum.Custom]: 'custom',
    [TileServerNameEnum.Mapbox]: 'mapbox',
    [TileServerNameEnum.MaxarPremium]: 'maxarPremium',
    [TileServerNameEnum.MaxarStandard]: 'maxarStandard',
    [TileServerNameEnum.Esri]: 'esri',
    [TileServerNameEnum.EsriBeta]: 'esriBeta',
};

export type PartialTileServerInputFields = PartialForm<
    DeepNonNullable<ProjectTileServerConfigInput>
>;
type ProjectTileFormSchema = ObjectSchema<PartialTileServerInputFields>;

type TileServerFormFields = ReturnType<ProjectTileFormSchema['fields']>;

export type PartialCustomTileServerConfigFields = PartialForm<
    DeepNonNullable<TileServerCustomConfigInput>
>;
type CustomTileServerConfigSchema = ObjectSchema<PartialCustomTileServerConfigFields>;

export type PartialCommonTileServerConfigFields = PartialForm<
    DeepNonNullable<TileServerCommonConfigInput>
>;
type CommonTileServerConfigSchema = ObjectSchema<PartialCommonTileServerConfigFields>;

export const defaultTileServerInputFormValue: PartialTileServerInputFields = {
    name: TileServerNameEnum.Custom,
};

const tileServerFormSchema: ProjectTileFormSchema = {
    fields: (value): TileServerFormFields => {
        const defaultTileServerFieldSchema: TileServerFormFields = {
            custom: { forceValue: undefinedValue },
            bing: { forceValue: undefinedValue },
            mapbox: { forceValue: undefinedValue },
            maxarStandard: { forceValue: undefinedValue },
            maxarPremium: { forceValue: undefinedValue },
            esri: { forceValue: undefinedValue },
            esriBeta: { forceValue: undefinedValue },
        };

        const baseSchema: TileServerFormFields = {
            name: {
                required: true,
            },
        };

        const schema = addCondition(
            baseSchema,
            value,
            ['name'],
            ['bing', 'esri', 'esriBeta', 'mapbox', 'maxarPremium', 'maxarStandard', 'custom'],
            (): TileServerFormFields => {
                const defaultValue = {};

                if (isNotDefined(value)) {
                    return defaultValue;
                }

                const { name } = value;

                if (isNotDefined(name)) {
                    return defaultValue;
                }

                const key = tileServerNameToTileInputKey[name];

                if (name === TileServerNameEnum.Custom) {
                    return {
                        ...defaultTileServerFieldSchema,
                        [key]: {
                            fields: (): ReturnType<CustomTileServerConfigSchema['fields']> => ({
                                url: {
                                    required: true,
                                    validations: [imageryUrlCondition],
                                },
                                credits: {},
                            }),
                        },
                    };
                }

                return {
                    ...defaultTileServerFieldSchema,
                    [key]: {
                        fields: (): ReturnType<CommonTileServerConfigSchema['fields']> => ({
                            credits: {},
                        }),
                    },
                };
            },
        );

        return schema;
    },
};

export default tileServerFormSchema;

import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    ProjectVectorTileServerConfigInput,
    VectorTileServerCommonConfigInput,
    VectorTileServerCustomConfigInput,
    VectorTileServerNameEnum,
} from '#generated/types/graphql';
import { imageryUrlCondition } from '#utils/common';
import { DeepNonNullable } from '#utils/types';

export type VectorTileInputKeys = Exclude<keyof ProjectVectorTileServerConfigInput, 'name'>;
// eslint-disable-next-line max-len
export const vectorTileServerNameToTileInputKey: Record<VectorTileServerNameEnum, VectorTileInputKeys> = {
    [VectorTileServerNameEnum.Custom]: 'custom',
    [VectorTileServerNameEnum.Versatiles]: 'versatiles',
    [VectorTileServerNameEnum.OpenFreeMap]: 'openFreeMap',
    [VectorTileServerNameEnum.OpenStreetMap]: 'openStreetMap',
};

export type PartialVectorTileServerInputFields = PartialForm<
    DeepNonNullable<ProjectVectorTileServerConfigInput>
>;

type VectorTileServerFormSchema = ObjectSchema<
    PartialVectorTileServerInputFields
>;

type VectorTileServerFormFields = ReturnType<
    VectorTileServerFormSchema['fields']
>;

export type PartialCustomVectorTileServerConfigFields = PartialForm<
    DeepNonNullable<VectorTileServerCustomConfigInput>
>;
type CustomVectorTileServerConfigSchema = ObjectSchema<PartialCustomVectorTileServerConfigFields>;

export type PartialCommonVectorTileServerConfigFields = PartialForm<
    DeepNonNullable<VectorTileServerCommonConfigInput>
>;
type CommonVectorTileServerConfigSchema = ObjectSchema<PartialCommonVectorTileServerConfigFields>;

export const defaultVectorTileServerInputValue: PartialVectorTileServerInputFields = {
    name: VectorTileServerNameEnum.Custom,
    custom: {
        url: 'https://vector.osm.org/shortbread_v1/{z}/{x}/{y}.mvt',
        credits: 'MapTiler',
        sourceName: 'buildings',
    },
};

const vectorTileServerFormSchema: VectorTileServerFormSchema = {
    fields: (value): VectorTileServerFormFields => {
        const defaultVectorTileServerFieldsSchema: VectorTileServerFormFields = {
            custom: { forceValue: undefinedValue },
            openFreeMap: { forceValue: undefinedValue },
            openStreetMap: { forceValue: undefinedValue },
            versatiles: { forceValue: undefinedValue },
        };

        const baseSchema: VectorTileServerFormFields = {
            name: {
                required: true,
            },
        };

        const schema = addCondition(
            baseSchema,
            value,
            ['name'],
            ['custom', 'versatiles', 'openFreeMap', 'openStreetMap'],
            (): VectorTileServerFormFields => {
                if (isNotDefined(value)) {
                    return defaultVectorTileServerFieldsSchema;
                }

                const { name } = value;

                if (isNotDefined(name)) {
                    return defaultVectorTileServerFieldsSchema;
                }

                const key = vectorTileServerNameToTileInputKey[name];

                if (name === VectorTileServerNameEnum.Custom) {
                    return {
                        ...defaultVectorTileServerFieldsSchema,
                        [key]: {
                            fields: (): ReturnType<CustomVectorTileServerConfigSchema['fields']> => ({
                                sourceName: {
                                    required: true,
                                },
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
                    ...defaultVectorTileServerFieldsSchema,
                    [key]: {
                        fields: (): ReturnType<CommonVectorTileServerConfigSchema['fields']> => ({
                            sourceName: {
                                required: true,
                            },
                            credits: {},
                        }),
                    },
                };
            },
        );

        return schema;
    },
};

export default vectorTileServerFormSchema;

import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/domain/CustomOptionInput/schema';
import {
    defaultStreetImageFiltersValue,
    getStreetImageProviderConfigSchema,
    type StreetImageProviderConfigKey,
    streetImageProviderToConfigKey,
} from '#components/domain/StreetImageProviderInput/schema';
import {
    StreetImageProviderEnum,
    StreetProjectPropertyInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';

export type PartialStreetSpecificFields = PartialForm<
    DeepNonNullable<StreetProjectPropertyInput>,
    'clientId'
>;
type StreetSpecificFormSchema = ObjectSchema<
    PartialStreetSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;
type StreetSpecificFormFields = ReturnType<StreetSpecificFormSchema['fields']>;
type StreetProviderConfigFormFields = Pick<StreetSpecificFormFields, StreetImageProviderConfigKey>;

export const defaultStreetSpecificFormValue: PartialStreetSpecificFields = {
    provider: StreetImageProviderEnum.Mapillary,
    mapillary: defaultStreetImageFiltersValue,
};

const streetSpecificFormSchema: StreetSpecificFormSchema = {
    fields: (value): StreetSpecificFormFields => {
        const baseSchema: StreetSpecificFormFields = {
            customOptions: {
                keySelector: (customOption) => customOption.clientId,
                member: () => customOptionSchema,
            },
            aoiGeometry: {},
            provider: {
                required: true,
            },
        };

        return addCondition(
            baseSchema,
            value,
            ['provider'],
            ['mapillary', 'panoramax', 'panoramaxCustom'],
            (val): StreetProviderConfigFormFields => {
                const defaultProviderConfigSchema: StreetProviderConfigFormFields = {
                    mapillary: { forceValue: undefinedValue },
                    panoramax: { forceValue: undefinedValue },
                    panoramaxCustom: { forceValue: undefinedValue },
                };

                if (isNotDefined(val?.provider)) {
                    return defaultProviderConfigSchema;
                }

                return {
                    ...defaultProviderConfigSchema,
                    [streetImageProviderToConfigKey[val.provider]]: (
                        getStreetImageProviderConfigSchema(val.provider)
                    ),
                };
            },
        );
    },
};

export default streetSpecificFormSchema;

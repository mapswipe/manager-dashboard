import {
    greaterThanOrEqualToCondition,
    integerCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    StreetImageProviderEnum,
    StreetMapillaryConfigInput,
    StreetPanoramaxConfigInput,
    StreetPanoramaxCustomConfigInput,
    StreetProjectPropertyInput,
} from '#generated/types/graphql';
import { domainUrlCondition } from '#utils/common';
import { DeepNonNullable } from '#utils/types';

export type StreetImageProviderConfigKey = 'mapillary' | 'panoramax' | 'panoramaxCustom';
export const streetImageProviderToConfigKey: Record<
    StreetImageProviderEnum,
    StreetImageProviderConfigKey
> = {
    [StreetImageProviderEnum.Mapillary]: 'mapillary',
    [StreetImageProviderEnum.Panoramax]: 'panoramax',
    [StreetImageProviderEnum.PanoramaxCustom]: 'panoramaxCustom',
};

export type PartialStreetImageProviderInputFields = PartialForm<
    DeepNonNullable<Pick<StreetProjectPropertyInput, 'provider' | StreetImageProviderConfigKey>>
>;

export type PartialStreetImageFiltersFields = PartialForm<
    DeepNonNullable<StreetPanoramaxConfigInput>
>;

export type PartialStreetImageProviderConfigFields = PartialForm<
    DeepNonNullable<StreetMapillaryConfigInput & StreetPanoramaxCustomConfigInput>
>;
type StreetImageProviderConfigSchema = ObjectSchema<PartialStreetImageProviderConfigFields>;
type StreetImageProviderConfigFields = ReturnType<StreetImageProviderConfigSchema['fields']>;

export const defaultStreetImageFiltersValue: PartialStreetImageFiltersFields = {
    randomizeOrder: false,
};

export function getStreetImageProviderConfigSchema(
    provider: StreetImageProviderEnum,
): StreetImageProviderConfigSchema {
    return {
        fields: (): StreetImageProviderConfigFields => {
            const filtersSchema: StreetImageProviderConfigFields = {
                panoOnly: {},
                creatorId: {},
                startTime: {},
                endTime: {},
                randomizeOrder: {},
                samplingThreshold: {
                    validations: [integerCondition, greaterThanOrEqualToCondition(0)],
                },
            };

            if (provider === StreetImageProviderEnum.Mapillary) {
                return {
                    ...filtersSchema,
                    organizationId: {},
                };
            }

            if (provider === StreetImageProviderEnum.PanoramaxCustom) {
                return {
                    ...filtersSchema,
                    url: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                        validations: [domainUrlCondition],
                    },
                };
            }

            return filtersSchema;
        },
    };
}

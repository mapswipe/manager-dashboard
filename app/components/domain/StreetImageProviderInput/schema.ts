import {
    addCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    StreetImageProviderInput,
    StreetImageProviderNameEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type PartialStreetImageProviderInputFields = PartialForm<
    DeepNonNullable<StreetImageProviderInput>
>;

type StreetImageProviderSchema =
    ObjectSchema<PartialStreetImageProviderInputFields>;

type StreetImageProviderFields =
    ReturnType<StreetImageProviderSchema['fields']>;

export const defaultStreetImageProviderValue:
PartialStreetImageProviderInputFields = {
    name: StreetImageProviderNameEnum.Mapillary,
};

const streetImageProviderSchema: StreetImageProviderSchema = {
    fields: (value): StreetImageProviderFields => {
        const baseSchema: StreetImageProviderFields = {
            name: {
                required: true,
            },
            url: {},
        };

        return addCondition(
            baseSchema,
            value,
            ['name'],
            ['url'],
            (): StreetImageProviderFields => {
                if (value?.name === StreetImageProviderNameEnum.PanoramaxCustom) {
                    return {
                        url: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                    };
                }

                return {
                    url: { required: false },
                };
            },
        );
    },
};

export default streetImageProviderSchema;

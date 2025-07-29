import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { CustomSubOptionInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type CustomSubOptionInputFields = DeepNonNullable<
    CustomSubOptionInput
>;

export type PartialCustomSubOptionInputFields = PartialForm<
    CustomSubOptionInputFields,
    'clientId'
>;

export type CustomSubOptionSchema = ObjectSchema<
    PartialCustomSubOptionInputFields
>;

const subOptionSchema: CustomSubOptionSchema = {
    fields: (): ReturnType<CustomSubOptionSchema['fields']> => ({
        clientId: {},
        description: {},
        value: {},
    }),
};

export default subOptionSchema;

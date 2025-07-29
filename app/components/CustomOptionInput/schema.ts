import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { CustomOptionInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import subOptionSchema from './SubOptionInput/schema';

export type CustomOptionInputFields = DeepNonNullable<
    CustomOptionInput
>;

export type PartialCustomOptionInputFields = PartialForm<
    CustomOptionInputFields,
    'clientId'
>;

export type CustomOptionSchema = ObjectSchema<
    PartialCustomOptionInputFields
>;

const customOptionSchema: CustomOptionSchema = {
    fields: (): ReturnType<CustomOptionSchema['fields']> => ({
        clientId: {},
        icon: {},
        iconColor: {},
        description: {},
        title: {},
        value: {},
        subOptions: {
            keySelector: (value) => value.clientId,
            member: () => subOptionSchema,
        },
    }),
};

export default customOptionSchema;

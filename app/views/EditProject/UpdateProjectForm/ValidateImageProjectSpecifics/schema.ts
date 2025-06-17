import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import { ValidateImageProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';

export type PartialValidateImageSpecificFields = PartialForm<
    DeepNonNullable<ValidateImageProjectPropertyInput>
>;
type ValidateImageSpecificFormSchema = ObjectSchema<
    PartialValidateImageSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultValidateImageSpecificFormValue: PartialValidateImageSpecificFields = {
};

const validateSpecificFormSchema: ValidateImageSpecificFormSchema = {
    fields: (): ReturnType<ValidateImageSpecificFormSchema['fields']> => ({
        annotationsFile: {},
        baseQuestion: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

export default validateSpecificFormSchema;

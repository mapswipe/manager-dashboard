import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/domain/CustomOptionInput/schema';
import {
    ValidateImageProjectPropertyInput,
    ValidateImageSourceTypeEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';

export type PartialValidateImageSpecificFields = PartialForm<
    DeepNonNullable<ValidateImageProjectPropertyInput>,
    'clientId'
>;
type ValidateImageSpecificFormSchema = ObjectSchema<
    PartialValidateImageSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultValidateImageSpecificFormValue: PartialValidateImageSpecificFields = {
    sourceType: ValidateImageSourceTypeEnum.DatasetFile,
};

const validateSpecificFormSchema: ValidateImageSpecificFormSchema = {
    fields: (): ReturnType<ValidateImageSpecificFormSchema['fields']> => ({
        customOptions: {
            keySelector: (value) => value.clientId,
            member: () => customOptionSchema,
        },
        sourceType: {
            required: true,
        },
    }),
};

export default validateSpecificFormSchema;

import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { ValidateImageTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

type ValidateImagePropertyInputFields = DeepNonNullable<
    ValidateImageTutorialTaskPropertyInput
>;
export type PartialValidateImagePropertyInputFields = PartialForm<ValidateImagePropertyInputFields>;

type TaskSchema = ObjectSchema<PartialValidateImagePropertyInputFields>;

const validateImagePropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        fileName: {},
        width: {},
        height: {},
        url: {},
        annotation: {},
    }),
};

export default validateImagePropertyInputSchema;

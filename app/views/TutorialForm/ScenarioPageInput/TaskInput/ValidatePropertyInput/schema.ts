import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { ValidateTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type ValidatePropertyInputFields = DeepNonNullable<ValidateTutorialTaskPropertyInput>;
export type PartialValidatePropertyInputFields = PartialForm<ValidatePropertyInputFields>;

type TaskSchema = ObjectSchema<PartialValidatePropertyInputFields>;

const validatePropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        objectGeometry: {},
    }),
};

export default validatePropertyInputSchema;

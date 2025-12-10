import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { ConflationTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type ConflationPropertyInputFields = DeepNonNullable<ConflationTutorialTaskPropertyInput>;
export type PartialConflationPropertyInputFields = PartialForm<ConflationPropertyInputFields>;

type TaskSchema = ObjectSchema<PartialConflationPropertyInputFields>;

const conflationPropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        identifier: {},
        objectGeometry: {},
    }),
};

export default conflationPropertyInputSchema;

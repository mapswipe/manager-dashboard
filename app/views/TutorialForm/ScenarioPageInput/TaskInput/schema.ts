import {
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { TutorialTaskCreateInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type TaskInputFields = DeepNonNullable<TutorialTaskCreateInput> & {
    clientId: string;
};

export type PartialTaskInputFields = PartialForm<TaskInputFields, 'clientId'>;

type TaskSchema = ObjectSchema<PartialTaskInputFields>;

const taskSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        clientId: {
            forceValue: undefinedValue,
        },
        reference: {},
        projectTypeSpecifics: {},
    }),
};

export default taskSchema;

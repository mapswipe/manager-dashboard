import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    TutorialTaskCreateInput,
    TutorialTaskProjectTypeSpecificInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import findPropertyInputSchema from './FindPropertyInput/schema';

export type TaskInputFields = DeepNonNullable<TutorialTaskCreateInput>;
export type PartialTaskInputFields = PartialForm<TaskInputFields, 'clientId'>;
type TaskSchema = ObjectSchema<PartialTaskInputFields>;

type ProjectTypeSpecifics = DeepNonNullable<TutorialTaskProjectTypeSpecificInput>;
export type PartialProjectTypeSpecifics = PartialForm<ProjectTypeSpecifics>;
type ProjectTypeSpecificsSchema = ObjectSchema<PartialProjectTypeSpecifics>;

const taskSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        clientId: {},
        reference: {},
        projectTypeSpecifics: {
            fields: (): ReturnType<ProjectTypeSpecificsSchema['fields']> => ({
                find: findPropertyInputSchema,
            }),
        },
    }),
};

export default taskSchema;

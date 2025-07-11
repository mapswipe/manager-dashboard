import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { FindTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type FindPropertyInputFields = DeepNonNullable<FindTutorialTaskPropertyInput>;
export type PartialFindPropertyInputFields = PartialForm<FindPropertyInputFields>;

type TaskSchema = ObjectSchema<PartialFindPropertyInputFields>;

const findPropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        tileX: {},
        tileY: {},
        tileZ: {},
    }),
};

export default findPropertyInputSchema;

import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { CompletenessTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type CompletenessPropertyInputFields = DeepNonNullable<
    CompletenessTutorialTaskPropertyInput
>;
export type PartialCompletenessPropertyInputFields = PartialForm<CompletenessPropertyInputFields>;

type TaskSchema = ObjectSchema<PartialCompletenessPropertyInputFields>;

const completenessPropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        tileX: {},
        tileY: {},
        tileZ: {},
    }),
};

export default completenessPropertyInputSchema;

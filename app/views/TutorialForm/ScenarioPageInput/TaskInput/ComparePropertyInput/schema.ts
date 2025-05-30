import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { CompareTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type ComparePropertyInputFields = DeepNonNullable<CompareTutorialTaskPropertyInput>;
export type PartialComparePropertyInputFields = PartialForm<ComparePropertyInputFields>;

type TaskSchema = ObjectSchema<PartialComparePropertyInputFields>;

const comparePropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        tileX: {},
        tileY: {},
        tileZ: {},
    }),
};

export default comparePropertyInputSchema;

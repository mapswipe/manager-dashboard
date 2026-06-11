import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { LocateTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type LocateObjectPropertyInputFields = DeepNonNullable<LocateTutorialTaskPropertyInput>;
export type PartialLocateObjectPropertyInputFields = PartialForm<
    LocateObjectPropertyInputFields
>;

type TaskSchema = ObjectSchema<PartialLocateObjectPropertyInputFields>;

const locateObjectPropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        tileX: {},
        tileY: {},
        tileZ: {},
    }),
};

export default locateObjectPropertyInputSchema;

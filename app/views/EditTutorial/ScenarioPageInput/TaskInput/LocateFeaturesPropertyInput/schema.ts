import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { LocateTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type LocateFeaturesPropertyInputFields = DeepNonNullable<LocateTutorialTaskPropertyInput>;
export type PartialLocateFeaturesPropertyInputFields = PartialForm<
    LocateFeaturesPropertyInputFields
>;

type TaskSchema = ObjectSchema<PartialLocateFeaturesPropertyInputFields>;

const locateFeaturesPropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        tileX: {},
        tileY: {},
        tileZ: {},
    }),
};

export default locateFeaturesPropertyInputSchema;

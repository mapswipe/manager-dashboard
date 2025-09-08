import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { StreetTutorialTaskPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type StreetPropertyInputFields = DeepNonNullable<StreetTutorialTaskPropertyInput>;
export type PartialStreetPropertyInputFields = PartialForm<StreetPropertyInputFields>;

type TaskSchema = ObjectSchema<PartialStreetPropertyInputFields>;

const streetPropertyInputSchema: TaskSchema = {
    fields: (): ReturnType<TaskSchema['fields']> => ({
        mapillaryImageId: {},
        geometry: {},
    }),
};

export default streetPropertyInputSchema;

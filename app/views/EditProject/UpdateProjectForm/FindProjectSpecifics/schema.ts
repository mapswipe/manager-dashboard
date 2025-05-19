import {
    greaterThanCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import { FindProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import tileServerFormSchema, { defaultTileServerInputFormValue } from '../TileServerInput/schema';

export type PartialFindSpecificFields = PartialForm<DeepNonNullable<FindProjectPropertyInput>>;
type FindSpecificFormSchema = ObjectSchema<
    PartialFindSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultFindSpecificFormValue: PartialFindSpecificFields = {
    tileServerProperty: defaultTileServerInputFormValue,
};

const findSpecificFormSchema: FindSpecificFormSchema = {
    fields: (): ReturnType<FindSpecificFormSchema['fields']> => ({
        zoomLevel: {
            required: true,
            validations: [greaterThanCondition(0)],
        },
        tileServerProperty: tileServerFormSchema,
        aoiGeometry: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

export default findSpecificFormSchema;

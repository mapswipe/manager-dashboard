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
} from '../../schema';
import tileServerFormSchema from '../../TileServerInput/schema';

export type PartialFindSpecificFields = PartialForm<DeepNonNullable<FindProjectPropertyInput>>;
type FindSpecificFormSchema = ObjectSchema<
    PartialFindSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultFindSpecificFormValue: PartialFindSpecificFields = {
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

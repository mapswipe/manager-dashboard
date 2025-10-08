import {
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/domain/RasterTileServerInput/schema';
import { FindProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';

export type PartialFindSpecificFields = PartialForm<DeepNonNullable<FindProjectPropertyInput>>;
type FindSpecificFormSchema = ObjectSchema<
    PartialFindSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultFindSpecificFormValue: PartialFindSpecificFields = {
    tileServerProperty: defaultRasterTileServerInputValue,
    zoomLevel: 18,
};

const findSpecificFormSchema: FindSpecificFormSchema = {
    fields: (): ReturnType<FindSpecificFormSchema['fields']> => ({
        zoomLevel: {
            required: true,
            validations: [greaterThanOrEqualToCondition(14), lessThanOrEqualToCondition(22)],
        },
        tileServerProperty: rasterTileServerFormSchema,
        aoiGeometry: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

export default findSpecificFormSchema;

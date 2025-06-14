import {
    greaterThanCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/RasterTileServerInput/schema';
import { CompletenessProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import overlayTileServerPropertySchema, { defaultOverlayTileServerPropertyInputValue } from './OverlayTileServerPropertyInput/schema';

export type PartialCompletenessSpecificFields = PartialForm<
    DeepNonNullable<CompletenessProjectPropertyInput>
>;
type CompletenessSpecificFormSchema = ObjectSchema<
    PartialCompletenessSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultCompletenessSpecificFormValue: PartialCompletenessSpecificFields = {
    zoomLevel: 16,
    tileServerProperty: defaultRasterTileServerInputValue,
    overlayTileServerProperty: defaultOverlayTileServerPropertyInputValue,
};

const completenessSpecificFormSchema: CompletenessSpecificFormSchema = {
    fields: (): ReturnType<CompletenessSpecificFormSchema['fields']> => ({
        zoomLevel: {
            required: true,
            validations: [greaterThanCondition(0)],
        },
        tileServerProperty: rasterTileServerFormSchema,
        overlayTileServerProperty: overlayTileServerPropertySchema,
        aoiGeometry: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

export default completenessSpecificFormSchema;

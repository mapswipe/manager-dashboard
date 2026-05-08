import {
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/domain/CustomOptionInput/schema';
import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/domain/RasterTileServerInput/schema';
import { LocateProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';

export type PartialLocateFeaturesSpecificFields = PartialForm<
    DeepNonNullable<LocateProjectPropertyInput>,
    'clientId'
>;
type LocateFeaturesSpecificFormSchema = ObjectSchema<
    PartialLocateFeaturesSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultLocateFeaturesSpecificFormValue: PartialLocateFeaturesSpecificFields = {
    tileServerProperty: defaultRasterTileServerInputValue,
    zoomLevel: 18,
};

const locateFeaturesSpecificFormSchema: LocateFeaturesSpecificFormSchema = {
    fields: (): ReturnType<LocateFeaturesSpecificFormSchema['fields']> => ({
        zoomLevel: {
            required: true,
            validations: [greaterThanOrEqualToCondition(14), lessThanOrEqualToCondition(22)],
        },
        tileServerProperty: rasterTileServerFormSchema,
        aoiGeometry: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        subGridSize: {
            required: true,
        },
        exportMetaKey: {},
        exportMetaValue: {},
        customOptions: {
            keySelector: (value) => value.clientId,
            member: () => customOptionSchema,
        },
    }),
};

export default locateFeaturesSpecificFormSchema;

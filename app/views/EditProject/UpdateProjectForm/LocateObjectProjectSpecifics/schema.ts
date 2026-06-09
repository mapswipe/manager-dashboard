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

export type PartialLocateObjectSpecificFields = PartialForm<
    DeepNonNullable<LocateProjectPropertyInput>,
    'clientId'
>;
type LocateObjectSpecificFormSchema = ObjectSchema<
    PartialLocateObjectSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultLocateObjectSpecificFormValue: PartialLocateObjectSpecificFields = {
    tileServerProperty: defaultRasterTileServerInputValue,
    zoomLevel: 18,
};

const locateObjectSpecificFormSchema: LocateObjectSpecificFormSchema = {
    fields: (): ReturnType<LocateObjectSpecificFormSchema['fields']> => ({
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

export default locateObjectSpecificFormSchema;

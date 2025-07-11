import {
    greaterThanCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema from '#components/RasterTileServerInput/schema';
import {
    CompareProjectPropertyInput,
    RasterTileServerNameEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';

export type PartialCompareSpecificFields = PartialForm<
    DeepNonNullable<CompareProjectPropertyInput>
>;
type CompareSpecificFormSchema = ObjectSchema<
    PartialCompareSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultCompareSpecificFormValue: PartialCompareSpecificFields = {
    zoomLevel: 18,
    tileServerProperty: {
        name: RasterTileServerNameEnum.Custom,
        custom: {
        },
    },
    tileServerBProperty: {
        name: RasterTileServerNameEnum.Custom,
        custom: {
        },
    },
};

const compareSpecificFormSchema: CompareSpecificFormSchema = {
    fields: (): ReturnType<CompareSpecificFormSchema['fields']> => ({
        zoomLevel: {
            required: true,
            validations: [greaterThanCondition(0)],
        },
        tileServerProperty: rasterTileServerFormSchema,
        tileServerBProperty: rasterTileServerFormSchema,
        aoiGeometry: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

export default compareSpecificFormSchema;

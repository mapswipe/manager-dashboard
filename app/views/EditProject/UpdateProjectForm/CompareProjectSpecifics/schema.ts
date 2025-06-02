import {
    greaterThanCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    CompareProjectPropertyInput,
    TileServerNameEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import tileServerFormSchema from '../TileServerInput/schema';

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
        name: TileServerNameEnum.Custom,
        custom: {
        },
    },
    tileServerBProperty: {
        name: TileServerNameEnum.Custom,
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
        tileServerProperty: tileServerFormSchema,
        tileServerBProperty: tileServerFormSchema,
        aoiGeometry: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

export default compareSpecificFormSchema;

import {
    greaterThanCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    CompletenessProjectPropertyInput,
    TileServerNameEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import tileServerFormSchema from '../TileServerInput/schema';

export type PartialCompletenessSpecificFields = PartialForm<
    DeepNonNullable<CompletenessProjectPropertyInput>
>;
type CompletenessSpecificFormSchema = ObjectSchema<
    PartialCompletenessSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultCompletenessSpecificFormValue: PartialCompletenessSpecificFields = {
    zoomLevel: 18,
    tileServerProperty: {
        name: TileServerNameEnum.Bing,
    },
    tileServerBProperty: {
        name: TileServerNameEnum.Mapbox,
    },
};

const completenessSpecificFormSchema: CompletenessSpecificFormSchema = {
    fields: (): ReturnType<CompletenessSpecificFormSchema['fields']> => ({
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

export default completenessSpecificFormSchema;

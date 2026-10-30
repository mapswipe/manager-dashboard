import { isDefined } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/domain/CustomOptionInput/schema';
import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/domain/RasterTileServerInput/schema';
import { ValidateProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import objectSourceFormSchema, { defaultObjectSourceInputFormValue } from './ObjectSourceInput/schema';

export type PartialValidateSpecificFields = PartialForm<
    DeepNonNullable<ValidateProjectPropertyInput>,
    'clientId'
>;
type ValidateSpecificFormSchema = ObjectSchema<
    PartialValidateSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultValidateSpecificFormValue: PartialValidateSpecificFields = {
    objectSource: defaultObjectSourceInputFormValue,
    tileServerProperty: defaultRasterTileServerInputValue,
};

const validateSpecificFormSchema: ValidateSpecificFormSchema = {
    fields: (value): ReturnType<ValidateSpecificFormSchema['fields']> => ({
        customOptions: {
            keySelector: (customOption) => customOption.clientId,
            member: () => customOptionSchema,
        },
        objectSource: objectSourceFormSchema,
        tileServerProperty: rasterTileServerFormSchema,
        preEventTileServerProperty: isDefined(value?.preEventTileServerProperty)
            ? rasterTileServerFormSchema
            : { forceValue: undefinedValue },
    }),
};

export default validateSpecificFormSchema;

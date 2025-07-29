import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/CustomOptionInput/schema';
import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/RasterTileServerInput/schema';
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
    fields: (): ReturnType<ValidateSpecificFormSchema['fields']> => ({
        customOptions: {
            keySelector: (value) => value.clientId,
            member: () => customOptionSchema,
        },
        objectSource: objectSourceFormSchema,
        tileServerProperty: rasterTileServerFormSchema,
    }),
};

export default validateSpecificFormSchema;

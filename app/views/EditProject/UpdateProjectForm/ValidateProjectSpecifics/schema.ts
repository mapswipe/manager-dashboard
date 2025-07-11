import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/RasterTileServerInput/schema';
import { ValidateProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import objectSourceFormSchema, { defaultObjectSourceInputFormValue } from './ObjectSourceInput/schema';

export type PartialValidateSpecificFields = PartialForm<
    DeepNonNullable<ValidateProjectPropertyInput>
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
        objectSource: objectSourceFormSchema,
        tileServerProperty: rasterTileServerFormSchema,
    }),
};

export default validateSpecificFormSchema;

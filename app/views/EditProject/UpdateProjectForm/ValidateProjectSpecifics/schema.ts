import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { ValidateProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import tileServerFormSchema, { defaultTileServerInputFormValue } from '../TileServerInput/schema';
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
    tileServerProperty: defaultTileServerInputFormValue,
};

const validateSpecificFormSchema: ValidateSpecificFormSchema = {
    fields: (): ReturnType<ValidateSpecificFormSchema['fields']> => ({
        objectSource: objectSourceFormSchema,
        tileServerProperty: tileServerFormSchema,
    }),
};

export default validateSpecificFormSchema;

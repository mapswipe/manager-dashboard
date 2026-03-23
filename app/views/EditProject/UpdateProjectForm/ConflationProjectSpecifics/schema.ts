import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/domain/RasterTileServerInput/schema';
import { ConflationProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import objectSourceFormSchema, { defaultObjectSourceInputFormValue } from './ObjectSourceInput/schema';

export type PartialConflationSpecificFields = PartialForm<
    DeepNonNullable<ConflationProjectPropertyInput>,
    'clientId'
>;
type ConflationSpecificFormSchema = ObjectSchema<
    PartialConflationSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultConflationSpecificFormValue: PartialConflationSpecificFields = {
    objectSource: defaultObjectSourceInputFormValue,
    tileServerProperty: defaultRasterTileServerInputValue,
};

const conflationSpecificFormSchema: ConflationSpecificFormSchema = {
    fields: (): ReturnType<ConflationSpecificFormSchema['fields']> => ({
        objectSource: objectSourceFormSchema,
        tileServerProperty: rasterTileServerFormSchema,
    }),
};

export default conflationSpecificFormSchema;

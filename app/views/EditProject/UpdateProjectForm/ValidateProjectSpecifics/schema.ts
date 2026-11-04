import {
    addCondition,
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
    hasPreImagery: false,
};

type ValidateSpecificFormFields = ReturnType<ValidateSpecificFormSchema['fields']>;

const validateSpecificFormSchema: ValidateSpecificFormSchema = {
    fields: (value): ValidateSpecificFormFields => {
        const baseSchema: ValidateSpecificFormFields = {
            customOptions: {
                keySelector: (customOption) => customOption.clientId,
                member: () => customOptionSchema,
            },
            objectSource: objectSourceFormSchema,
            tileServerProperty: rasterTileServerFormSchema,
            hasPreImagery: {},
        };

        return addCondition(
            baseSchema,
            value,
            ['hasPreImagery'],
            ['preEventTileServerProperty'],
            (val): Pick<ValidateSpecificFormFields, 'preEventTileServerProperty'> => ({
                preEventTileServerProperty: val?.hasPreImagery
                    ? rasterTileServerFormSchema
                    : { forceValue: undefinedValue },
            }),
        );
    },
};

export default validateSpecificFormSchema;

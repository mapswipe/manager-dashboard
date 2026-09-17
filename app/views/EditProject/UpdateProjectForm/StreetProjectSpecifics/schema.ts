import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/domain/CustomOptionInput/schema';
import streetImageProviderSchema, { defaultStreetImageProviderValue } from '#components/domain/StreetImageProviderInput/schema';
import { StreetProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import streetImageFiltersFormSchema, { defaultStreetImageFiltersInputFormValue } from './StreetImageFiltersInput/schema';

export type PartialStreetSpecificFields = PartialForm<
    DeepNonNullable<StreetProjectPropertyInput>,
    'clientId'
>;
type StreetSpecificFormSchema = ObjectSchema<
    PartialStreetSpecificFields,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;

export const defaultStreetSpecificFormValue: PartialStreetSpecificFields = {
    mapillaryImageFilters: defaultStreetImageFiltersInputFormValue,
    imageProvider: defaultStreetImageProviderValue,
};

const streetSpecificFormSchema: StreetSpecificFormSchema = {
    fields: (): ReturnType<StreetSpecificFormSchema['fields']> => ({
        customOptions: {
            keySelector: (value) => value.clientId,
            member: () => customOptionSchema,
        },
        aoiGeometry: {},
        mapillaryImageFilters: streetImageFiltersFormSchema,
        imageProvider: streetImageProviderSchema,
    }),
};

export default streetSpecificFormSchema;

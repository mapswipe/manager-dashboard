import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import customOptionSchema from '#components/domain/CustomOptionInput/schema';
import { StreetProjectPropertyInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialProjectUpdateInput,
    type UpdateProjectContext,
} from '../schema';
import streetMapillaryimageFiltersFormSchema, { defaultStreetMapillaryImageFiltersInputFormValue } from './StreetMapillaryImageFiltersInput/schema';

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
    mapillaryImageFilters: defaultStreetMapillaryImageFiltersInputFormValue,
};

const streetSpecificFormSchema: StreetSpecificFormSchema = {
    fields: (): ReturnType<StreetSpecificFormSchema['fields']> => ({
        customOptions: {
            keySelector: (value) => value.clientId,
            member: () => customOptionSchema,
        },
        aoiGeometry: {},
        mapillaryImageFilters: streetMapillaryimageFiltersFormSchema,
    }),
};

export default streetSpecificFormSchema;

import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { StreetMapillaryImageFiltersInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type PartialStreetMapillaryImageFiltersInputFields = PartialForm<
    DeepNonNullable<StreetMapillaryImageFiltersInput>
>;

type StreetMapillaryImageFiltersFormSchema = ObjectSchema<
    PartialStreetMapillaryImageFiltersInputFields
>;

// eslint-disable-next-line max-len
export const defaultStreetMapillaryImageFiltersInputFormValue: PartialStreetMapillaryImageFiltersInputFields = {
    randomizeOrder: false,
};

const streetMapillaryimageFiltersFormSchema: StreetMapillaryImageFiltersFormSchema = {
    fields: (): ReturnType<StreetMapillaryImageFiltersFormSchema['fields']> => ({
        panoOnly: {},
        creatorId: {},
        organizationId: {},
        startTime: {},
        endTime: {},
        randomizeOrder: {},
        samplingThreshold: {},
    }),
};

export default streetMapillaryimageFiltersFormSchema;

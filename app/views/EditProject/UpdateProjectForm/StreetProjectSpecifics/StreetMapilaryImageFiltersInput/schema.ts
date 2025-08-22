import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { StreetMapillaryImageFiltersInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type PartialStreetMapilaryImageFiltersInputFields = PartialForm<
    DeepNonNullable<StreetMapillaryImageFiltersInput>
>;

type StreetMapilaryImageFiltersFormSchema = ObjectSchema<
    PartialStreetMapilaryImageFiltersInputFields
>;

// eslint-disable-next-line max-len
export const defaultStreetMapilaryImageFiltersInputFormValue: PartialStreetMapilaryImageFiltersInputFields = {
    randomizeOrder: false,
    isPano: false,
};

const streetMapilaryimageFiltersFormSchema: StreetMapilaryImageFiltersFormSchema = {
    fields: (): ReturnType<StreetMapilaryImageFiltersFormSchema['fields']> => ({
        isPano: {},
        creatorId: {},
        organizationId: {},
        startTime: {},
        endTime: {},
        randomizeOrder: {},
        samplingThreshold: {},
    }),
};

export default streetMapilaryimageFiltersFormSchema;

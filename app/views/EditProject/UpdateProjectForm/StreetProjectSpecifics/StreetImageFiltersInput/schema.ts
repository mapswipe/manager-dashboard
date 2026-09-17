import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { StreetImageFiltersInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type PartialStreetImageFiltersInputFields = PartialForm<
    DeepNonNullable<StreetImageFiltersInput>
>;

type StreetImageFiltersFormSchema = ObjectSchema<
    PartialStreetImageFiltersInputFields
>;

export const defaultStreetImageFiltersInputFormValue: PartialStreetImageFiltersInputFields = {
    randomizeOrder: false,
};

const streetImageFiltersFormSchema: StreetImageFiltersFormSchema = {
    fields: (): ReturnType<StreetImageFiltersFormSchema['fields']> => ({
        panoOnly: {},
        creatorId: {},
        organizationId: {},
        startTime: {},
        endTime: {},
        randomizeOrder: {},
        samplingThreshold: {},
    }),
};

export default streetImageFiltersFormSchema;

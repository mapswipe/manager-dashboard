import {
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    TutorialInformationPageBlockCreateInput,
    TutorialInformationPageCreateInput,
} from '#generated/types/graphql';
import {
    DeepNonNullable,
    DeepReplace,
} from '#utils/types';

import blockFormSchema, { BlockInputFields } from './BlockInput/schema';

export type InformationPagesInputFields = DeepNonNullable<
    DeepReplace<
        TutorialInformationPageCreateInput & { clientId: string },
        TutorialInformationPageBlockCreateInput,
        BlockInputFields
    >
>;

export type PartialInformationPageInputFields = PartialForm<
    InformationPagesInputFields,
    'clientId'
>;
export type InformationPageFormSchema = ObjectSchema<
    PartialInformationPageInputFields
>;

const informationPageSchema: InformationPageFormSchema = {
    fields: (): ReturnType<InformationPageFormSchema['fields']> => ({
        clientId: {
            forceValue: undefinedValue,
        },
        title: {
            required: true,
        },
        pageNumber: {
            required: true,
        },
        blocks: {
            keySelector: (value) => value.clientId,
            member: () => blockFormSchema,
        },
    }),
};

export default informationPageSchema;

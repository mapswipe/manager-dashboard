import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { TutorialInformationPageCreateInput } from '#generated/types/graphql';
import {
    DeepNonNullable,
    DeepReplace,
} from '#utils/types';

import blockFormSchema, { PartialBlockInputFields } from './BlockInput/schema';

export type InformationPagesInputFields = DeepNonNullable<
    DeepReplace<
        TutorialInformationPageCreateInput,
        TutorialInformationPageCreateInput['blocks'],
        Array<PartialBlockInputFields>
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
        clientId: {},
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

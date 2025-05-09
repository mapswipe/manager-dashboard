import {
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { TutorialInformationPageBlockCreateInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type BlockInputFields = DeepNonNullable<TutorialInformationPageBlockCreateInput> & {
    clientId: string;
}

export type PartialBlockInputFields = PartialForm<
    BlockInputFields,
    'clientId'
>;

type BlockSchema = ObjectSchema<PartialBlockInputFields>;

const blockFormSchema: BlockSchema = {
    fields: (): ReturnType<BlockSchema['fields']> => ({
        clientId: {
            forceValue: undefinedValue,
        },
        blockNumber: { required: true },
        blockType: { required: true },
        image: {},
        text: {},
    }),
};

export default blockFormSchema;

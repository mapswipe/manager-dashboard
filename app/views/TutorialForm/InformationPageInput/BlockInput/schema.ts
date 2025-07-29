import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { TutorialInformationPageBlockCreateInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type BlockInputFields = DeepNonNullable<TutorialInformationPageBlockCreateInput>;

export type PartialBlockInputFields = PartialForm<
    BlockInputFields,
    'clientId'
>;

type BlockSchema = ObjectSchema<PartialBlockInputFields>;

const blockFormSchema: BlockSchema = {
    fields: (): ReturnType<BlockSchema['fields']> => ({
        clientId: {},
        blockNumber: { required: true },
        blockType: { required: true },
        image: {},
        text: {},
    }),
};

export default blockFormSchema;

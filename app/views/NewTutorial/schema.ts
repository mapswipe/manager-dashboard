import { ReturnType } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import { TutorialCreateInput } from '#generated/types/graphql';

type PartialTutorialCreateInputFields = PartialForm<TutorialCreateInput, 'clientId'>;
type TutorialCreateFormSchema = ObjectSchema<PartialTutorialCreateInputFields>;

const tutorialCreateFormSchema: TutorialCreateFormSchema = {
    fields: (): ReturnType<TutorialCreateFormSchema['fields']> => ({
        clientId: {},
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        project: {
            required: true,
        },
    }),
};

export default tutorialCreateFormSchema;

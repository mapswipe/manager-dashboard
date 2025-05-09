import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    TutorialCreateInput,
    TutorialInformationPageCreateInput,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';
import {
    DeepNonNullable,
    DeepReplace,
} from '#utils/types';

import informationPageSchema, { type InformationPagesInputFields } from './InformationPageInput/schema';
import scenarioPageSchema, { ScenarioPageInputFields } from './ScenarioPageInput/schema';

export type PartialTutorialCreateInputFields = PartialForm<
    DeepNonNullable<
        DeepReplace<
            DeepReplace<
                TutorialCreateInput,
                TutorialInformationPageCreateInput,
                InformationPagesInputFields
            >,
            TutorialScenarioPageCreateInput,
            ScenarioPageInputFields
        >
    >,
    'clientId'
>;
export type TutorialCreateFormSchema = ObjectSchema<PartialTutorialCreateInputFields>;

export const defaultTutorialCreateFormValue: PartialTutorialCreateInputFields = {
};

const tutorialCreateFormSchema: TutorialCreateFormSchema = {
    fields: (): ReturnType<TutorialCreateFormSchema['fields']> => ({
        project: {
            required: true,
        },
        isDraft: {},
        informationPages: {
            keySelector: (value) => value.clientId,
            member: () => informationPageSchema,
        },
        scenarios: {
            keySelector: (value) => value.clientId,
            member: () => scenarioPageSchema,
        },
    }),
};

export default tutorialCreateFormSchema;

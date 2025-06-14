import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import {
    ProjectTypeEnum,
    TutorialCreateInput,
    TutorialInformationPageBlockTypeEnum,
    TutorialInformationPageCreateInput,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';
import {
    DeepNonNullable,
    DeepReplace,
} from '#utils/types';

import informationPageSchema, { type InformationPagesInputFields } from './InformationPageInput/schema';
import scenarioPageSchema, { ScenarioPageInputFields } from './ScenarioPageInput/schema';

export type TutorialFormContext = {
    projectType: ProjectTypeEnum | undefined,
} | undefined;

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
export type TutorialCreateFormSchema = ObjectSchema<
    PartialTutorialCreateInputFields,
    PartialTutorialCreateInputFields,
    TutorialFormContext
>;

// FIXME: This should be inside render so that we have new client id everytime
export const defaultTutorialCreateFormValue: PartialTutorialCreateInputFields = {
    clientId: ulid(),
    informationPages: [
        {
            clientId: ulid(),
            pageNumber: 1,
            blocks: [
                {
                    clientId: ulid(),
                    blockNumber: 1,
                    blockType: TutorialInformationPageBlockTypeEnum.Text,
                },
            ],
        },
    ],
};

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

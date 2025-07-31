import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    ProjectTypeEnum,
    TutorialUpdateInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import informationPageSchema, { PartialInformationPageInputFields } from './InformationPageInput/schema';
import scenarioPageSchema, { PartialScenarioPageInputFields } from './ScenarioPageInput/schema';

export type TutorialFormContext = {
    projectType: ProjectTypeEnum | undefined,
} | undefined;

export type PartialTutorialUpdateInputFields = PartialForm<
    Omit<DeepNonNullable<TutorialUpdateInput>, 'informationPages' | 'scenarios'> & {
        informationPages: Array<PartialInformationPageInputFields>,
        scenarios: Array<PartialScenarioPageInputFields>,
    },
    'clientId'
>;

export type TutorialUpdateFormSchema = ObjectSchema<
    PartialTutorialUpdateInputFields,
    PartialTutorialUpdateInputFields,
    TutorialFormContext
>;

const tutorialUpdate: TutorialUpdateFormSchema = {
    fields: (): ReturnType<TutorialUpdateFormSchema['fields']> => ({
        clientId: {},
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        status: {},
        informationPages: {
            keySelector: (informationPage) => informationPage.clientId,
            member: () => informationPageSchema,
        },
        scenarios: {
            keySelector: (scenario) => scenario.clientId,
            member: () => scenarioPageSchema,
        },
    }),
};

export default tutorialUpdate;

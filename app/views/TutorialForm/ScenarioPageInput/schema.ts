import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    TutorialScenarioPageCreateInput,
    TutorialTaskCreateInput,
} from '#generated/types/graphql';
import {
    DeepNonNullable,
    DeepReplace,
} from '#utils/types';

import taskSchema, { TaskInputFields } from './TaskInput/schema';

export type ScenarioPageInputFields = DeepNonNullable<
    DeepReplace<
        TutorialScenarioPageCreateInput & { clientId: string },
        TutorialTaskCreateInput,
        TaskInputFields
    >
>;

export type PartialScenarioPageInputFields = PartialForm<
    ScenarioPageInputFields,
    'clientId'
>;

export type ScenarioPageSchema = ObjectSchema<PartialScenarioPageInputFields>;

const scenarioPageSchema: ScenarioPageSchema = {
    fields: (): ReturnType<ScenarioPageSchema['fields']> => ({
        clientId: {},
        hintDescription: {},
        hintIcon: {},
        hintTitle: {},
        instructionsDescription: {},
        instructionsIcon: {},
        instructionsTitle: {},
        scenarioPageNumber: {
            required: true,
        },
        successDescription: {},
        successIcon: {},
        successTitle: {},
        tasks: {
            keySelector: (value) => value.clientId,
            member: () => taskSchema,
        },
    }),
};

export default scenarioPageSchema;

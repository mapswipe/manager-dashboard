import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { TutorialScenarioPageCreateInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import taskSchema from './TaskInput/schema';

export type ScenarioPageInputFields = DeepNonNullable<
    TutorialScenarioPageCreateInput
>

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

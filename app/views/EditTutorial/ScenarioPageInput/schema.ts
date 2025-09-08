import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { TutorialScenarioPageCreateInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import {
    type PartialTutorialUpdateInputFields,
    type TutorialFormContext,
} from '../schema';
import taskSchema from './TaskInput/schema';

export type ScenarioPageInputFields = DeepNonNullable<
    TutorialScenarioPageCreateInput
>

export type PartialScenarioPageInputFields = PartialForm<
    ScenarioPageInputFields,
    'clientId'
>;

export type ScenarioPageSchema = ObjectSchema<
    PartialScenarioPageInputFields,
    PartialTutorialUpdateInputFields,
    TutorialFormContext
>;

type ScenarioPageFields = ReturnType<ScenarioPageSchema['fields']>;

const scenarioPageSchema: ScenarioPageSchema = {
    fields: (): ScenarioPageFields => ({
        clientId: {},
        scenarioPageNumber: {
            required: true,
        },
        instructionsDescription: {
            required: true,
        },
        instructionsIcon: {
            required: true,
        },
        instructionsTitle: {
            required: true,
        },
        hintDescription: {
            required: true,
        },
        hintIcon: {
            required: true,
        },
        hintTitle: {
            required: true,
        },
        successDescription: {
            required: true,
        },
        successIcon: {
            required: true,
        },
        successTitle: {
            required: true,
        },
        tasks: {
            keySelector: (value) => value.clientId,
            member: () => taskSchema,
        },
    }),
};

export default scenarioPageSchema;

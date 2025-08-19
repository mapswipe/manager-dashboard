import {
    nullValue,
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    ProjectTypeEnum,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';
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
    fields: (_, __, context): ScenarioPageFields => {
        const baseFields: ScenarioPageFields = {
            clientId: {},
            scenarioPageNumber: {
                required: true,
            },
            hintDescription: {},
            hintIcon: {},
            hintTitle: {},
            tasks: {
                keySelector: (value) => value.clientId,
                member: () => taskSchema,
            },
        };

        if (
            context?.projectType === ProjectTypeEnum.ValidateImage
                || context?.projectType === ProjectTypeEnum.Validate
        ) {
            return {
                ...baseFields,
                instructionsDescription: { forceValue: nullValue },
                instructionsIcon: { forceValue: nullValue },
                instructionsTitle: { forceValue: nullValue },
                successDescription: { forceValue: nullValue },
                successIcon: { forceValue: nullValue },
                successTitle: { forceValue: nullValue },
            } satisfies ScenarioPageFields;
        }

        return {
            ...baseFields,
            instructionsDescription: {},
            instructionsIcon: {},
            instructionsTitle: {},
            successDescription: {},
            successIcon: {},
            successTitle: {},
        } satisfies ScenarioPageFields;
    },
};

export default scenarioPageSchema;

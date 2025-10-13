import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    ProcessedProjectUpdateInput,
    ProjectTypeEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type UpdateProcessedProjectContext = {
    projectType: ProjectTypeEnum | undefined,
};

export type PartialProcessedProjectUpdateInput = PartialForm<
    DeepNonNullable<ProcessedProjectUpdateInput>
>;
type ProcessedProjectUpdateFormSchema = ObjectSchema<
    PartialProcessedProjectUpdateInput,
    PartialProcessedProjectUpdateInput,
    UpdateProcessedProjectContext
>;
type ProcessedProjectUpdateFormFields = ReturnType<ProcessedProjectUpdateFormSchema['fields']>;

const processedProjectUpdateFormSchema: ProcessedProjectUpdateFormSchema = {
    fields: (): ProcessedProjectUpdateFormFields => ({
        clientId: {},
        topic: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        projectNumber: {
            required: true,
            // FIXME: add positive integer validation
        },
        requestingOrganization: {
            required: true,
        },
        region: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        projectInstruction: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        lookFor: {
            required: true,
        },
        description: {},
        additionalInfoUrl: {},
        image: {},
        team: {},
        tutorial: {
            // FIXME(frozenhelium): only make this required for publish project
            required: true,
        },
    }),
};

export default processedProjectUpdateFormSchema;

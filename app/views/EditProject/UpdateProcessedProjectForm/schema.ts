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
        projectNumber: {
            required: true,
            // FIXME: add positive integer validation
        },
        topic: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        region: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        lookFor: {
            required: true,
        },
        requestingOrganization: {
            required: true,
        },
        additionalInfoUrl: {},
        description: {},
        image: {},
        team: {},
        status: {},
        tutorial: {
            required: true,
        },
    }),
};

export default processedProjectUpdateFormSchema;

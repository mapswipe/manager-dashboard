import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    ProjectTypeEnum,
    ProjectTypeSpecificInput,
    ProjectUpdateInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import compareSpecificFormSchema from './CompareProjectSpecifics/schema';
import completenessSpecificFormSchema from './CompletenessProjectSpecifics/schema';
import findSpecificFormSchema from './FindProjectSpecifics/schema';
import validateSpecificFormSchema from './ValidateProjectSpecifics/schema';

export type UpdateProjectContext = {
    projectType: ProjectTypeEnum | undefined,
};

export type PartialProjectUpdateInput = PartialForm<DeepNonNullable<ProjectUpdateInput>>;
type ProjectUpdateFormSchema = ObjectSchema<
    PartialProjectUpdateInput,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;
type ProjectUpdateFormFields = ReturnType<ProjectUpdateFormSchema['fields']>;

export type PartialProjectTypeSpecificInput = PartialForm<
    DeepNonNullable<ProjectTypeSpecificInput>
>;
type ProjectSpecificFieldsFormSchema = ObjectSchema<
    PartialProjectTypeSpecificInput,
    PartialProjectUpdateInput,
    UpdateProjectContext
>;
type ProjectTypeSpecificFormFields = ReturnType<ProjectSpecificFieldsFormSchema['fields']>;

const projectUpdateFormSchema: ProjectUpdateFormSchema = {
    fields: (_, __, context): ProjectUpdateFormFields => ({
        clientId: {},
        name: {
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
        verificationNumber: {},
        groupSize: {},
        maxTasksPerUser: {},
        description: {},
        image: {},
        projectTypeSpecifics: {
            fields: (): ProjectTypeSpecificFormFields => {
                if (context?.projectType === ProjectTypeEnum.Find) {
                    return {
                        find: findSpecificFormSchema,
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Compare) {
                    return {
                        compare: compareSpecificFormSchema,
                        find: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Completeness) {
                    return {
                        completeness: completenessSpecificFormSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Validate) {
                    return {
                        validate: validateSpecificFormSchema,
                        completeness: { forceValue: undefinedValue },
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                    };
                }

                return {
                    find: { forceValue: undefinedValue },
                    compare: { forceValue: undefinedValue },
                    completeness: { forceValue: undefinedValue },
                };
            },
        },
    }),
};

export default projectUpdateFormSchema;

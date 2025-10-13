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
import streetSpecificFormSchema from './StreetProjectSpecifics/schema.ts';
import validateImageSpecificFormSchema from './ValidateImageProjectSpecifics/schema.ts';
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
        topic: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        projectNumber: {
            required: true,
            // FIXME: add positive integer validation
        },
        region: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        requestingOrganization: {
            required: true,
        },
        projectInstruction: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        lookFor: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        additionalInfoUrl: {},
        verificationNumber: {},
        groupSize: {},
        maxTasksPerUser: {},
        team: {},
        description: {},
        image: {},
        projectTypeSpecifics: {
            fields: (): ProjectTypeSpecificFormFields => {
                if (context?.projectType === ProjectTypeEnum.Find) {
                    return {
                        street: { forceValue: undefinedValue },
                        find: findSpecificFormSchema,
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Compare) {
                    return {
                        street: { forceValue: undefinedValue },
                        compare: compareSpecificFormSchema,
                        find: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Completeness) {
                    return {
                        street: { forceValue: undefinedValue },
                        completeness: completenessSpecificFormSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Validate) {
                    return {
                        street: { forceValue: undefinedValue },
                        validate: validateSpecificFormSchema,
                        completeness: { forceValue: undefinedValue },
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.ValidateImage) {
                    return {
                        street: { forceValue: undefinedValue },
                        validateImage: validateImageSpecificFormSchema,
                        completeness: { forceValue: undefinedValue },
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Street) {
                    return {
                        street: streetSpecificFormSchema,
                        validateImage: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                    };
                }

                // context?.projectType satisfies never;

                return {
                    street: { forceValue: undefinedValue },
                    find: { forceValue: undefinedValue },
                    compare: { forceValue: undefinedValue },
                    completeness: { forceValue: undefinedValue },
                    validate: { forceValue: undefinedValue },
                    validateImage: { forceValue: undefinedValue },
                };
            },
        },
    }),
};

export default projectUpdateFormSchema;

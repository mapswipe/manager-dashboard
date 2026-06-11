import { isNotDefined } from '@togglecorp/fujs';
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
import locateObjectSpecificFormSchema from './LocateObjectProjectSpecifics/schema.ts';
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
                const defaultValue = {
                    street: { forceValue: undefinedValue },
                    find: { forceValue: undefinedValue },
                    compare: { forceValue: undefinedValue },
                    completeness: { forceValue: undefinedValue },
                    validate: { forceValue: undefinedValue },
                    validateImage: { forceValue: undefinedValue },
                } satisfies ProjectTypeSpecificFormFields;

                if (isNotDefined(context)) {
                    return defaultValue;
                }

                const { projectType } = context;

                if (isNotDefined(projectType)) {
                    return defaultValue;
                }

                if (projectType === ProjectTypeEnum.Find) {
                    return {
                        ...defaultValue,
                        find: findSpecificFormSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Compare) {
                    return {
                        ...defaultValue,
                        compare: compareSpecificFormSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Completeness) {
                    return {
                        ...defaultValue,
                        completeness: completenessSpecificFormSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Validate) {
                    return {
                        ...defaultValue,
                        validate: validateSpecificFormSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.ValidateImage) {
                    return {
                        ...defaultValue,
                        validateImage: validateImageSpecificFormSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Street) {
                    return {
                        ...defaultValue,
                        street: streetSpecificFormSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Locate) {
                    return {
                        ...defaultValue,
                        locate: locateObjectSpecificFormSchema,
                    };
                }

                projectType satisfies never;

                return defaultValue;
            },
        },
    }),
};

export default projectUpdateFormSchema;

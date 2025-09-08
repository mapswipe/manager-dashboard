import { isNotDefined } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    ProjectTypeEnum,
    TutorialTaskCreateInput,
    TutorialTaskProjectTypeSpecificInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';
import {
    type PartialTutorialUpdateInputFields,
    type TutorialFormContext,
} from '#views/EditTutorial/schema';

import comparePropertyInputSchema from './ComparePropertyInput/schema';
import completenessPropertyInputSchema from './CompletenessPropertyInput/schema';
import findPropertyInputSchema from './FindPropertyInput/schema';
import streetPropertyInputSchema from './StreetPropertyInput/schema';
import validateImagePropertyInputSchema from './ValidateImagePropertyInput/schema';
import validatePropertyInputSchema from './ValidatePropertyInput/schema';

export type TaskInputFields = DeepNonNullable<TutorialTaskCreateInput>;
export type PartialTaskInputFields = PartialForm<TaskInputFields, 'clientId'>;
type TaskSchema = ObjectSchema<
    PartialTaskInputFields,
    PartialTutorialUpdateInputFields,
    TutorialFormContext
>;

type ProjectTypeSpecifics = DeepNonNullable<TutorialTaskProjectTypeSpecificInput>;
export type PartialProjectTypeSpecifics = PartialForm<ProjectTypeSpecifics>;
type ProjectTypeSpecificsSchema = ObjectSchema<
    PartialProjectTypeSpecifics,
    PartialTutorialUpdateInputFields,
    TutorialFormContext
>;

const taskSchema: TaskSchema = {
    fields: (_, __, context): ReturnType<TaskSchema['fields']> => ({
        clientId: {},
        reference: {},
        projectTypeSpecifics: {
            fields: (): ReturnType<ProjectTypeSpecificsSchema['fields']> => {
                const projectType = context?.projectType;

                if (isNotDefined(projectType)) {
                    return {
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                        street: { forceValue: undefinedValue },
                    };
                }

                if (projectType === ProjectTypeEnum.Find) {
                    return {
                        find: findPropertyInputSchema,
                        completeness: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                        street: { forceValue: undefinedValue },
                    };
                }

                if (projectType === ProjectTypeEnum.Compare) {
                    return {
                        compare: comparePropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                        street: { forceValue: undefinedValue },
                    };
                }

                if (projectType === ProjectTypeEnum.Completeness) {
                    return {
                        completeness: completenessPropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                        street: { forceValue: undefinedValue },
                    };
                }

                if (projectType === ProjectTypeEnum.Validate) {
                    return {
                        validate: validatePropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                        street: { forceValue: undefinedValue },
                    };
                }

                if (projectType === ProjectTypeEnum.ValidateImage) {
                    return {
                        validateImage: validateImagePropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        street: { forceValue: undefinedValue },
                    };
                }

                if (projectType === ProjectTypeEnum.Street) {
                    return {
                        street: { forceValue: streetPropertyInputSchema },
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                projectType satisfies never;

                return {
                    find: { forceValue: undefinedValue },
                    compare: { forceValue: undefinedValue },
                    completeness: { forceValue: undefinedValue },
                    validate: { forceValue: undefinedValue },
                    validateImage: { forceValue: undefinedValue },
                    street: { forceValue: undefinedValue },
                };
            },
        },
    }),
};

export default taskSchema;

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
                if (context?.projectType === ProjectTypeEnum.Find) {
                    return {
                        find: findPropertyInputSchema,
                        completeness: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Compare) {
                    return {
                        compare: comparePropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Completeness) {
                    return {
                        completeness: completenessPropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.Validate) {
                    return {
                        validate: validatePropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validateImage: { forceValue: undefinedValue },
                    };
                }

                if (context?.projectType === ProjectTypeEnum.ValidateImage) {
                    return {
                        validateImage: validateImagePropertyInputSchema,
                        find: { forceValue: undefinedValue },
                        compare: { forceValue: undefinedValue },
                        completeness: { forceValue: undefinedValue },
                        validate: { forceValue: undefinedValue },
                    };
                }

                return {
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

export default taskSchema;

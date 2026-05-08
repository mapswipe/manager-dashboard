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
import locateFeaturesPropertyInputSchema from './LocateFeaturesPropertyInput/schema';
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

type ProjectTypeSpecificFields = ReturnType<ProjectTypeSpecificsSchema['fields']>;

const taskSchema: TaskSchema = {
    fields: (_, __, context): ReturnType<TaskSchema['fields']> => ({
        clientId: {},
        reference: {},
        taskPartitionIndex: {},
        projectTypeSpecifics: {
            fields: (): ProjectTypeSpecificFields => {
                const projectType = context?.projectType;

                const defaultSchema = {
                    find: { forceValue: undefinedValue },
                    compare: { forceValue: undefinedValue },
                    completeness: { forceValue: undefinedValue },
                    validate: { forceValue: undefinedValue },
                    validateImage: { forceValue: undefinedValue },
                    street: { forceValue: undefinedValue },
                    locate: { forceValue: undefinedValue },
                } satisfies ProjectTypeSpecificFields;

                if (isNotDefined(projectType)) {
                    return defaultSchema;
                }

                if (projectType === ProjectTypeEnum.Find) {
                    return {
                        ...defaultSchema,
                        find: findPropertyInputSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Compare) {
                    return {
                        ...defaultSchema,
                        compare: comparePropertyInputSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Completeness) {
                    return {
                        ...defaultSchema,
                        completeness: completenessPropertyInputSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Validate) {
                    return {
                        ...defaultSchema,
                        validate: validatePropertyInputSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.ValidateImage) {
                    return {
                        ...defaultSchema,
                        validateImage: validateImagePropertyInputSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Street) {
                    return {
                        ...defaultSchema,
                        street: streetPropertyInputSchema,
                    };
                }

                if (projectType === ProjectTypeEnum.Locate) {
                    return {
                        ...defaultSchema,
                        locate: locateFeaturesPropertyInputSchema,
                    };
                }

                projectType satisfies never;

                return defaultSchema;
            },
        },
    }),
};

export default taskSchema;

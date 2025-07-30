import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import {
    ProjectTypeEnum,
    TutorialInformationPageInput,
    TutorialUpdateInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type TutorialFormContext = {
    projectType: ProjectTypeEnum | undefined,
} | undefined;

export type PartialTutorialCreateInputFields = PartialForm<
    DeepNonNullable<TutorialUpdateInput>,
    'clientId'
>;
export type TutorialUpdateFormSchema = ObjectSchema<
    PartialTutorialCreateInputFields,
    PartialTutorialCreateInputFields,
    TutorialFormContext
>;

type PartialTutorialInformationPageInputFields = PartialForm<
    DeepNonNullable<TutorialInformationPageInput>,
    'clientId'
>;
type TutorialInformationPageFormSchema = ObjectSchema<
    PartialTutorialInformationPageInputFields,
    PartialTutorialCreateInputFields,
    TutorialFormContext
>;

const tutorialUpdate: TutorialUpdateFormSchema = {
    fields: (): ReturnType<TutorialUpdateFormSchema['fields']> => ({
        clientId: {},
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        informationPages: {
            fields: (): ReturnType<TutorialInformationPageFormSchema['fields']> => ({
                delete: {
                    fields: () => ({
                        id: {
                            required: true,
                        },
                    }),
                },
            }),
        },
    }),
};

export default tutorialUpdate;

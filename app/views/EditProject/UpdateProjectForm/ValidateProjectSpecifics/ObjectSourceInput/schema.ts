import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    ObjectSchema,
    PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    ValidateObjectSourceConfig,
    ValidateObjectSourceConfigInput,
    ValidateObjectSourceTypeEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type ValidateSourceConfigKeys = Exclude<keyof ValidateObjectSourceConfig, 'sourceType'>;
export const objectSourceToSourceConfigKey: Record<
    ValidateObjectSourceTypeEnum,
    ValidateSourceConfigKeys
> = {
    [ValidateObjectSourceTypeEnum.AoiGeojsonFile]: 'aoiGeometry',
    [ValidateObjectSourceTypeEnum.TaskingManager]: 'taskingManagerProjectId',
    [ValidateObjectSourceTypeEnum.ObjectGeojsonUrl]: 'objectGeojsonUrl',
};

export type PartialValidateObjectSourceInputFields = PartialForm<
    DeepNonNullable<ValidateObjectSourceConfigInput>
>;
type ValidateSourceFormSchema = ObjectSchema<PartialValidateObjectSourceInputFields>;
type ValidateSourceInputFields = ReturnType<ValidateSourceFormSchema['fields']>;

export const defaultObjectSourceInputFormValue: PartialValidateObjectSourceInputFields = {
    sourceType: ValidateObjectSourceTypeEnum.AoiGeojsonFile,
    ohsomeFilter: 'building=* and geometry:polygon',
};

const objectSourceFormSchema: ValidateSourceFormSchema = {
    fields: (value): ValidateSourceInputFields => {
        const baseSchema: ValidateSourceInputFields = {
            sourceType: {
                required: true,
            },
        };

        const schema = addCondition(
            baseSchema,
            value,
            ['sourceType'],
            ['aoiGeometry', 'taskingManagerProjectId', 'objectGeojsonUrl', 'ohsomeFilter'],
            (): ValidateSourceInputFields => {
                const defaultValue: ValidateSourceInputFields = {
                    aoiGeometry: { forceValue: undefinedValue },
                    taskingManagerProjectId: { forceValue: undefinedValue },
                    objectGeojsonUrl: { forceValue: undefinedValue },
                    ohsomeFilter: { forceValue: undefinedValue },
                };

                if (isNotDefined(value)) {
                    return defaultValue;
                }

                const { sourceType } = value;

                if (isNotDefined(sourceType)) {
                    return defaultValue;
                }

                if (sourceType === ValidateObjectSourceTypeEnum.AoiGeojsonFile) {
                    return {
                        ...defaultValue,
                        aoiGeometry: {
                            required: true,
                        },
                        ohsomeFilter: {
                            required: true,
                        },
                    };
                }

                if (sourceType === ValidateObjectSourceTypeEnum.ObjectGeojsonUrl) {
                    return {
                        ...defaultValue,
                        objectGeojsonUrl: {
                            required: true,
                        },
                    };
                }

                if (sourceType === ValidateObjectSourceTypeEnum.TaskingManager) {
                    return {
                        ...defaultValue,
                        taskingManagerProjectId: {
                            required: true,
                        },
                        ohsomeFilter: {
                            required: true,
                        },
                    };
                }

                return {};
            },
        );

        return schema;
    },
};

export default objectSourceFormSchema;

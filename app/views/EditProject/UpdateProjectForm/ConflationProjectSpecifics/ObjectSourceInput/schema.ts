import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    ConflationObjectSourceConfig,
    ConflationObjectSourceConfigInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type ConflationSourceConfigKeys = Exclude<keyof ConflationObjectSourceConfig, 'sourceType'>;

export type PartialConflationObjectSourceInputFields = PartialForm<
    DeepNonNullable<ConflationObjectSourceConfigInput>
>;
type ConflationSourceFormSchema = ObjectSchema<PartialConflationObjectSourceInputFields>;
type ConflationSourceInputFields = ReturnType<ConflationSourceFormSchema['fields']>;

export const defaultObjectSourceInputFormValue: PartialConflationObjectSourceInputFields = {
    objectGeojsonUrl: '',
};

const objectSourceFormSchema: ConflationSourceFormSchema = {
    fields: (): ConflationSourceInputFields => {
        const schema: ConflationSourceInputFields = {
            objectGeojsonUrl: { required: true },
        };

        return schema;
    },
};

export default objectSourceFormSchema;

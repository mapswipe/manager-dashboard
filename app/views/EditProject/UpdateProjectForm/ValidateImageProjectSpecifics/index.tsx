import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import AssetInput from '#components/domain/AssetInput';

import { type PartialValidateImageSpecificFields } from './schema.ts';

interface Props {
    projectId: string;
    value: PartialValidateImageSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialValidateImageSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialValidateImageSpecificFields>) => void;
    disabled?: boolean;
}

function ValidateProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <AssetInput
            label="Annotations"
            projectId={projectId}
            name="annotationsFile"
            onChange={setFieldValue}
            value={value?.annotationsFile}
            error={error?.annotationsFile}
            disabled={disabled}
            withoutPreview
        />
    );
}

export default ValidateProjectSpecifics;

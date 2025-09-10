import { _cs } from '@togglecorp/fujs';
import {
    getErrorObject,
    ObjectError,
    removeNull,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import CustomOptionSelectInput from '#components/domain/CustomOptionSelectInput';
import TileOptionSelectInput from '#components/domain/TileOptionSelectInput';
import {
    ProjectTypeEnum,
    TutorialProjectDetailQuery,
} from '#generated/types/graphql';

import { PartialComparePropertyInputFields } from './ComparePropertyInput/schema';
import { PartialCompletenessPropertyInputFields } from './CompletenessPropertyInput/schema';
import { PartialFindPropertyInputFields } from './FindPropertyInput/schema';
import { PartialStreetPropertyInputFields } from './StreetPropertyInput/schema';
import { PartialValidateImagePropertyInputFields } from './ValidateImagePropertyInput/schema';
import { PartialValidatePropertyInputFields } from './ValidatePropertyInput/schema';
import ComparePropertyInput from './ComparePropertyInput';
import CompletenessPropertyInput from './CompletenessPropertyInput';
import FindPropertyInput from './FindPropertyInput';
import {
    PartialProjectTypeSpecifics,
    PartialTaskInputFields,
} from './schema';
import StreetPropertyInput from './StreetPropertyInput';
import ValidateImagePropertyInput from './ValidateImagePropertyInput';
import ValidatePropertyInput from './ValidatePropertyInput';

import styles from './styles.module.css';

interface Props {
    className?: string;
    index: number;
    value: PartialTaskInputFields;
    onChange: (
        value: SetValueArg<PartialTaskInputFields>,
        index: number,
    ) => void;
    error: ObjectError<PartialTaskInputFields> | undefined;
    disabled?: boolean;
    projectData: TutorialProjectDetailQuery['project'] | undefined;
}

function TaskInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        disabled,
        projectData,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    const setProjectSpecificFieldValue = useFormObject<'projectTypeSpecifics', PartialProjectTypeSpecifics>(
        'projectTypeSpecifics' as const,
        setFieldValue,
        {},
    );

    const setFindProjectSpecificsFieldValue = useFormObject<'find', PartialFindPropertyInputFields>(
        'find' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setCompareProjectSpecificsFieldValue = useFormObject<'compare', PartialComparePropertyInputFields>(
        'compare' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setCompletenessProjectSpecificsFieldValue = useFormObject<'completeness', PartialCompletenessPropertyInputFields>(
        'completeness' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setValidateProjectSpecificsFieldValue = useFormObject<'validate', PartialValidatePropertyInputFields>(
        'validate' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setValidateImageProjectSpecificsFieldValue = useFormObject<'validateImage', PartialValidateImagePropertyInputFields>(
        'validateImage' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setStreetProjectSpecificsFieldValue = useFormObject<'street', PartialStreetPropertyInputFields>(
        'street' as const,
        setProjectSpecificFieldValue,
        {},
    );

    return (
        <div className={_cs(styles.taskInput, className)}>
            <div className={styles.content}>
                <div>
                    {`#${index + 1}`}
                </div>
                {/* eslint-disable-next-line no-underscore-dangle */}
                {(projectData?.projectTypeSpecifics?.__typename === 'ValidateProjectPropertyType'
                    // eslint-disable-next-line no-underscore-dangle
                    || projectData?.projectTypeSpecifics?.__typename === 'ValidateImageProjectPropertyType')
                    ? (
                        <CustomOptionSelectInput
                            placeholder="Reference"
                            name="reference"
                            value={value.reference}
                            onChange={setFieldValue}
                            error={error?.reference}
                            disabled={disabled}
                            options={removeNull(projectData?.projectTypeSpecifics?.customOptions)}
                            nonClearable
                        />
                    ) : (
                        <TileOptionSelectInput
                            placeholder="Reference"
                            name="reference"
                            value={value.reference}
                            onChange={setFieldValue}
                            error={error?.reference}
                            disabled={disabled}
                            nonClearable
                        />
                    )}
                {projectData?.projectType === ProjectTypeEnum.Find && (
                    <FindPropertyInput
                        value={value.projectTypeSpecifics?.find}
                        setFieldValue={setFindProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.find}
                        disabled
                    />
                )}
                {projectData?.projectType === ProjectTypeEnum.Compare && (
                    <ComparePropertyInput
                        value={value.projectTypeSpecifics?.compare}
                        setFieldValue={setCompareProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.compare}
                        disabled
                    />
                )}
                {projectData?.projectType === ProjectTypeEnum.Completeness && (
                    <CompletenessPropertyInput
                        value={value.projectTypeSpecifics?.completeness}
                        setFieldValue={setCompletenessProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.completeness}
                        disabled
                    />
                )}
                {projectData?.projectType === ProjectTypeEnum.Validate && (
                    <ValidatePropertyInput
                        value={value.projectTypeSpecifics?.validate}
                        setFieldValue={setValidateProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validate}
                        disabled
                    />
                )}
                {projectData?.projectType === ProjectTypeEnum.ValidateImage && (
                    <ValidateImagePropertyInput
                        value={value.projectTypeSpecifics?.validateImage}
                        setFieldValue={setValidateImageProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validateImage}
                        disabled
                    />
                )}
                {projectData?.projectType === ProjectTypeEnum.Street && (
                    <StreetPropertyInput
                        value={value.projectTypeSpecifics?.street}
                        setFieldValue={setStreetProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.street}
                        disabled
                    />
                )}
            </div>
        </div>
    );
}

export default TaskInput;

import { _cs } from '@togglecorp/fujs';
import {
    getErrorObject,
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import NumberInput from '#components/NumberInput';
import { ProjectTypeEnum } from '#generated/types/graphql';

import { PartialValidatePropertyInputFields } from './ValidatePropertyInput/schema';
import ComparePropertyInput from './ComparePropertyInput';
import CompletenessPropertyInput from './CompletenessPropertyInput';
import FindPropertyInput from './FindPropertyInput';
import {
    PartialProjectTypeSpecifics,
    PartialTaskInputFields,
} from './schema';
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
    projectType: ProjectTypeEnum;
}

function TaskInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        disabled,
        projectType,
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

    const setFindProjectSpecificsFieldValue = useFormObject(
        'find' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setCompareProjectSpecificsFieldValue = useFormObject(
        'compare' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setCompletenessProjectSpecificsFieldValue = useFormObject(
        'completeness' as const,
        setProjectSpecificFieldValue,
        {},
    );

    const setValidateProjectSpecificsFieldValue = useFormObject<'validate', PartialValidatePropertyInputFields>(
        'validate' as const,
        setProjectSpecificFieldValue,
        {},
    );

    return (
        <div className={_cs(styles.taskInput, className)}>
            <div>
                {`#${index + 1}`}
            </div>
            <NumberInput
                icons="Reference:"
                name="reference"
                value={value.reference}
                onChange={setFieldValue}
                error={error?.reference}
                disabled={disabled}
            />
            {projectType === ProjectTypeEnum.Find && (
                <FindPropertyInput
                    value={value.projectTypeSpecifics?.find}
                    setFieldValue={setFindProjectSpecificsFieldValue}
                    error={getErrorObject(error?.projectTypeSpecifics)?.find}
                    disabled
                />
            )}
            {projectType === ProjectTypeEnum.Compare && (
                <ComparePropertyInput
                    value={value.projectTypeSpecifics?.compare}
                    setFieldValue={setCompareProjectSpecificsFieldValue}
                    error={getErrorObject(error?.projectTypeSpecifics)?.compare}
                    disabled
                />
            )}
            {projectType === ProjectTypeEnum.Completeness && (
                <CompletenessPropertyInput
                    value={value.projectTypeSpecifics?.completeness}
                    setFieldValue={setCompletenessProjectSpecificsFieldValue}
                    error={getErrorObject(error?.projectTypeSpecifics)?.completeness}
                    disabled
                />
            )}
            {projectType === ProjectTypeEnum.Validate && (
                <ValidatePropertyInput
                    value={value.projectTypeSpecifics?.validate}
                    setFieldValue={setValidateProjectSpecificsFieldValue}
                    error={getErrorObject(error?.projectTypeSpecifics)?.validate}
                    disabled
                />
            )}
            {/* FIXME: Implement ValidateImageProjectInput later */}
        </div>
    );
}

export default TaskInput;

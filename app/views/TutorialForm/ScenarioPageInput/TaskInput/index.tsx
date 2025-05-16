import { _cs } from '@togglecorp/fujs';
import {
    getErrorObject,
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import NumberInput from '#components/NumberInput';

import { PartialFindPropertyInputFields } from './FindPropertyInput/schema';
import FindPropertyInput from './FindPropertyInput';
import {
    PartialProjectTypeSpecifics,
    PartialTaskInputFields,
} from './schema';

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
}

function TaskInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        disabled,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    const setProjectSpecificFieldValue = useFormObject<'projectTypeSpecifics', PartialProjectTypeSpecifics>(
        'projectTypeSpecifics',
        setFieldValue,
        {},
    );

    const setFindProjectSpecificsFieldValue = useFormObject<'find', PartialFindPropertyInputFields>(
        'find',
        setProjectSpecificFieldValue,
        {},
    );

    return (
        <div className={_cs(styles.taskInput, className)}>
            <div>
                {`#${index + 1}`}
            </div>
            <NumberInput
                label="Reference"
                name="reference"
                value={value.reference}
                onChange={setFieldValue}
                error={error?.reference}
                disabled={disabled}
            />
            <FindPropertyInput
                className={styles.projectSpecificInput}
                value={value.projectTypeSpecifics?.find}
                setFieldValue={setFindProjectSpecificsFieldValue}
                error={getErrorObject(error?.projectTypeSpecifics)?.find}
                disabled={disabled}
            />
        </div>
    );
}

export default TaskInput;

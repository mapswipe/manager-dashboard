import { _cs } from '@togglecorp/fujs';
import {
    getErrorString,
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';

import { PartialTaskInputFields } from './schema';

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
    onRemove: (index: number) => void;
}

function TaskInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    return (
        <Container
            className={_cs(styles.taskInput, className)}
            heading={`Task - #${index + 1}`}
            headingLevel={5}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                >
                    Remove task
                </Button>
            )}
        >
            <NumberInput
                label="Reference"
                name="reference"
                value={value.reference}
                onChange={setFieldValue}
                error={error?.reference}
            />
            <TextArea
                label="Project type specifics"
                name="projectTypeSpecifics"
                value={value.projectTypeSpecifics}
                onChange={setFieldValue}
                error={getErrorString(error?.projectTypeSpecifics)}
            />
        </Container>
    );
}

export default TaskInput;

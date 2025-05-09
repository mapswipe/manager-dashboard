import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    getErrorObject,
    ObjectError,
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import EnumsContext from '#base/context/EnumsContext';
import Button from '#components/Button';
import Container from '#components/Container';
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import { PartialTaskInputFields } from './TaskInput/schema';
import { PartialScenarioPageInputFields } from './schema';
import TasksInput from './TaskInput';

import styles from './styles.module.css';

interface Props {
    className?: string;
    index: number;
    value: PartialScenarioPageInputFields;
    onChange: (
        value: SetValueArg<PartialScenarioPageInputFields>,
        index: number,
    ) => void;
    error: ObjectError<PartialScenarioPageInputFields> | undefined;
    onRemove: (index: number) => void;
}

function ScenarioPageInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
    } = props;

    const { TutorialScenarioIconEnum: iconOptions } = useContext(EnumsContext);

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    const {
        setValue: setTasksFieldValue,
        removeValue: removeTasks,
    } = useFormArray(
        'tasks' as const,
        setFieldValue,
    );

    const taskErrors = useMemo(
        () => getErrorObject(error?.tasks),
        [error?.tasks],
    );

    const addTasks = useCallback(
        () => {
            const newTasks: PartialTaskInputFields = {
                clientId: ulid(),
            };

            setFieldValue(
                (oldValue: PartialTaskInputFields[] | undefined) => (
                    [...(oldValue ?? []), newTasks]
                ),
                'tasks' as const,
            );
        },
        [setFieldValue],
    );

    return (
        <Container
            className={_cs(styles.scenarioPageInput, className)}
            heading={`Scenario page - #${index + 1}`}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                >
                    Remove scenario page
                </Button>
            )}
            contentClassName={styles.content}
        >
            <div className={styles.formFields}>
                <NumberInput
                    label="Scenario ID"
                    name="scenarioId"
                    value={value.scenarioId}
                    onChange={setFieldValue}
                    error={error?.scenarioId}
                />
                <div className={styles.metaInputs}>
                    <SelectInput
                        label="Hint icon"
                        name="hintIcon"
                        options={iconOptions}
                        value={value.hintIcon}
                        onChange={setFieldValue}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        error={error?.hintIcon}
                    />
                    <TextInput
                        label="Hint title"
                        name="hintTitle"
                        value={value.hintTitle}
                        onChange={setFieldValue}
                        error={error?.hintTitle}
                    />
                    <TextArea
                        className={styles.description}
                        name="hintDescription"
                        label="Hint description"
                        value={value.hintDescription}
                        onChange={setFieldValue}
                        error={error?.hintDescription}
                    />
                    <SelectInput
                        label="Instruction icon"
                        name="instructionsIcon"
                        options={iconOptions}
                        value={value.instructionsIcon}
                        onChange={setFieldValue}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        error={error?.instructionsIcon}
                    />
                    <TextInput
                        label="Instruction title"
                        name="instructionsTitle"
                        value={value.instructionsTitle}
                        onChange={setFieldValue}
                        error={error?.instructionsTitle}
                    />
                    <TextArea
                        className={styles.description}
                        name="instructionsDescription"
                        label="Instruction description"
                        value={value.instructionsDescription}
                        onChange={setFieldValue}
                        error={error?.instructionsDescription}
                    />
                    <SelectInput
                        label="Success icon"
                        name="successIcon"
                        options={iconOptions}
                        value={value.successIcon}
                        onChange={setFieldValue}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        error={error?.successIcon}
                    />
                    <TextInput
                        label="Success title"
                        name="successTitle"
                        value={value.successTitle}
                        onChange={setFieldValue}
                        error={error?.successTitle}
                    />
                    <TextArea
                        className={styles.description}
                        name="successDescription"
                        label="Success description"
                        value={value.successDescription}
                        onChange={setFieldValue}
                        error={error?.successDescription}
                    />
                </div>
                <Container
                    className={styles.tasks}
                    heading="Tasks"
                    headingLevel={4}
                    headerActions={(
                        <Button
                            name={undefined}
                            onClick={addTasks}
                            variant="tertiary"
                        >
                            Add new task
                        </Button>
                    )}
                    headerDescription={(
                        <NonFieldError
                            error={error?.tasks}
                        />
                    )}
                    isEmpty={isNotDefined(value.tasks) || value.tasks.length === 0}
                >
                    {value.tasks?.map((task, taskIndex) => (
                        <TasksInput
                            key={task.clientId}
                            index={taskIndex}
                            value={task}
                            onChange={setTasksFieldValue}
                            error={getErrorObject(taskErrors?.[task.clientId])}
                            onRemove={removeTasks}
                        />
                    ))}
                </Container>
            </div>
            <div className={styles.preview}>
                Preview not available!
            </div>
        </Container>
    );
}

export default ScenarioPageInput;

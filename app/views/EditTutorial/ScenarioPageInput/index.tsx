import { useMemo } from 'react';
import { IoTrashBin } from 'react-icons/io5';
import {
    _cs,
    isDefined,
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

import Button from '#components/Button';
import Container from '#components/Container';
import IconSelectInput from '#components/IconSelectInput';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import { TutorialProjectDetailQuery } from '#generated/types/graphql';

import CompareScenarioPreview from './CompareScenarioPreview';
import CompletenessScenarioPreview from './CompletenessScenarioPreview';
import FindScenarioPreview from './FindScenarioPreview';
import { PartialScenarioPageInputFields } from './schema';
import TaskInput from './TaskInput';
import ValidateScenarioPreview from './ValidateScenarioPreview';

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
    projectData: TutorialProjectDetailQuery['project'] | undefined;
    disabled?: boolean;
}

function ScenarioPageInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
        projectData,
        disabled,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    const {
        setValue: setTasksFieldValue,
    } = useFormArray(
        'tasks' as const,
        setFieldValue,
    );

    const taskErrors = useMemo(
        () => getErrorObject(error?.tasks),
        [error?.tasks],
    );

    return (
        <Container
            className={_cs(styles.scenarioPageInput, className)}
            heading={`Scenario #${index + 1}`}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="transparent"
                    colorVariant="danger"
                    start={<IoTrashBin />}
                    withoutPadding
                >
                    Remove
                </Button>
            )}
            withPadding
            spacing="lg"
            contentClassName={styles.content}
        >
            <ListLayout layout="block">
                <ListLayout
                    layout="grid"
                    numPreferredGridColumns={3}
                    minGridColumnSize="8rem"
                >
                    <IconSelectInput
                        label="Instruction icon"
                        name="instructionsIcon"
                        value={value.instructionsIcon}
                        onChange={setFieldValue}
                        error={error?.instructionsIcon}
                        nonClearable
                    />
                    <IconSelectInput
                        label="Hint icon"
                        name="hintIcon"
                        value={value.hintIcon}
                        onChange={setFieldValue}
                        error={error?.hintIcon}
                        disabled={disabled}
                        nonClearable
                    />
                    <IconSelectInput
                        label="Success icon"
                        name="successIcon"
                        value={value.successIcon}
                        onChange={setFieldValue}
                        error={error?.successIcon}
                        disabled={disabled}
                        nonClearable
                    />
                    <TextInput
                        label="Instruction title"
                        name="instructionsTitle"
                        value={value.instructionsTitle}
                        onChange={setFieldValue}
                        error={error?.instructionsTitle}
                        disabled={disabled}
                    />
                    <TextInput
                        label="Hint title"
                        name="hintTitle"
                        value={value.hintTitle}
                        onChange={setFieldValue}
                        error={error?.hintTitle}
                        disabled={disabled}
                    />
                    <TextInput
                        label="Success title"
                        name="successTitle"
                        value={value.successTitle}
                        onChange={setFieldValue}
                        error={error?.successTitle}
                        disabled={disabled}
                    />
                    <TextArea
                        name="instructionsDescription"
                        label="Instruction description"
                        value={value.instructionsDescription}
                        onChange={setFieldValue}
                        error={error?.instructionsDescription}
                        disabled={disabled}
                    />
                    <TextArea
                        name="hintDescription"
                        label="Hint description"
                        value={value.hintDescription}
                        onChange={setFieldValue}
                        error={error?.hintDescription}
                        disabled={disabled}
                    />
                    <TextArea
                        name="successDescription"
                        label="Success description"
                        value={value.successDescription}
                        onChange={setFieldValue}
                        error={error?.successDescription}
                        disabled={disabled}
                    />
                </ListLayout>
                {isDefined(projectData) && (
                    <Container
                        heading="Tasks"
                        headingLevel={4}
                        withHeaderBorder
                        headerDescription={(
                            <NonFieldError
                                error={error?.tasks}
                            />
                        )}
                        empty={isNotDefined(value.tasks) || value.tasks.length === 0}
                    >
                        {value.tasks?.map((task, taskIndex) => (
                            <TaskInput
                                key={task.clientId}
                                index={taskIndex}
                                value={task}
                                onChange={setTasksFieldValue}
                                error={getErrorObject(taskErrors?.[task.clientId])}
                                disabled={disabled}
                                projectType={projectData?.projectType}
                            />
                        ))}
                    </Container>
                )}
            </ListLayout>
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'FindProjectPropertyType' && (
                <FindScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    lookFor={projectData.lookFor}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'CompareProjectPropertyType' && (
                <CompareScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    tileServerBProperty={projectData.projectTypeSpecifics?.tileServerBProperty}
                    lookFor={projectData.lookFor}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'CompletenessProjectPropertyType' && (
                <CompletenessScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    overlayTileServerProperty={projectData
                        .projectTypeSpecifics?.overlayTileServerProperty}
                    lookFor={projectData.lookFor}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'ValidateProjectPropertyType' && (
                <ValidateScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    lookFor={projectData.lookFor}
                />
            )}
        </Container>
    );
}

export default ScenarioPageInput;

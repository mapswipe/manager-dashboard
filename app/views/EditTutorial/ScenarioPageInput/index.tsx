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
    removeNull,
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import CompareScenarioPreview from '#components/domain/CompareScenarioPreview';
import CompletenessScenarioPreview from '#components/domain/CompletenessScenarioPreview';
import FindScenarioPreview from '#components/domain/FindScenarioPreview';
import IconSelectInput from '#components/domain/IconSelectInput';
import StreetScenarioPreview from '#components/domain/StreetScenarioPreview';
import ValidateImageScenarioPreview from '#components/domain/ValidateImageScenarioPreview';
import ValidateScenarioPreview from '#components/domain/ValidateScenarioPreview';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import { TutorialProjectDetailQuery } from '#generated/types/graphql';

import { PartialScenarioPageInputFields } from './schema';
import TaskInput from './TaskInput';

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
            headingLevel={4}
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
            contentClassName={styles.content}
            withBackground
            withPadding
        >
            <ListLayout
                layout="block"
                spacing="lg"
            >
                <Container
                    heading="Help description"
                    headingLevel={5}
                    withWelledContent
                >
                    <ListLayout layout="grid" numPreferredGridColumns={3}>
                        <Container
                            heading="Instruction"
                            headingLevel={5}
                            contentLayout="block"
                            withBackground
                            withPadding
                            withShadow
                        >
                            <IconSelectInput
                                placeholder="Select an icon"
                                name="instructionsIcon"
                                value={value.instructionsIcon}
                                onChange={setFieldValue}
                                error={error?.instructionsIcon}
                                nonClearable
                            />
                            <TextInput
                                placeholder="Enter title"
                                name="instructionsTitle"
                                value={value.instructionsTitle}
                                onChange={setFieldValue}
                                error={error?.instructionsTitle}
                                disabled={disabled}
                            />
                            <TextArea
                                name="instructionsDescription"
                                placeholder="Enter description"
                                value={value.instructionsDescription}
                                onChange={setFieldValue}
                                error={error?.instructionsDescription}
                                disabled={disabled}
                                rows={3}
                            />
                        </Container>
                        <Container
                            heading="Hint"
                            headingLevel={5}
                            contentLayout="block"
                            withBackground
                            withPadding
                            withShadow
                        >
                            <IconSelectInput
                                placeholder="Select an icon"
                                name="hintIcon"
                                value={value.hintIcon}
                                onChange={setFieldValue}
                                error={error?.hintIcon}
                                disabled={disabled}
                                nonClearable
                            />
                            <TextInput
                                placeholder="Enter title"
                                name="hintTitle"
                                value={value.hintTitle}
                                onChange={setFieldValue}
                                error={error?.hintTitle}
                                disabled={disabled}
                            />
                            <TextArea
                                placeholder="Enter description"
                                name="hintDescription"
                                value={value.hintDescription}
                                onChange={setFieldValue}
                                error={error?.hintDescription}
                                disabled={disabled}
                                rows={3}
                            />
                        </Container>
                        <Container
                            heading="Success"
                            headingLevel={5}
                            contentLayout="block"
                            withBackground
                            withPadding
                            withShadow
                        >
                            <IconSelectInput
                                placeholder="Select an icon"
                                name="successIcon"
                                value={value.successIcon}
                                onChange={setFieldValue}
                                error={error?.successIcon}
                                disabled={disabled}
                                nonClearable
                            />
                            <TextInput
                                placeholder="Enter title"
                                name="successTitle"
                                value={value.successTitle}
                                onChange={setFieldValue}
                                error={error?.successTitle}
                                disabled={disabled}
                            />
                            <TextArea
                                name="successDescription"
                                placeholder="Enter description"
                                value={value.successDescription}
                                onChange={setFieldValue}
                                error={error?.successDescription}
                                disabled={disabled}
                                rows={3}
                            />
                        </Container>
                    </ListLayout>
                </Container>
                {isDefined(projectData) && (
                    <Container
                        heading="Tasks"
                        headingLevel={5}
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
                                projectData={projectData}
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
                    projectInstruction={projectData.projectInstruction}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'CompareProjectPropertyType' && (
                <CompareScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    tileServerBProperty={projectData.projectTypeSpecifics?.tileServerBProperty}
                    projectInstruction={projectData.projectInstruction}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'CompletenessProjectPropertyType' && (
                <CompletenessScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    overlayTileServerProperty={projectData
                        .projectTypeSpecifics?.overlayTileServerProperty}
                    projectInstruction={projectData.projectInstruction}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'ValidateProjectPropertyType' && (
                <ValidateScenarioPreview
                    scenario={value}
                    tileServerProperty={projectData.projectTypeSpecifics?.tileServerProperty}
                    projectInstruction={projectData.projectInstruction}
                    customOptions={removeNull(projectData.projectTypeSpecifics.customOptions)}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'ValidateImageProjectPropertyType' && (
                <ValidateImageScenarioPreview
                    scenario={value}
                    projectInstruction={projectData.projectInstruction}
                    customOptions={removeNull(projectData.projectTypeSpecifics.customOptions)}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.projectTypeSpecifics?.__typename === 'StreetProjectPropertyType' && (
                <StreetScenarioPreview
                    scenario={value}
                    projectInstruction={projectData.projectInstruction}
                    customOptions={removeNull(projectData.projectTypeSpecifics.customOptions)}
                />
            )}
        </Container>
    );
}

export default ScenarioPageInput;

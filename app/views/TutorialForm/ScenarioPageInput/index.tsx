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
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    TileServerNameEnum,
    TileServerPropertyFieldsFragment,
} from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
    tileServerUrls,
} from '#utils/common';
import {
    combinedIconList,
    IconItem,
    iconMap,
} from '#utils/icon';

import FindScenarioPreview from './FindScenarioPreview';
import { PartialScenarioPageInputFields } from './schema';
import TasksInput from './TaskInput';

import styles from './styles.module.css';

function iconOptionLabelSelector(iconOption: IconItem) {
    const Icon = iconOption.component;
    return (
        <InlineLayout
            start={<Icon />}
        >
            {iconOption.label}
        </InlineLayout>
    );
}

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
    lookForValue: string | undefined;
    tileServerProperty: TileServerPropertyFieldsFragment | undefined,
}

function ScenarioPageInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
        lookForValue,
        tileServerProperty,
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

    const InstructionsIcon = isDefined(value.instructionsIcon)
        ? iconMap[value.instructionsIcon]
        : null;
    const HintIcon = isDefined(value.hintIcon) ? iconMap[value.hintIcon] : null;
    const SuccessIcon = isDefined(value.successIcon) ? iconMap[value.successIcon] : null;

    const tileServerUrl = useMemo(() => {
        if (isNotDefined(tileServerProperty)) {
            return undefined;
        }

        if (tileServerProperty.name !== TileServerNameEnum.Custom) {
            return tileServerUrls[tileServerProperty?.name];
        }

        return tileServerProperty.custom?.url;
    }, [tileServerProperty]);

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
                <div className={styles.scenarioInputs}>
                    <SelectInput
                        label="Instruction icon"
                        name="instructionsIcon"
                        options={combinedIconList}
                        value={value.instructionsIcon}
                        onChange={setFieldValue}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        optionLabelSelector={iconOptionLabelSelector}
                        error={error?.instructionsIcon}
                        icons={InstructionsIcon && <InstructionsIcon />}
                    />
                    <TextInput
                        label="Instruction title"
                        name="instructionsTitle"
                        value={value.instructionsTitle}
                        onChange={setFieldValue}
                        error={error?.instructionsTitle}
                    />
                    <TextArea
                        name="instructionsDescription"
                        label="Instruction description"
                        value={value.instructionsDescription}
                        onChange={setFieldValue}
                        error={error?.instructionsDescription}
                    />
                    <SelectInput
                        icons={HintIcon && <HintIcon />}
                        label="Hint icon"
                        name="hintIcon"
                        options={combinedIconList}
                        value={value.hintIcon}
                        onChange={setFieldValue}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        optionLabelSelector={iconOptionLabelSelector}
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
                        name="hintDescription"
                        label="Hint description"
                        value={value.hintDescription}
                        onChange={setFieldValue}
                        error={error?.hintDescription}
                    />
                    <SelectInput
                        label="Success icon"
                        name="successIcon"
                        options={combinedIconList}
                        value={value.successIcon}
                        onChange={setFieldValue}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        optionLabelSelector={iconOptionLabelSelector}
                        error={error?.successIcon}
                        icons={SuccessIcon && <SuccessIcon />}
                    />
                    <TextInput
                        label="Success title"
                        name="successTitle"
                        value={value.successTitle}
                        onChange={setFieldValue}
                        error={error?.successTitle}
                    />
                    <TextArea
                        name="successDescription"
                        label="Success description"
                        value={value.successDescription}
                        onChange={setFieldValue}
                        error={error?.successDescription}
                    />
                </div>
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
                        <TasksInput
                            key={task.clientId}
                            index={taskIndex}
                            value={task}
                            onChange={setTasksFieldValue}
                            error={getErrorObject(taskErrors?.[task.clientId])}
                            disabled
                        />
                    ))}
                </Container>
            </ListLayout>
            <FindScenarioPreview
                scenario={value}
                url={tileServerUrl}
                lookFor={lookForValue}
            />
        </Container>
    );
}

export default ScenarioPageInput;

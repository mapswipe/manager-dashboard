import {
    useMemo,
    useState,
} from 'react';
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
import NonFieldError from '#components/NonFieldError';
import SegmentInput from '#components/SegmentInput';
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

import { FindTutorialProperties } from '../utils';
import BuildAreaGeoJsonPreview from './BuildAreaGeoJsonPreview';
import { PartialScenarioPageInputFields } from './schema';
import TasksInput from './TaskInput';

import styles from './styles.module.css';

type PreviewKey = 'instructions' | 'hint' | 'success';

interface PreviewOption {
    key: PreviewKey;
    label: string;
}
const previewOptions: PreviewOption[] = [
    { key: 'instructions', label: 'Instruction' },
    { key: 'hint', label: 'Hint' },
    { key: 'success', label: 'Success' },
];

function iconOptionLabelSelector(iconOption: IconItem) {
    const Icon = iconOption.component;
    return (
        <div className={styles.iconOptionLabel}>
            <Icon />
            {iconOption.label}
        </div>
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
    scenarioGeoJson?: GeoJSON.FeatureCollection<GeoJSON.Geometry, FindTutorialProperties>;
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
        scenarioGeoJson,
        lookForValue,
        tileServerProperty,
    } = props;

    const [currentPreview, setCurrentPreview] = useState<PreviewKey>('instructions');

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

    const previewPopupValue = useMemo(() => {
        if (currentPreview === 'instructions') {
            return {
                icon: value.instructionsIcon,
                title: value.instructionsTitle,
                description: value.instructionsDescription,
            };
        }

        if (currentPreview === 'hint') {
            return {
                icon: value.hintIcon,
                title: value.hintTitle,
                description: value.hintDescription,
            };
        }

        if (currentPreview === 'success') {
            return {
                icon: value.successIcon,
                title: value.successTitle,
                description: value.successDescription,
            };
        }

        return undefined;
    }, [value, currentPreview]);

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
                    variant="tertiary"
                    icons={<IoTrashBin />}
                >
                    Remove
                </Button>
            )}
            contentClassName={styles.content}
        >
            <div className={styles.formFields}>
                <div className={styles.metaInputs}>
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
                        className={styles.description}
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
                        className={styles.description}
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
                        className={styles.description}
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
                    isEmpty={isNotDefined(value.tasks) || value.tasks.length === 0}
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
            </div>
            <div className={styles.previewContainer}>
                <BuildAreaGeoJsonPreview
                    className={styles.preview}
                    previewPopUp={previewPopupValue}
                    geoJson={scenarioGeoJson}
                    url={tileServerUrl}
                    lookFor={lookForValue}
                />
                <SegmentInput
                    name={undefined}
                    value={currentPreview}
                    onChange={setCurrentPreview}
                    options={previewOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                />
            </div>
        </Container>
    );
}

export default ScenarioPageInput;

import {
    PiArrowCircleRightDuotone,
    PiSealCheckDuotone,
    PiSealWarningDuotone,
    PiTimer,
} from 'react-icons/pi';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Description from '#components/Description';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import { ProjectStatusEnum } from '#generated/types/graphql';

import styles from './styles.module.css';

type StatusTense = 'past' | 'present' | 'future';

interface StatusProps {
    label: React.ReactNode;
    description: React.ReactNode;
    statusTense: StatusTense;
    errored?: boolean;
}
function StatusItem(props: StatusProps) {
    const {
        label,
        statusTense,
        description,
        errored,
    } = props;

    return (
        <InlineLayout
            spacing="sm"
            className={_cs(
                styles.status,
                statusTense === 'past' && styles.past,
                statusTense === 'present' && styles.present,
                statusTense === 'future' && styles.future,
                errored && styles.errored,
            )}
            startContainerClassName={styles.startContainer}
            start={(
                <ListLayout
                    className={styles.tenseIcon}
                    layout="block"
                    spacing="sm"
                >
                    {statusTense === 'past' && !errored && <PiSealCheckDuotone className={styles.icon} />}
                    {statusTense === 'past' && errored && <PiSealWarningDuotone className={styles.icon} />}
                    {statusTense === 'present' && <PiArrowCircleRightDuotone className={styles.icon} />}
                    {statusTense === 'future' && <PiTimer className={styles.icon} />}
                    <div className={styles.line} />
                </ListLayout>
            )}
        >
            <ListLayout
                layout="block"
                className={styles.details}
                spacing="none"
            >
                <span className={styles.title}>
                    {label}
                </span>
                <Description compact>
                    {description}
                </Description>
            </ListLayout>
            <div className={styles.backdrop} />
        </InlineLayout>
    );
}

interface Props {
    value: ProjectStatusEnum | undefined;
}

interface ProjectStatusDetail {
    label: string,
    description: string,
}

const projectStatusDetails: Record<ProjectStatusEnum, ProjectStatusDetail> = {
    [ProjectStatusEnum.Draft]: {
        label: 'Draft',
        description: 'Update basic and project type specific details. You can update most of the fields during this phase.',
    },
    [ProjectStatusEnum.ReadyToProcess]: {
        label: 'Processing',
        description: 'Project is being processed to create tasks, groups and other necessary information, This might take a while depending on the inputs you\'ve provided',
    },
    [ProjectStatusEnum.ProcessingFailed]: {
        label: 'Processing failed!',
        description: 'There were somme issues while processing the project. This incident has been notified to the dev team! Please reach out on the MapSwipe slack for any further assistance',
    },
    [ProjectStatusEnum.Processed]: {
        label: 'Processed',
        description: 'The project has been processed successfully! Add a tutorial and you may proceed to publish the project',
    },
    [ProjectStatusEnum.Discarded]: {
        label: 'Discarded',
        description: 'Projects is discarded',
    },
    [ProjectStatusEnum.ReadyToPublish]: {
        label: 'Publishing',
        description: 'Project is currently being published to firebase. Once completed, users will be able to contribute to it',
    },
    [ProjectStatusEnum.PublishingFailed]: {
        label: 'Publishing failed!',
        description: 'There were some issue while publishing the project to the firebase! This incident has been notified to the dev team! Please reach out on the MapSwipe slack for any further assistance',
    },
    [ProjectStatusEnum.Published]: {
        label: 'Published',
        description: 'Project is published and available to the users for swipping',
    },
    [ProjectStatusEnum.Paused]: {
        label: 'Paused',
        description: 'Project it temporarily made unavailable to the users for swipping',
    },
    [ProjectStatusEnum.Withdrawn]: {
        label: 'Withdrawn',
        description: 'Project is archived and is no longer available to the users for swipping',
    },
    [ProjectStatusEnum.Finished]: {
        label: 'Finished',
        description: 'Project is completed',
    },
};

function ProjectStatusTimeline(props: Props) {
    const { value } = props;

    const {
        Draft,
        ReadyToProcess,
        ProcessingFailed,
        Processed,
        Discarded,
        ReadyToPublish,
        PublishingFailed,
        Published,
        Paused,
        Withdrawn,
        Finished,
    } = ProjectStatusEnum;

    const statusOrder = {
        [Draft]: 1,
        [ReadyToProcess]: 2,
        [ProcessingFailed]: 3,
        [Processed]: 4,
        [Discarded]: 5,
        [ReadyToPublish]: 6,
        [PublishingFailed]: 7,
        [Published]: 8,
        [Paused]: 9,
        [Withdrawn]: 10,
        [Finished]: 11,
    };

    function getStatusTense(status: ProjectStatusEnum | undefined): StatusTense {
        if (isNotDefined(status)) {
            if (isNotDefined(value)) {
                return 'present';
            }

            return 'past';
        }

        if (isNotDefined(value)) {
            return 'future';
        }

        const diff = statusOrder[status] - statusOrder[value];

        if (diff > 0) {
            return 'future';
        }

        if (diff < 0) {
            return 'past';
        }

        return 'present';
    }

    return (
        <ListLayout
            className={styles.projectStatusOutput}
            layout="block"
        >
            <StatusItem
                statusTense={getStatusTense(undefined)}
                label="Initialize"
                description="Get started with basic details of the project"
            />
            <StatusItem
                statusTense={getStatusTense(Draft)}
                label={projectStatusDetails[Draft].label}
                description={projectStatusDetails[Draft].description}
            />
            {value !== ProcessingFailed && (
                <StatusItem
                    statusTense={getStatusTense(ReadyToProcess)}
                    label={projectStatusDetails[ReadyToProcess].label}
                    description={projectStatusDetails[ReadyToProcess].description}
                />
            )}
            {value === ProcessingFailed && (
                <StatusItem
                    statusTense={getStatusTense(ProcessingFailed)}
                    label={projectStatusDetails[ProcessingFailed].label}
                    description={projectStatusDetails[ProcessingFailed].description}
                    errored
                />
            )}
            <StatusItem
                statusTense={getStatusTense(Processed)}
                label={projectStatusDetails[Processed].label}
                description={projectStatusDetails[Processed].description}
            />
            {value === Discarded && (
                <StatusItem
                    statusTense={getStatusTense(Discarded)}
                    label={projectStatusDetails[Discarded].label}
                    description={projectStatusDetails[Discarded].description}
                />
            )}
            <StatusItem
                statusTense={getStatusTense(ReadyToPublish)}
                label={projectStatusDetails[ReadyToPublish].label}
                description={projectStatusDetails[ReadyToPublish].description}
            />
            {value === PublishingFailed && (
                <StatusItem
                    statusTense={getStatusTense(PublishingFailed)}
                    label={projectStatusDetails[PublishingFailed].label}
                    description={projectStatusDetails[PublishingFailed].description}
                />
            )}
            <StatusItem
                statusTense={getStatusTense(Published)}
                label={projectStatusDetails[Published].label}
                description={projectStatusDetails[Published].description}
            />
            {value === Paused && (
                <StatusItem
                    statusTense={getStatusTense(Paused)}
                    label={projectStatusDetails[Paused].label}
                    description={projectStatusDetails[Paused].description}
                />
            )}
            {value === Withdrawn && (
                <StatusItem
                    statusTense={getStatusTense(Withdrawn)}
                    label={projectStatusDetails[Withdrawn].label}
                    description={projectStatusDetails[Withdrawn].description}
                />
            )}
            <StatusItem
                statusTense={getStatusTense(Finished)}
                label={projectStatusDetails[Finished].label}
                description={projectStatusDetails[Finished].description}
            />
        </ListLayout>
    );
}

export default ProjectStatusTimeline;

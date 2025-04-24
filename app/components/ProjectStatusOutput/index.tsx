import { useMemo } from 'react';
import {
    MdAdjust,
    MdCheckCircle,
} from 'react-icons/md';
import {
    _cs,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';

import { ProjectStatusEnum } from '#generated/types/graphql';

import styles from './styles.module.css';

interface StatusProps {
    label: React.ReactNode;
    description?: React.ReactNode;
    status: 'pending' | 'in-progress' | 'completed';
}
function Status(props: StatusProps) {
    const {
        label,
        status,
        description,
    } = props;

    return (
        <div
            className={_cs(
                styles.status,
                status === 'pending' && styles.pending,
                status === 'in-progress' && styles.inProgress,
                status === 'completed' && styles.completed,
            )}
        >
            <div className={styles.iconContainer}>
                {status === 'pending' && <MdAdjust className={styles.icon} />}
                {status === 'in-progress' && <MdAdjust className={styles.icon} />}
                {status === 'completed' && <MdCheckCircle className={styles.icon} />}
                <div className={styles.line} />
            </div>
            <div className={styles.details}>
                <div className={styles.label}>
                    {label}
                </div>
                {description && (
                    <div className={styles.description}>
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

interface Props {
    value: ProjectStatusEnum | undefined;
}

function ProjectStatusOutput(props: Props) {
    const { value } = props;
    interface ProjectStatusDetail {
        label: string,
        status: 'pending' | 'in-progress' | 'completed',
        description: string,
    }

    const projectStatuses = useMemo(() => {
        const baseStatus: Record<ProjectStatusEnum | 'START', ProjectStatusDetail> = {
            START: {
                label: 'Start',
                status: 'in-progress',
                description: 'Get started with basic details of the project',
            },
            [ProjectStatusEnum.Draft]: {
                label: 'Draft',
                status: 'pending',
                description: 'Add or update basic details or project type specific details. You can update most of the fields during this phase.',
            },
            [ProjectStatusEnum.MarkedAsReady]: {
                label: 'Processing',
                status: 'pending',
                description: 'Project is being processed',
            },
            [ProjectStatusEnum.Failed]: {
                label: 'Update required',
                status: 'pending',
                description: 'There are validation errors in the project',
            },
            [ProjectStatusEnum.Ready]: {
                label: 'Ready to Publish',
                status: 'pending',
                description: 'All of the processing is completed and the project is ready to be published',
            },
            [ProjectStatusEnum.Published]: {
                label: 'Published',
                status: 'pending',
                description: 'Project is published and available to the users for swipping',
            },
            [ProjectStatusEnum.Paused]: {
                label: 'Paused',
                status: 'pending',
                description: 'Project is published but not available to the users for swipping',
            },
            [ProjectStatusEnum.Archived]: {
                label: 'Archived',
                status: 'pending',
                description: 'Project is archived and is no longer available to the users for swipping',
            },
            [ProjectStatusEnum.Discarded]: {
                label: 'Discarded',
                status: 'pending',
                description: 'Projects is discarded',
            },
        };

        if (isNotDefined(value)) {
            const applicableStatus = {
                START: baseStatus.START,
                [ProjectStatusEnum.Draft]: baseStatus.DRAFT,
                [ProjectStatusEnum.MarkedAsReady]: baseStatus.MARKED_AS_READY,
                [ProjectStatusEnum.Ready]: baseStatus.READY,
                [ProjectStatusEnum.Published]: baseStatus.PUBLISHED,
            };

            return applicableStatus;
        }

        if (value === ProjectStatusEnum.Draft) {
            const applicableStatus = {
                START: baseStatus.START,
                [ProjectStatusEnum.Draft]: baseStatus.DRAFT,
                [ProjectStatusEnum.MarkedAsReady]: baseStatus.MARKED_AS_READY,
                [ProjectStatusEnum.Ready]: baseStatus.READY,
                [ProjectStatusEnum.Published]: baseStatus.PUBLISHED,
            };

            applicableStatus.START.status = 'completed';
            applicableStatus.DRAFT.status = 'in-progress';

            return applicableStatus;
        }

        if (value === ProjectStatusEnum.MarkedAsReady) {
            const applicableStatus = {
                START: baseStatus.START,
                [ProjectStatusEnum.Draft]: baseStatus.DRAFT,
                [ProjectStatusEnum.MarkedAsReady]: baseStatus.MARKED_AS_READY,
                [ProjectStatusEnum.Ready]: baseStatus.READY,
                [ProjectStatusEnum.Published]: baseStatus.PUBLISHED,
            };

            applicableStatus.START.status = 'completed';
            applicableStatus.DRAFT.status = 'completed';
            applicableStatus.MARKED_AS_READY.status = 'in-progress';

            return applicableStatus;
        }

        if (value === ProjectStatusEnum.Ready) {
            const applicableStatus = {
                START: baseStatus.START,
                [ProjectStatusEnum.Draft]: baseStatus.DRAFT,
                [ProjectStatusEnum.MarkedAsReady]: baseStatus.MARKED_AS_READY,
                [ProjectStatusEnum.Ready]: baseStatus.READY,
                [ProjectStatusEnum.Published]: baseStatus.PUBLISHED,
            };

            applicableStatus.START.status = 'completed';
            applicableStatus.DRAFT.status = 'completed';
            applicableStatus.MARKED_AS_READY.status = 'completed';
            applicableStatus.READY.status = 'in-progress';

            return applicableStatus;
        }

        if (value === ProjectStatusEnum.Failed) {
            const applicableStatus = {
                START: baseStatus.START,
                [ProjectStatusEnum.Draft]: baseStatus.DRAFT,
                [ProjectStatusEnum.MarkedAsReady]: baseStatus.MARKED_AS_READY,
                [ProjectStatusEnum.Failed]: baseStatus.FAILED,
            };

            applicableStatus.START.status = 'completed';
            applicableStatus.DRAFT.status = 'completed';
            applicableStatus.MARKED_AS_READY.status = 'completed';
            applicableStatus.FAILED.status = 'in-progress';

            return applicableStatus;
        }

        return baseStatus;
    }, [value]);

    const statusList = mapToList(
        projectStatuses,
        (item, key) => ({
            key,
            ...item,
        }),
    );

    if (isNotDefined(projectStatuses)) {
        return null;
    }

    return (
        <div className={styles.projectStatusOutput}>
            {statusList.map((statusItem) => (
                <Status
                    key={statusItem.key}
                    label={statusItem.label}
                    status={statusItem.status}
                    description={statusItem.description}
                />
            ))}
        </div>
    );
}

export default ProjectStatusOutput;

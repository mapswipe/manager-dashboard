import { useParams } from 'react-router';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import EmptyMessage from '#components/EmptyMessage';
import PageLayout from '#components/PageLayout';
import PendingMessage from '#components/PendingMessage';
import {
    ProjectStatusEnum,
    useProjectDetailsQuery,
} from '#generated/types/graphql';

import UpdateProcessedProjectForm from './UpdateProcessedProjectForm';
import UpdateProjectForm from './UpdateProjectForm';

interface Props {
    className?: string;
}

function EditProject(props: Props) {
    const { id: projectIdFromParams } = useParams<{ id: string }>();
    const { className } = props;

    const [{
        data: projectData,
        fetching: projectDataPending,
        error: projectDataError,
    }] = useProjectDetailsQuery({
        variables: { id: projectIdFromParams ?? '' },
        pause: isNotDefined(projectIdFromParams),
    });

    if (projectDataPending || isNotDefined(projectData) || isDefined(projectDataError)) {
        return (
            <PageLayout
                className={className}
                heading="Update project"
            >
                {projectDataPending && <PendingMessage />}
                {!projectDataPending && (
                    <EmptyMessage
                        title="Failed to load Project data"
                        description={projectDataError?.message ?? 'Unknown error occured!'}
                    />
                )}
            </PageLayout>
        );
    }

    const {
        project: {
            status,
        },
    } = projectData;

    if (status === ProjectStatusEnum.Draft
        || status === ProjectStatusEnum.MarkedAsReady
        || status === ProjectStatusEnum.Failed
    ) {
        return (
            <UpdateProjectForm
                className={className}
                projectData={projectData}
            />
        );
    }

    if (status === ProjectStatusEnum.Ready
        || status === ProjectStatusEnum.Published
        || status === ProjectStatusEnum.Archived
        || status === ProjectStatusEnum.Paused
        || status === ProjectStatusEnum.Discarded
    ) {
        return (
            <UpdateProcessedProjectForm
                className={className}
                projectData={projectData}
            />
        );
    }

    return null;
}

export default EditProject;

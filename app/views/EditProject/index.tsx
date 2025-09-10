import { useParams } from 'react-router';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Message from '#components/Message';
import PageLayout from '#components/PageLayout';
import PendingMessage from '#components/PendingMessage';
import {
    ProjectStatusEnum,
    useProjectDetailsQuery,
} from '#generated/types/graphql';

import UpdateProcessedProjectForm from './UpdateProcessedProjectForm';
import UpdateProjectForm from './UpdateProjectForm';

function EditProject() {
    const { id: projectIdFromParams } = useParams<{ id: string }>();

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
                heading="Update project"
            >
                {projectDataPending && <PendingMessage />}
                {!projectDataPending && (
                    <Message
                        empty
                        emptyMessage="Failed to load Project data"
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
        || status === ProjectStatusEnum.ReadyToProcess
        || status === ProjectStatusEnum.ProcessingFailed
    ) {
        return (
            <UpdateProjectForm projectData={projectData} />
        );
    }

    if (status === ProjectStatusEnum.Processed
        || status === ProjectStatusEnum.Published
        || status === ProjectStatusEnum.Withdrawn
        || status === ProjectStatusEnum.Paused
        || status === ProjectStatusEnum.Discarded
    ) {
        return (
            <UpdateProcessedProjectForm projectData={projectData} />
        );
    }

    return null;
}

export default EditProject;

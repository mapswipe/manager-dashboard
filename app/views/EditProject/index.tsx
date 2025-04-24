import { useParams } from 'react-router';
import { useQuery } from '@apollo/client';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import EmptyMessage from '#components/EmptyMessage';
import PageLayout from '#components/PageLayout';
import PendingMessage from '#components/PendingMessage';
import {
    ProjectDetailsQuery,
    ProjectDetailsQueryVariables,
    ProjectStatusEnum,
} from '#generated/types/graphql';

import { PROJECT_QUERY } from './query';
import UpdateProcessedProjectForm from './UpdateProcessedProjectForm';
import UpdateProjectForm from './UpdateProjectForm';

interface Props {
    className?: string;
}

function ProjectForm(props: Props) {
    const { id: projectIdFromParams } = useParams<{ id: string }>();
    const { className } = props;

    const {
        data: projectData,
        loading: projectDataPending,
        error: projectDataError,
    } = useQuery<ProjectDetailsQuery, ProjectDetailsQueryVariables>(
        PROJECT_QUERY,
        {
            variables: { id: projectIdFromParams ?? '' },
            skip: isNotDefined(projectIdFromParams),
        },
    );

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
}

export default ProjectForm;

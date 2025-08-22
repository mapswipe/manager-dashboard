import { isNotDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import Container from '#components/Container';
import { useProjectSpecificDetailsQuery } from '#generated/types/graphql';
import { PROJECT_TYPE_SPECIFIC_FRAGMENT } from '#utils/query';

import CompareDetails from './CompareDetails';
import CompletenessDetails from './CompletenessDetails';
import FindDetails from './FindDetails';
import ValidateDetails from './ValidateDetails';
import ValidateImageDetails from './ValidateImageDetails';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_SPECIFIC_DETAILS_QUERY = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
query ProjectSpecificDetails($id: ID!) {
    project(id: $id) {
        id
        projectType
        projectTypeSpecifics {
            ...ProjectTypeSpecificFields
        }
    }
}

${PROJECT_TYPE_SPECIFIC_FRAGMENT}
`;

interface Props {
    projectId: string;
}

function ProjectSpecificDetails(props: Props) {
    const { projectId } = props;

    const [{
        data: projectData,
        fetching: projectDataPending,
        error: projectDataError,
    }] = useProjectSpecificDetailsQuery({
        variables: { id: projectId ?? '' },
        pause: isNotDefined(projectId),
    });

    if (isNotDefined(projectData?.project.projectTypeSpecifics)) {
        return null;
    }

    return (
        <Container
            errored={!!projectDataError}
            errorMessage={projectDataError?.message}
            pending={projectDataPending}
            heading={`${projectData.project.projectType.replace('_', ' ')} specific details`}
            headingLevel={4}
            withHeaderBorder
        >
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'FindProjectPropertyType' && (
                <FindDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'CompareProjectPropertyType' && (
                <CompareDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'CompletenessProjectPropertyType' && (
                <CompletenessDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'ValidateProjectPropertyType' && (
                <ValidateDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'ValidateImageProjectPropertyType' && (
                <ValidateImageDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
        </Container>
    );
}

export default ProjectSpecificDetails;

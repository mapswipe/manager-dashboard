import { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import Container, { ContainerProps } from '#components/Container';
import { useProjectSpecificDetailsQuery } from '#generated/types/graphql';
import { PROJECT_TYPE_SPECIFIC_FRAGMENT } from '#utils/query';
import { SpacingType } from '#utils/styles';

import ProjectTypeOutput from '../ProjectTypeOutput';
import CompareDetails from './CompareDetails';
import CompletenessDetails from './CompletenessDetails';
import FindDetails from './FindDetails';
import LocateObjectDetails from './LocateObject';
import StreetDetails from './StreetDetails';
import ValidateDetails from './ValidateDetails';
import ValidateImageDetails from './ValidateImageDetails';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_SPECIFIC_DETAILS_QUERY = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
query ProjectSpecificDetails($id: ID!) {
    project(id: $id) {
        id
        projectType
        aoiGeometry {
            id
            totalArea
            bbox
        }
        projectTypeSpecifics {
            ...ProjectTypeSpecificFields
        }
    }
}

${PROJECT_TYPE_SPECIFIC_FRAGMENT}
`;

interface Props {
    projectId: string;
    headingLevel?: ContainerProps['headingLevel'];
    withContentBackgroundAndPadding?: boolean;
    withWelledContent?: boolean;
    withHeaderBorder?: boolean;
    spacing?: SpacingType;
}

function ProjectSpecificDetails(props: Props) {
    const {
        projectId,
        headingLevel = 4,
        withContentBackgroundAndPadding,
        withHeaderBorder,
        spacing,
        withWelledContent,
    } = props;

    const [{
        data: projectData,
        fetching: projectDataPending,
        error: projectDataError,
    }] = useProjectSpecificDetailsQuery({
        variables: { id: projectId ?? '' },
        pause: isNotDefined(projectId),
    });

    const defaultBounds = useMemo(
        (): GeoJSON.Polygon | undefined => {
            const coordinates = projectData?.project.aoiGeometry?.bbox;
            if (isNotDefined(coordinates)) {
                return undefined;
            }
            return {
                type: 'Polygon',
                coordinates,
            };
        },
        [projectData],
    );

    if (isNotDefined(projectData?.project.projectTypeSpecifics)) {
        return null;
    }

    return (
        <Container
            errored={!!projectDataError}
            errorMessage={projectDataError?.message}
            pending={projectDataPending}
            heading={<ProjectTypeOutput value={projectData.project.projectType} />}
            headingLevel={headingLevel}
            withHeaderBorder={withHeaderBorder}
            withContentBackgroundAndPadding={withContentBackgroundAndPadding}
            spacing={spacing}
            withWelledContent={withWelledContent}
        >
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'FindProjectPropertyType' && (
                <FindDetails
                    defaultBounds={defaultBounds}
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'CompareProjectPropertyType' && (
                <CompareDetails
                    defaultBounds={defaultBounds}
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'CompletenessProjectPropertyType' && (
                <CompletenessDetails
                    defaultBounds={defaultBounds}
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'ValidateProjectPropertyType' && (
                <ValidateDetails
                    defaultBounds={defaultBounds}
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'ValidateImageProjectPropertyType' && (
                <ValidateImageDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'StreetProjectPropertyType' && (
                <StreetDetails
                    data={projectData.project.projectTypeSpecifics}
                />
            )}
            {/* eslint-disable-next-line no-underscore-dangle */}
            {projectData?.project.projectTypeSpecifics?.__typename === 'LocateProjectPropertyType' && (
                <LocateObjectDetails
                    data={projectData.project.projectTypeSpecifics}
                    defaultBounds={defaultBounds}
                />
            )}
        </Container>
    );
}

export default ProjectSpecificDetails;

import { gql } from '@apollo/client';

import { PROJECT_TYPE_SPECIFIC_FRAGMENT } from '#utils/query';

export const PROJECT_STATUS_QUERY = gql`
query ProjectStatus($projectId: ID!) {
    project(id: $projectId) {
        id
        status
    }
}
`;

// FIXME: Check why fragment does not work here
export const UPDATE_PROJECT_MUTATION = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
mutation UpdateProject($id: ID!, $data: ProjectUpdateInput!) {
    updateProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            errors
            ok
            result {
                additionalInfoUrl
                clientId
                description
                groupSize
                id
                isFeatured
                lookFor
                maxTasksPerUser
                name
                processingStatus
                progress
                projectType
                image {
                    id
                    file {
                        url
                    }
                }
                projectTypeSpecifics {
                    ...ProjectTypeSpecificFields
                }
                requestingOrganization {
                    id
                    name
                }
                tutorial {
                    id
                    name
                }
                status
                verificationNumber
            }
        }
    }
}
`;

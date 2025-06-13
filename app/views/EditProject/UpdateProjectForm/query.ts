import { gql } from 'urql';

import {
    OPERATION_INFO_FRAGMENT,
    PROJECT_TYPE_SPECIFIC_FRAGMENT,
} from '#utils/query';

export const PROJECT_STATUS_QUERY = gql`
query ProjectStatus($projectId: ID!) {
    project(id: $projectId) {
        id
        status
    }
}
`;

export const UPDATE_PROJECT_MUTATION = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
${OPERATION_INFO_FRAGMENT}
mutation UpdateProject($id: ID!, $data: ProjectUpdateInput!) {
    updateProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            __typename
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
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

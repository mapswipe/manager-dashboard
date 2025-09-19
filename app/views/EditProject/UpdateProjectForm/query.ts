import { gql } from 'urql';

import {
    OPERATION_INFO_FRAGMENT,
    PROJECT_DETAILS_FRAGMENT,
} from '#utils/query';

export const PROJECT_STATUS_QUERY = gql`
query ProjectStatus($projectId: ID!) {
    project(id: $projectId) {
        id
        status
        statusMessage
        processingStatus
    }
}
`;

export const UPDATE_PROJECT_MUTATION = gql`
${PROJECT_DETAILS_FRAGMENT}
${OPERATION_INFO_FRAGMENT}
mutation UpdateProject($id: ID!, $data: ProjectUpdateInput!) {
    updateProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                ...ProjectDetailFields
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

export const UPDATE_STATUS_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation UpdateProjectStatus($id: ID!, $data: ProjectStatusUpdateInput!) {
    updateProjectStatus(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                clientId
                id
                status
                statusMessage
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

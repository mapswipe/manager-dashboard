import { gql } from 'urql';

import {
    OPERATION_INFO_FRAGMENT,
    PROJECT_TYPE_SPECIFIC_FRAGMENT,
    TUTORIAL_DETAILS_FRAGMENT,
} from '#utils/query';

export const TUTORIAL_QUERY = gql`
${TUTORIAL_DETAILS_FRAGMENT}
query TutorialDetails($id: ID!) {
    tutorial(id: $id) {
        ...TutorialDetailFields
    }
}
`;

export const PROJECT_ASSETS_QUERY = gql`
query ProjectOutputAssets($projectId: ID!, $pagination: OffsetPaginationInput!) {
    projectAssets(
        pagination: $pagination
        filters: {projectId: {exact: $projectId}, type: {exact: OUTPUT}}
    ) {
        results {
            file {
                url
                name
            }
            id
            projectId
            type
            mimetype
        }
    }
}
`;

export const PROJECT_DETAIL_QUERY = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
query TutorialProjectDetail($projectId: ID!) {
    project(id: $projectId) {
        id
        lookFor
        projectInstruction
        name
        projectType
        requestingOrganization {
            id
            name
        }
        status
        projectTypeSpecifics {
            ...ProjectTypeSpecificFields
        }
        groupSize
        maxTasksPerUser
    }
}
`;

export const UPDATE_TUTORIAL_MUTATION = gql`
${TUTORIAL_DETAILS_FRAGMENT}
${OPERATION_INFO_FRAGMENT}
mutation UpdateTutorial($id: ID!, $data: TutorialUpdateInput!) {
    updateTutorial(pk: $id, data: $data) {
        ... on TutorialTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                ...TutorialDetailFields
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

export const UPDATE_TUTORIAL_STATUS_MUTATION = gql`
mutation UpdateTutorialStatus($id: ID!, $data: TutorialStatusUpdateInput!) {
    updateTutorialStatus(data: $data, pk: $id) {
        ... on TutorialTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
                clientId
                status
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

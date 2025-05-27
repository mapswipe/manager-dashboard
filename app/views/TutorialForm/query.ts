import { gql } from '@apollo/client';

export const TUTORIAL_QUERY = gql`
query TutorialDetails($id: ID!) {
    tutorial(id: $id) {
        id
        name
        clientId
        status
        informationPages {
            id
            clientId
            pageNumber
            title
            tutorialId
            blocks {
                id
                clientId
                blockNumber
                blockType
                pageId
                text
                image {
                    url
                    size
                    path
                    name
                    height
                    width
                }
            }
        }
        projectId
        scenarios {
            id
            clientId
            hintDescription
            hintIcon
            hintTitle
            instructionsDescription
            instructionsIcon
            instructionsTitle
            scenarioPageNumber
            successDescription
            successIcon
            successTitle
            tutorialId
            tasks {
                id
                clientId
                reference
                scenarioId
            }
        }
    }
}
`;

export const PROJECT_OPTION_QUERY = gql`
query ProjectOptions {
    projects {
        results {
            id
            name
        }
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
                size
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
query TutorialProjectDetail($projectId: ID!) {
    project(id: $projectId) {
        id
        lookFor
        name
        projectType
        requestingOrganization {
            id
            name
        }
        status
        projectTypeSpecifics {
            ... on CompareProjectPropertyType {
                __typename
                zoomLevel
                tileServerProperty {
                    name
                }
                tileServerBProperty {
                    name
                }
            }
            ... on CompletenessProjectPropertyType {
                __typename
                zoomLevel
                tileServerProperty {
                    name
                }
                tileServerBProperty {
                    name
                }
            }
            ... on FindProjectPropertyType {
                __typename
                zoomLevel
                tileServerProperty {
                    name
                }
            }
            ... on ValidateProjectPropertyType {
                __typename
                tileServerProperty {
                    name
                }
            }
        }
        groupSize
        maxTasksPerUser
    }
}
`;

export const CREATE_TUTORIAL_MUTATION = gql`
mutation NewTutorial($data: TutorialCreateInput!) {
    createTutorial(data: $data) {
        ... on TutorialTypeMutationResponseType {
            errors
            ok
            result {
                id
            }
        }
    }
}
`;

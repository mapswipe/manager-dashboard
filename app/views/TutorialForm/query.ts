import { gql } from '@apollo/client';

import { PROJECT_TYPE_SPECIFIC_FRAGMENT } from '#utils/query';

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
                projectTypeSpecifics {
                    ... on FindTutorialTaskPropertyType {
                        __typename
                        tileX
                        tileY
                        tileZ
                    }
                }
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
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
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
            ...ProjectTypeSpecificFields
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

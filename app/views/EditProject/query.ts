import { gql } from '@apollo/client';

import { PROJECT_TYPE_SPECIFIC_FRAGMENT } from '#utils/query';

// eslint-disable-next-line import/prefer-default-export
export const PROJECT_QUERY = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
query ProjectDetails($id: ID!) {
    project(id: $id) {
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
`;

import { gql } from 'urql';

import { PROJECT_DETAILS_FRAGMENT } from '#utils/query';

// eslint-disable-next-line import/prefer-default-export
export const PROJECT_QUERY = gql`
${PROJECT_DETAILS_FRAGMENT}
query ProjectDetails($id: ID!) {
    project(id: $id) {
        ...ProjectDetailFields
    }
    defaultValidateCustomOptions: defaultCustomOptions(projectType: VALIDATE) {
        description
        icon
        iconColor
        title
        value
    }
    defaultValidateImageCustomOptions: defaultCustomOptions(projectType: VALIDATE_IMAGE) {
        description
        icon
        iconColor
        title
        value
    }
}
`;

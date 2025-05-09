import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    OffsetPaginationInput,
    OrganizationListQuery,
    OrganizationListQueryVariables,
} from '#generated/types/graphql';

const ORGANIZATION_LIST_QUERY = gql`
query OrganizationList($pagination: OffsetPaginationInput!) {
    organizations(pagination: $pagination) {
        totalCount
        results {
            name
            id
        }
    }
}
`;

function useOrganizationListQuery(pagination: OffsetPaginationInput) {
    const response = useQuery<OrganizationListQuery, OrganizationListQueryVariables>(
        ORGANIZATION_LIST_QUERY,
        {
            variables: {
                pagination,
            },
        },
    );

    return response;
}

export default useOrganizationListQuery;

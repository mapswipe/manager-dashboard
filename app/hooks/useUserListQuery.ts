import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    OffsetPaginationInput,
    UserListQuery,
    UserListQueryVariables,
} from '#generated/types/graphql';

const USER_LIST_QUERY = gql`
query UserList($pagination: OffsetPaginationInput!) {
    users(pagination: $pagination) {
        totalCount
        results {
            displayName
            id
        }
    }
}
`;

function useUserListQuery(pagination: OffsetPaginationInput) {
    const response = useQuery<UserListQuery, UserListQueryVariables>(
        USER_LIST_QUERY,
        {
            variables: {
                pagination,
            },
        },
    );

    return response;
}

export default useUserListQuery;

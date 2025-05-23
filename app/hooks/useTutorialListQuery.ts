import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    OffsetPaginationInput,
    TutorialListQuery,
    TutorialListQueryVariables,
} from '#generated/types/graphql';

const TUTORIAL_LIST_QUERY = gql`
query TutorialList($pagination: OffsetPaginationInput!) {
    tutorials(pagination: $pagination) {
        totalCount
        results {
            name
            id
        }
    }
}
`;

function useTutorialListQuery(pagination: OffsetPaginationInput) {
    const response = useQuery<TutorialListQuery, TutorialListQueryVariables>(
        TUTORIAL_LIST_QUERY,
        {
            variables: {
                pagination,
            },
        },
    );

    return response;
}

export default useTutorialListQuery;

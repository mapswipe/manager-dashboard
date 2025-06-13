import { useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import { gql } from 'urql';

import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import Pager from '#components/Pager';
import { useUserListQuery } from '#generated/types/graphql';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

interface Props {
    className?: string;
}

function UserList(props: Props) {
    const { className } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const [{
        data: userListResponse,
        fetching: userListPending,
    }] = useUserListQuery({
        variables: {
            pagination: {
                offset: (activePage - 1) * pagePerItem,
                limit: pagePerItem,
            },
        },
    });

    const userList = userListResponse?.users.results ?? [];
    const totalItems = userListResponse?.users.totalCount ?? 0;

    return (
        <Container
            className={className}
            heading="Users"
            headingLevel={2}
            pending={userListPending}
            empty={userList.length === 0}
            withHeaderBorder
            withFooterBorder
            withPadding
            withBackground
            withShadow
            spacing="lg"
            footerActions={(
                <Pager
                    pagePerItem={pagePerItem}
                    onPagePerItemChange={setPagePerItem}
                    activePage={activePage}
                    onActivePageChange={setActivePage}
                    totalItems={totalItems}
                    pagePerItemOptions={defaultPagePerItemOptions}
                />
            )}
        >
            {userList.map((user) => (
                <InlineLayout
                    key={user.id}
                    start={<IoPerson />}
                >
                    {user.displayName}
                </InlineLayout>
            ))}
        </Container>
    );
}

export default UserList;

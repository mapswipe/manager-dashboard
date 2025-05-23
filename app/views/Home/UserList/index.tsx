import { useState } from 'react';
import { CgUser } from 'react-icons/cg';

import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import Pager from '#components/Pager';
import useUserListQuery from '#hooks/useUserListQuery';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

interface Props {
    className?: string;
}

function UserList(props: Props) {
    const { className } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const {
        previousData: previousUserListResponse,
        data: userListResponse = previousUserListResponse,
        loading: userListPending,
    } = useUserListQuery({
        offset: (activePage - 1) * pagePerItem,
        limit: pagePerItem,
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
                    start={<CgUser />}
                >
                    {user.displayName}
                </InlineLayout>
            ))}
        </Container>
    );
}

export default UserList;

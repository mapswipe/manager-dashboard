import { useState } from 'react';
import {
    PiEnvelope,
    PiUserBold,
} from 'react-icons/pi';
import { gql } from 'urql';

import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
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
            anonymizedEmail
            displayName
            id
        }
    }
}
`;

interface Props {
    className?: string;
}

function ManagerList(props: Props) {
    const { className } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);

    const [{
        data: userListResponse,
        fetching: userListPending,
    }] = useUserListQuery({
        variables: {
            pagination: {
                offset: (activePage - 1) * DEFAULT_PAGE_SIZE,
                limit: DEFAULT_PAGE_SIZE,
            },
        },
    });

    const userList = userListResponse?.users.results ?? [];
    const totalItems = userListResponse?.users.totalCount ?? 0;

    return (
        <Container
            className={className}
            heading="Managers"
            headingLevel={2}
            pending={userListPending}
            empty={userList.length === 0}
            spacing="lg"
            footerActions={(
                <Pager
                    pagePerItem={DEFAULT_PAGE_SIZE}
                    activePage={activePage}
                    onActivePageChange={setActivePage}
                    totalItems={totalItems}
                    pagePerItemOptions={defaultPagePerItemOptions}
                />
            )}
        >
            <ListLayout
                layout="grid"
                numPreferredGridColumns={3}
            >
                {userList.map((user) => (
                    <Container
                        key={user.id}
                        headerIcons={<PiUserBold />}
                        heading={user.displayName}
                        withBackground
                        withPadding
                        withShadow
                        headingLevel={5}
                    >
                        <InlineLayout
                            start={<PiEnvelope />}
                            withCenterAlign
                            spacingOffset={-1}
                        >
                            {user.anonymizedEmail}
                        </InlineLayout>
                    </Container>
                ))}
            </ListLayout>
        </Container>
    );
}

export default ManagerList;

import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { gql } from 'urql';

import Button from '#components/Button';
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import Pager from '#components/Pager';
import Table, { Column } from '#components/Table';
import TextOutput from '#components/TextOutput';
import {
    UserGroupMemberListQuery,
    useUserGroupMemberListQuery,
} from '#generated/types/graphql';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const USER_GROUP_MEMBER_LIST_QUERY = gql`
query UserGroupMemberList($filters: ContributorUserGroupMembershipFilter, $pagination: OffsetPaginationInput) {
    contributorUserGroupMembers(
        pagination: $pagination,
        filters: $filters
    ) {
        results {
            id
            user {
                id
                userId
                username
            }
            userId
        }      
        totalCount
    }
}
`;

type UserMemberTye = UserGroupMemberListQuery['contributorUserGroupMembers']['results'][number];

interface Props {
    id: string;
    name: string;
    description: string;
    membersCount: number;
    onEdit: (id: string) => void;
}

const keySelector = (item: UserMemberTye) => item.user.id;

function UserListItem(props: Props) {
    const {
        id,
        name,
        description,
        membersCount,
        onEdit,
    } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);
    const [expanded, setExpanded] = useState(false);

    const [{
        data: userMemberResponse,
        fetching: pending,
    }] = useUserGroupMemberListQuery({
        pause: !expanded,
        variables: {
            filters: {
                userGroupId: {
                    exact: id,
                },
            },
            pagination: {
                offset: (activePage - 1) * pagePerItem,
                limit: pagePerItem,
            },
        },
    });

    const columns: Column<UserMemberTye>[] = [
        {
            id: 'username',
            title: 'User Name',
            cellRenderer: (item) => item.user.username,
        },
        {
            id: 'userId',
            title: 'User Id',
            cellRenderer: (item) => item.user.userId,
        },
    ];

    return (
        <ExpandableContainer
            onExpandedChange={setExpanded}
            actions={(
                <Button
                    name={id}
                    onClick={onEdit}
                    colorVariant="accent"
                    styleVariant="transparent"
                    withoutPadding
                >
                    <FaEdit />
                </Button>
            )}
            header={(
                <ListLayout
                    layout="grid"
                    numPreferredGridColumns={4}
                    minGridColumnSize="9rem"
                    spacing="lg"
                >
                    <GridLayoutItem columnSpan={4}>
                        <Container
                            heading={name}
                            headingLevel={3}
                        >
                            <ListLayout withWrap>
                                <TextOutput
                                    label="Member Count"
                                    value={membersCount}
                                />
                                <TextOutput
                                    label="Description"
                                    value={description}
                                />
                            </ListLayout>
                        </Container>
                    </GridLayoutItem>
                </ListLayout>
            )}
            expanded={expanded}
        >
            <Container
                contentLayout="block"
                spacing="lg"
                pending={pending}
                empty={userMemberResponse?.contributorUserGroupMembers?.totalCount === 0}
                emptyMessage="No User Member found!"
                filteredEmptyMessage="No matching user member found!"
                footerActions={(
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={userMemberResponse?.contributorUserGroupMembers.totalCount ?? 0}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            >
                <Table
                    keySelector={keySelector}
                    columns={columns}
                    data={userMemberResponse?.contributorUserGroupMembers?.results}
                />
            </Container>
        </ExpandableContainer>
    );
}

export default UserListItem;

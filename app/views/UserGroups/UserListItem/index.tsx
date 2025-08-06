import {
    useCallback,
    useState,
} from 'react';
import { FaEdit } from 'react-icons/fa';
import { IoArchive } from 'react-icons/io5';
import { gql } from 'urql';

import Button from '#components/Button';
import ExpandableContainer from '#components/ExpandableContainer';
import OverflowMenu from '#components/OverflowMenu';
import Pager from '#components/Pager';
import Table, { Column } from '#components/Table';
import {
    UserGroupMemberListQuery,
    useUpdateUserGroupMutation,
    useUserGroupMemberListQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
} from '#utils/error';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';

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
                firebaseId
                username
            }
        }
        totalCount
    }
}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const USER_GROUP_UPDATE_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation UpdateUserGroup($id: ID!, $data: ContributorUserGroupUpdateInput!) {
    updateContributorUserGroup(pk: $id, data: $data) {
        ... on ContributorUserGroupTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
                name
                description
                clientId
                modifiedBy {
                    id
                    displayName
                }
                modifiedAt
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
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
    isArchived: boolean;
    clientId: string;
    refetchUserGroup: () => void;
}

const keySelector = (item: UserMemberTye) => item.user.id;

function UserListItem(props: Props) {
    const {
        id,
        name,
        description,
        membersCount,
        onEdit,
        isArchived,
        clientId,
        refetchUserGroup,
    } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);
    const [expanded, setExpanded] = useState(false);
    const alert = useAlert();

    const [
        { fetching: updateUserGroupPending },
        updateUserGroup,
    ] = useUpdateUserGroupMutation();

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
            id: 'id',
            title: 'User Id',
            cellRenderer: (item) => item.user.id,
        },
        {
            id: 'username',
            title: 'User Name',
            cellRenderer: (item) => item.user.username,
        },
        {
            id: 'firebaseId',
            title: 'Firebase ID',
            cellRenderer: (item) => item.user.firebaseId,
        },
    ];

    const handleStatusUpdate = useCallback(async (newArchivedStatus: boolean) => {
        try {
            const result = await updateUserGroup({
                id,
                data: {
                    clientId,
                    name,
                    description,
                    isArchived: newArchivedStatus,
                },
            });

            if (checkAndAlertGraphQLResultError(result, alert)) {
                return;
            }

            // eslint-disable-next-line no-underscore-dangle
            if (result.data?.updateContributorUserGroup.__typename !== 'ContributorUserGroupTypeMutationResponseType') {
                alert.show('Failed to update archive status!', { variant: 'danger' });
                return;
            }

            alert.show(
                newArchivedStatus ? 'Archived successfully!' : 'Unarchived successfully!',
                { variant: 'success' },
            );

            refetchUserGroup();
        } catch (err) {
            alertCombinedError(err, alert);
        }
    }, [
        id,
        updateUserGroup,
        alert,
        name,
        description,
        clientId,
        refetchUserGroup,
    ]);

    return (
        <ExpandableContainer
            name={undefined}
            isExpanded={expanded}
            onExpansionChange={setExpanded}
            headingLevel={5}
            withBackground
            withPadding
            headerActions={(
                <>
                    {isArchived ? 'Archived' : 'Active'}
                    <OverflowMenu>
                        <Button
                            name={!isArchived}
                            styleVariant="transparent"
                            onClick={handleStatusUpdate}
                            withoutPadding
                            disabled={updateUserGroupPending}
                            start={<IoArchive />}
                        >
                            {isArchived ? 'Unarchive' : 'Archive'}
                        </Button>
                        <Button
                            name={id}
                            onClick={onEdit}
                            styleVariant="transparent"
                            withoutPadding
                            start={<FaEdit />}
                        >
                            Edit
                        </Button>
                    </OverflowMenu>
                </>
            )}
            heading={`${name} (${membersCount} members)`}
            headerDescription={description}
            contentLayout="block"
            spacing="lg"
            pending={pending}
            empty={expanded && membersCount === 0}
            emptyMessage="No member found!"
            filteredEmptyMessage="No matching member found!"
            footerActions={expanded ? (
                <Pager
                    pagePerItem={pagePerItem}
                    onPagePerItemChange={setPagePerItem}
                    activePage={activePage}
                    onActivePageChange={setActivePage}
                    totalItems={membersCount}
                    pagePerItemOptions={defaultPagePerItemOptions}
                />
            ) : null}
        >
            <Table
                keySelector={keySelector}
                columns={columns}
                data={userMemberResponse?.contributorUserGroupMembers?.results}
            />
        </ExpandableContainer>
    );
}

export default UserListItem;

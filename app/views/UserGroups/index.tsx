import {
    useCallback,
    useState,
} from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import Checkbox from '#components/Checkbox';
import Container from '#components/Container';
import OrderingInput from '#components/domain/OrderingInput';
import SortByInput, { SortByOption } from '#components/domain/SortByInput';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import TextInput from '#components/TextInput';
import {
    ContributorUserGroupFilter,
    ContributorUserGroupOrder,
    Ordering,
    useUserGroupsListQuery,
} from '#generated/types/graphql';
import useBooleanState from '#hooks/useBooleanState';
import useListManagement, { ExactFilter } from '#hooks/useListManagement';
import { defaultPagePerItemOptions } from '#utils/common';

import UserGroupFormModal from './UserGroupFormModal';
import UserGroupListItem from './UserGroupListItem';

const sortKeyOptions: SortByOption<keyof ContributorUserGroupOrder>[] = [
    {
        key: 'id',
        label: 'Created',
    },
    {
        key: 'name',
        label: 'Title',
    },
];

type UserGroupFilterValue = {
    name: ContributorUserGroupFilter['name'];
    isArchived: ExactFilter<ContributorUserGroupFilter, 'isArchived'>,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const USER_GROUPS_LIST_QUERY = gql`
query UserGroupsList($filters: ContributorUserGroupFilter, $order: ContributorUserGroupOrder, $pagination: OffsetPaginationInput, $includeAll: Boolean!= false) {
    contributorUserGroups(pagination: $pagination, order: $order, filters: $filters, includeAll: $includeAll) {
        totalCount
        results {
            id
            clientId
            isArchived
            createdBy {
                id
                displayName
            }
            createdAt
            name
            membersCount
            description
        }
    }
}
`;

function UserGroups() {
    const [
        showAddModal,
        setShowAddModalTrue,
        setShowAddModalFalse,
    ] = useBooleanState(false);
    const [editUserGroupId, setEditUserGroupId] = useState<string | undefined>();

    const {
        filters,
        rawFilters,
        sort,
        setSortKey,
        setSortOrdering,
        page,
        setPage,
        pageSize,
        offset,
        limit,
        filtersApplied,
        setFilterField,
        resetFilters,
    } = useListManagement<UserGroupFilterValue, keyof ContributorUserGroupOrder>({
        defaultFilters: {
            name: undefined,
            isArchived: undefined,
        },
        defaultSort: {
            key: 'id',
            ordering: Ordering.Desc,
        },
    });

    const [
        {
            data: userGroupsResponse,
            fetching: pending,
        },
        refetchUserGroup,
    ] = useUserGroupsListQuery({
        variables: {
            filters: {
                name: filters.name,
                isArchived: { exact: filters.isArchived },
            },
            order: isDefined(sort) ? ({
                [sort.key]: sort.ordering,
            }) : undefined,
            pagination: {
                limit,
                offset,
            },
        },
    });

    const totalItems = userGroupsResponse?.contributorUserGroups.results.length ?? 0;

    const filteredUserGroupList = userGroupsResponse?.contributorUserGroups.results ?? [];
    const totalCount = userGroupsResponse?.contributorUserGroups.totalCount ?? 0;

    const handleUserGroupModalUpdate = useCallback(() => {
        setEditUserGroupId(undefined);
        setShowAddModalFalse();
        refetchUserGroup();
    }, [refetchUserGroup, setShowAddModalFalse]);

    return (
        <PageLayout
            heading="User Groups"
            headerActions={(
                <Button
                    name={undefined}
                    styleVariant="translucent"
                    colorVariant="accent"
                    onClick={setShowAddModalTrue}
                >
                    New User Group
                </Button>
            )}
            aside={(
                <>
                    <TextInput
                        name="name"
                        icons={<PiMagnifyingGlass />}
                        value={rawFilters.name}
                        onChange={setFilterField}
                        placeholder="Search by title"
                    />
                    <Checkbox
                        name="isArchived"
                        label="Archived"
                        value={rawFilters.isArchived}
                        onChange={setFilterField}
                    />
                    <Button
                        name={undefined}
                        onClick={resetFilters}
                        colorVariant="danger"
                        styleVariant="translucent"
                    >
                        Clear filters
                    </Button>
                </>
            )}
        >
            <Container
                heading={`Showing ${totalItems} of ${userGroupsResponse?.contributorUserGroups.totalCount} teams`}
                headingLevel={6}
                headerActions={(
                    <>
                        <SortByInput
                            name={undefined}
                            value={sort?.key}
                            options={sortKeyOptions}
                            onChange={setSortKey}
                        />
                        <OrderingInput
                            name={undefined}
                            value={sort?.ordering}
                            onChange={setSortOrdering}
                        />
                    </>
                )}
                pending={pending}
                filtered={filtersApplied}
                empty={totalCount === 0}
                emptyMessage="No User Group found!"
                filteredEmptyMessage="No matching user group found!"
                spacing="lg"
                footerActions={(
                    <Pager
                        pagePerItem={pageSize}
                        activePage={page}
                        onActivePageChange={setPage}
                        totalItems={totalCount}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            >
                {filteredUserGroupList.map((userGroup) => (
                    <UserGroupListItem
                        key={userGroup.id}
                        value={userGroup}
                        onEdit={setEditUserGroupId}
                        refetchUserGroup={refetchUserGroup}
                    />
                ))}
            </Container>
            {isDefined(editUserGroupId) && (
                <UserGroupFormModal
                    userGroupId={editUserGroupId}
                    onClose={setEditUserGroupId}
                    onUpdate={handleUserGroupModalUpdate}
                />
            )}
            {showAddModal && (
                <UserGroupFormModal
                    onClose={setShowAddModalFalse}
                    onUpdate={handleUserGroupModalUpdate}
                />
            )}
        </PageLayout>
    );
}

export default UserGroups;

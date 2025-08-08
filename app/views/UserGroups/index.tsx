import {
    useCallback,
    useState,
} from 'react';
import { FaSearch } from 'react-icons/fa';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import Container from '#components/Container';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import { useUserGroupsListQuery } from '#generated/types/graphql';
import useBooleanState from '#hooks/useBooleanState';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
    keySelector,
    labelSelector,
} from '#utils/common';

import UserGroupFormModal from './UserGroupFormModal';
import UserListItem from './UserListItem';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const USER_GROUPS_LIST_QUERY = gql`
query UserGroupsList($filters: ContributorUserGroupFilter, $offset: Int!, $limit: Int, $pagination: OffsetPaginationInput, $includeAll: Boolean!= false) {
    contributorUserGroups(pagination: {offset: $offset, limit: $limit}, filters: $filters, includeAll: $includeAll) {
        totalCount
        results {
            id
            clientId
            isArchived
            name
            membersCount
            description
            userMemberships(pagination: $pagination) {
                results {
                    id
                    user {
                        username
                        id
                    }
                }
                pageInfo {
                    limit
                    offset
                }
            }
        }
        pageInfo {
            limit
            offset
        }
    }
}
`;

const statusOptions = [
    { key: true, label: 'Archive' },
    { key: false, label: 'Unarchive' },
];

interface Props {
    className?: string;
}

function UserGroups(props: Props) {
    const {
        className,
    } = props;

    const [
        showAddModal,
        setShowAddModalTrue,
        setShowAddModalFalse,
    ] = useBooleanState(false);
    const [editUserGroupId, setEditUserGroupId] = useState<string | undefined>();

    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);
    const [archivedStatus, setArchivedStatus] = useState<
        boolean | undefined
    >(undefined);

    const debouncedSearchText = useDebouncedValue(searchText?.trim());
    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const [
        {
            data: userGroupsResponse,
            fetching: pending,
        },
        refetchUserGroup,
    ] = useUserGroupsListQuery({
        variables: {
            filters: {
                name: { iContains: debouncedSearchText },
                isArchived: { exact: archivedStatus },
            },
            includeAll: true,
            pagination: {
                offset: 0,
                limit: 5,
            },
            offset: (activePage - 1) * pagePerItem,
            limit: pagePerItem,
        },
    });

    const totalItems = userGroupsResponse?.contributorUserGroups.results.length ?? 0;

    const filteredUserGroupList = userGroupsResponse?.contributorUserGroups.results ?? [];
    const totalCount = userGroupsResponse?.contributorUserGroups.totalCount ?? 0;

    const filtersApplied = isTruthyString(debouncedSearchText);

    const handleUserGroupModalUpdate = useCallback(() => {
        setEditUserGroupId(undefined);
        setShowAddModalFalse();
        refetchUserGroup();
    }, [refetchUserGroup, setShowAddModalFalse]);

    const handleClearFilterButtonClick = useCallback(() => {
        setArchivedStatus(undefined);
        setSearchText(undefined);
    }, [setSearchText, setArchivedStatus]);

    return (
        <PageLayout
            heading="User Groups"
            className={className}
            headerActions={(
                <Button
                    name={undefined}
                    styleVariant="filled"
                    colorVariant="accent"
                    onClick={setShowAddModalTrue}
                >
                    Add User Group
                </Button>
            )}
            aside={(
                <>
                    <TextInput
                        icons={<FaSearch />}
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by title"
                    />
                    <RadioInput
                        label="Usergroup status"
                        name={undefined}
                        options={statusOptions}
                        value={archivedStatus}
                        onChange={setArchivedStatus}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        radioListLayout="block"
                    />
                    <Button
                        name={undefined}
                        onClick={handleClearFilterButtonClick}
                    >
                        Clear filters
                    </Button>
                </>
            )}
        >
            <Container
                footer={`Showing ${totalItems} of ${userGroupsResponse?.contributorUserGroups.totalCount} teams`}
                pending={pending}
                filtered={filtersApplied}
                empty={totalCount === 0}
                emptyMessage="No User Group found!"
                filteredEmptyMessage="No matching user group found!"
                spacing="lg"
                footerActions={(
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={userGroupsResponse?.contributorUserGroups.totalCount ?? 0}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            >
                {filteredUserGroupList.map((userGroup) => (
                    <UserListItem
                        key={userGroup.id}
                        id={userGroup.id}
                        name={userGroup.name}
                        description={userGroup.description}
                        membersCount={userGroup.membersCount}
                        onEdit={setEditUserGroupId}
                        isArchived={userGroup.isArchived}
                        clientId={userGroup.clientId}
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

import {
    useCallback,
    useState,
} from 'react';
import {
    PiArchive,
    PiCalendar,
    PiPencil,
    PiUser,
} from 'react-icons/pi';
import { gql } from 'urql';

import Button from '#components/Button';
import ColorPreview from '#components/ColorSelectInput/ColorPreview';
import ContributorUserCard from '#components/domain/ContributorUserCard';
import ExpandableContainer from '#components/ExpandableContainer';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import OverflowMenu from '#components/OverflowMenu';
import Pager from '#components/Pager';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import {
    UserGroupsListQuery,
    useUpdateUserGroupMutation,
    useUserGroupMemberListQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    DEFAULT_PAGE,
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
        totalCount
        results {
            id
            userId
            user {
                username
                totalSwipes
                totalSwipeTime
                totalMappingProjects
                id
                firebaseId
                createdAt
                communityDashboardUrl
            }
        }
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

interface Props {
    value: UserGroupsListQuery['contributorUserGroups']['results'][number];
    onEdit: (id: string) => void;
    refetchUserGroup: () => void;
}

function UserGroupListItem(props: Props) {
    const {
        onEdit,
        value,
        refetchUserGroup,
    } = props;

    const {
        id,
        name,
        description,
        membersCount,
        isArchived,
        clientId,
        createdAt,
        createdBy,
    } = value;

    const pageSize = 4;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
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
                offset: (activePage - 1) * pageSize,
                limit: pageSize,
            },
        },
    });

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
            heading={name}
            headingLevel={5}
            headerActions={(
                <OverflowMenu>
                    <Button
                        name={!isArchived}
                        styleVariant="transparent"
                        onClick={handleStatusUpdate}
                        disabled={updateUserGroupPending}
                        start={<PiArchive />}
                        withFullWidth
                    >
                        {isArchived ? 'Unarchive' : 'Archive'}
                    </Button>
                    <Button
                        name={id}
                        onClick={onEdit}
                        styleVariant="transparent"
                        start={<PiPencil />}
                        withFullWidth
                    >
                        Edit
                    </Button>
                </OverflowMenu>
            )}
            headerDescription={(
                <ListLayout spacing="sm" layout="block">
                    <ListLayout withWrap>
                        <Tag>
                            <InlineLayout
                                spacing="sm"
                                start={isArchived ? (
                                    <PiArchive />
                                ) : (
                                    <ColorPreview
                                        value="var(--color-success)"
                                        compact
                                        rounded
                                    />
                                )}
                                withCenterAlign
                            >
                                {isArchived ? 'Archived' : 'Active'}
                            </InlineLayout>
                        </Tag>
                        <TextOutput
                            icon={<PiCalendar />}
                            label="Created on"
                            value={createdAt}
                            valueType="date"
                            withCenterAlign
                        />
                        <TextOutput
                            icon={<PiUser />}
                            label="Created by"
                            value={createdBy.displayName}
                            withCenterAlign
                        />
                    </ListLayout>
                    {description}
                </ListLayout>
            )}
            withPadding
            withBackground
            spacing="lg"
            pending={pending}
            empty={expanded && membersCount === 0}
            emptyMessage="No member found!"
            filteredEmptyMessage="No matching member found!"
            withWelledContent
            showDetailsButtonLabel="Show members"
            hideDetailsButtonLabel="Hide members"
            footer={(
                <TextOutput
                    value={membersCount}
                    description="members"
                />
            )}
        >
            {userMemberResponse?.contributorUserGroupMembers?.results.map((contributor) => (
                <ContributorUserCard
                    key={contributor.id}
                    value={contributor.user}
                    compact
                />
            ))}
            <InlineLayout
                end={(
                    <Pager
                        pagePerItem={pageSize}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={membersCount}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            />
        </ExpandableContainer>
    );
}

export default UserGroupListItem;

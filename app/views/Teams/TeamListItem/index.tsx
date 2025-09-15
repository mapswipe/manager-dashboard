import { useState } from 'react';
import {
    PiArchive,
    PiCalendar,
    PiUser,
} from 'react-icons/pi';
import { gql } from 'urql';

import ColorPreview from '#components/ColorSelectInput/ColorPreview';
import ContributorUserCard from '#components/domain/ContributorUserCard';
import ExpandableContainer from '#components/ExpandableContainer';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import Pager from '#components/Pager';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import {
    TeamsListQuery,
    useContributorTeamMemberListQuery,
} from '#generated/types/graphql';
import {
    DEFAULT_PAGE,
    defaultPagePerItemOptions,
} from '#utils/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CONTRIBUTOR_TEAM_MEMBER_LIST_QUERY = gql`
query ContributorTeamMemberList($id: ID!, $pagination: OffsetPaginationInput) {
    contributorTeam(id: $id) {
        id
        name
        membersCount
        members(pagination: $pagination) {
            totalCount
            results {
                firebaseId
                id
                createdAt
                communityDashboardUrl
                totalMappingProjects
                totalSwipeTime
                totalSwipes
                username
            }
        }
    }
}
`;

interface Props {
    value: TeamsListQuery['contributorTeams']['results'][number];
    membersCount: number;
}

function TeamListItem(props: Props) {
    const { value } = props;

    const {
        id,
        name,
        createdAt,
        createdBy,
        membersCount: membersCountFromProps,
        isArchived,
    } = value;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [expanded, setExpanded] = useState(false);

    const pageSize = 4;

    const [{
        data: teamMembersResponse,
        fetching: teamMembersPending,
    }] = useContributorTeamMemberListQuery({
        pause: !expanded,
        variables: {
            id,
            pagination: {
                offset: (activePage - 1) * pageSize,
                limit: pageSize,
            },
        },
    });

    const membersCount = teamMembersResponse?.contributorTeam.membersCount
        ?? membersCountFromProps;

    return (
        <ExpandableContainer
            name={undefined}
            isExpanded={expanded}
            onExpansionChange={setExpanded}
            heading={name}
            headingLevel={5}
            headerDescription={(
                <ListLayout
                    withWrap
                >
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
                        label="Create on"
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
            )}
            withPadding
            withBackground
            pending={teamMembersPending}
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
            <ListLayout
                layout="grid"
            >
                {teamMembersResponse?.contributorTeam.members.results.map((contributor) => (
                    <ContributorUserCard
                        key={contributor.id}
                        value={contributor}
                        compact
                    />
                ))}
            </ListLayout>
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

export default TeamListItem;

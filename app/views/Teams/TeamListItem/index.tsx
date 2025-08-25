import {
    useMemo,
    useState,
} from 'react';
import {
    IoCalendar,
    IoPerson,
} from 'react-icons/io5';
import { gql } from 'urql';

import ExpandableContainer from '#components/ExpandableContainer';
import ListLayout from '#components/ListLayout';
import Pager from '#components/Pager';
import Table, { Column } from '#components/Table';
import TextOutput from '#components/TextOutput';
import {
    ContributorTeamMemberListQuery,
    useContributorTeamMemberListQuery,
} from '#generated/types/graphql';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
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
                id
                firebaseId
                username
            }
        }
    }
}
`;

type ContibutorTeamMemberType = ContributorTeamMemberListQuery['contributorTeam']['members']['results'][number];

interface Props {
    id: string;
    name: string;
    createdAt: string;
    createdBy: string;
    membersCount: number;
}

const keySelector = (item: ContibutorTeamMemberType) => item.id;

function TeamListItem(props: Props) {
    const {
        id,
        name,
        createdAt,
        createdBy,
        membersCount: membersCountFromProps,
    } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);
    const [expanded, setExpanded] = useState(false);

    const [{
        data: userMemberResponse,
        fetching: pending,
    }] = useContributorTeamMemberListQuery({
        pause: !expanded,
        variables: {
            id,
            pagination: {
                offset: (activePage - 1) * pagePerItem,
                limit: pagePerItem,
            },
        },
    });

    const columns = useMemo<Column<ContibutorTeamMemberType>[]>(() => [
        {
            id: 'id',
            title: 'User Id',
            cellRenderer: (item) => item.id,
        },
        {
            id: 'username',
            title: 'User Name',
            cellRenderer: (item) => item.username,
        },
        {
            id: 'firebaseId',
            title: 'Firebase Id',
            cellRenderer: (item) => item.firebaseId,
        },
    ], []);

    const membersCount = userMemberResponse?.contributorTeam.membersCount
        ?? membersCountFromProps;

    return (
        <ExpandableContainer
            name={undefined}
            onExpansionChange={setExpanded}
            heading={`${name} (${membersCount} members)`}
            headingLevel={5}
            headerDescription={(
                <ListLayout>
                    <TextOutput
                        icon={<IoCalendar />}
                        label="Created on"
                        value={createdAt}
                        valueType="date"
                    />
                    <TextOutput
                        icon={<IoPerson />}
                        label="Created by"
                        value={createdBy}
                    />
                </ListLayout>
            )}
            isExpanded={expanded}
            withPadding
            withBackground
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
            spacing="lg"
            pending={pending}
            empty={expanded && membersCount === 0}
            emptyMessage="No member found!"
            filteredEmptyMessage="No matching member found!"
        >
            <Table
                keySelector={keySelector}
                columns={columns}
                data={userMemberResponse?.contributorTeam.members.results}
            />
        </ExpandableContainer>
    );
}

export default TeamListItem;

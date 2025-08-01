import {
    useMemo,
    useState,
} from 'react';
import {
    IoCalendar,
    IoPerson,
} from 'react-icons/io5';
import { gql } from 'urql';

import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import GridLayoutItem from '#components/GridLayoutItem';
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
                userId
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
}

const keySelector = (item: ContibutorTeamMemberType) => item.id;

function TeamListItem(props: Props) {
    const {
        id,
        name,
        createdAt,
        createdBy,
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
            id: 'username',
            title: 'User Name',
            cellRenderer: (item) => item.username,
        },
        {
            id: 'userId',
            title: 'User Id',
            cellRenderer: (item) => item.userId,
        },
    ], []);

    return (
        <ExpandableContainer
            onExpandedChange={setExpanded}
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
                empty={userMemberResponse?.contributorTeam.members?.totalCount === 0}
                emptyMessage="No User Member found!"
                filteredEmptyMessage="No matching user member found!"
                footerActions={(
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={userMemberResponse?.contributorTeam.members.totalCount ?? 0}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            >
                <Table
                    keySelector={keySelector}
                    columns={columns}
                    data={userMemberResponse?.contributorTeam.members.results}
                />
            </Container>
        </ExpandableContainer>
    );
}

export default TeamListItem;

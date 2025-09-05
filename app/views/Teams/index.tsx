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
    ContributorTeamFilter,
    ContributorTeamOrder,
    Ordering,
    useTeamsListQuery,
} from '#generated/types/graphql';
import useListManagement, { ExactFilter } from '#hooks/useListManagement';
import { defaultPagePerItemOptions } from '#utils/common';

import TeamListItem from './TeamListItem';

const sortKeyOptions: SortByOption<keyof ContributorTeamOrder>[] = [
    {
        key: 'id',
        label: 'Created',
    },
    {
        key: 'name',
        label: 'Title',
    },
];

type TeamFilterValue = {
    name: ContributorTeamFilter['name'];
    isArchived: ExactFilter<ContributorTeamFilter, 'isArchived'>,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEAMS_LIST_QUERY = gql`
query TeamsList($filters: ContributorTeamFilter, $pagination: OffsetPaginationInput, $order: ContributorTeamOrder) {
    contributorTeams(pagination: $pagination, order: $order, filters: $filters) {
        totalCount
        results {
            id
            name
            membersCount
            createdBy {
                id
                displayName
            }
            createdAt
            isArchived
        }
    }
}
`;

interface Props {
    className?: string;
}

function Teams(props: Props) {
    const { className } = props;

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
    } = useListManagement<TeamFilterValue, keyof ContributorTeamOrder>({
        defaultFilters: {
            name: undefined,
            isArchived: undefined,
        },
        defaultSort: {
            key: 'id',
            ordering: Ordering.Desc,
        },
    });

    const [{
        data: teamsResponse,
        fetching: pending,
    }] = useTeamsListQuery({
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

    const totalItems = teamsResponse?.contributorTeams.results.length ?? 0;
    const teamList = teamsResponse?.contributorTeams.results ?? [];
    const totalCount = teamsResponse?.contributorTeams.totalCount ?? 0;

    return (
        <PageLayout
            heading="Teams"
            className={className}
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
                heading={`Showing ${totalItems} of ${totalCount} teams`}
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
                emptyMessage="No team found!"
                filteredEmptyMessage="No matching team found!"
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
                {teamList.map((team) => (
                    <TeamListItem
                        key={team.id}
                        value={team}
                        membersCount={team.membersCount}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default Teams;

import {
    PiMagnifyingGlass,
    PiUsersThree,
} from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import Container from '#components/Container';
import ContributorUserCard from '#components/domain/ContributorUserCard';
import OrderingInput from '#components/domain/OrderingInput';
import SortByInput, { SortByOption } from '#components/domain/SortByInput';
import ListLayout from '#components/ListLayout';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import TeamSelectInput from '#components/selections/TeamSelectInput';
import TextInput from '#components/TextInput';
import {
    ContributorUserFilter,
    ContributorUserOrder,
    Ordering,
    useContributorUserListQuery,
} from '#generated/types/graphql';
import useListManagement, {
    ExactFilter,
    SearchFilter,
} from '#hooks/useListManagement';
import {
    defaultPagePerItemOptions,
    formatNumber,
} from '#utils/common';

const sortKeyOptions: SortByOption<keyof ContributorUserOrder>[] = [
    {
        key: 'id',
        label: 'Created',
    },
    {
        key: 'username',
        label: 'Name',
    },
];

type ContributorUserFilterValue = {
    username: SearchFilter<ContributorUserFilter, 'username'>;
    team: ExactFilter<ContributorUserFilter, 'teamId'>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CONTRIBUTOR_USER_QUERY = gql`
query ContributorUserList($filters: ContributorUserFilter, $order: ContributorUserOrder, $pagination: OffsetPaginationInput) {
    contributorUsers(pagination: $pagination, order: $order, filters: $filters) {
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
`;

function Contributors() {
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
    } = useListManagement<ContributorUserFilterValue, keyof ContributorUserOrder>({
        pageSize: 10,
        defaultFilters: {
            username: undefined,
            team: undefined,
        },
        defaultSort: {
            key: 'id',
            ordering: Ordering.Desc,
        },
    });

    const [{
        fetching: pending,
        data: contributorUsersResponse,
    }] = useContributorUserListQuery({
        variables: {
            filters: {
                username: { iContains: filters.username },
                teamId: { exact: filters.team },
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

    const totalItems = contributorUsersResponse?.contributorUsers.results.length ?? 0;
    const totalCount = contributorUsersResponse?.contributorUsers.totalCount ?? 0;

    return (
        <PageLayout
            heading="Contributors"
            aside={(
                <>
                    <TextInput
                        name="username"
                        icons={<PiMagnifyingGlass />}
                        value={rawFilters.username}
                        onChange={setFilterField}
                        placeholder="Search by name"
                    />
                    <TeamSelectInput
                        name="team"
                        icons={<PiUsersThree />}
                        placeholder="Team"
                        onChange={setFilterField}
                        value={rawFilters.team}
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
                heading={`Showing ${formatNumber(totalItems)} of ${formatNumber(totalCount)} users`}
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
                emptyMessage="No contributor found!"
                filteredEmptyMessage="No matching contributor found!"
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
                <ListLayout layout="grid">
                    {contributorUsersResponse?.contributorUsers.results.map((contributor) => (
                        <ContributorUserCard
                            key={contributor.id}
                            value={contributor}
                        />
                    ))}
                </ListLayout>
            </Container>
        </PageLayout>
    );
}

export default Contributors;

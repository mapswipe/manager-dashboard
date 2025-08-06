import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { isTruthyString } from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import Container from '#components/Container';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import TextInput from '#components/TextInput';
import { useTeamsListQuery } from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

import TeamListItem from './TeamListItem';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEAMS_LIST_QUERY = gql`
query TeamsList($filters: ContributorTeamFilter, $offset: Int!, $limit: Int) {
    contributorTeams(pagination: {offset: $offset, limit: $limit}, filters: $filters) {
        totalCount
        results {
            id
            name
            membersCount
            members {
                results {
                    id
                    username
                    firebaseId
                }
            totalCount
            }
            createdBy {
                id
                displayName
            }
            createdAt
        }
        pageInfo {
            limit
            offset
        }
    }
}
`;

interface Props {
    className?: string;
}

function Teams(props: Props) {
    const {
        className,
    } = props;

    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    const debouncedSearchText = useDebouncedValue(searchText?.trim());
    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const [{
        data: teamsResponse,
        fetching: pending,
    }] = useTeamsListQuery({
        variables: {
            filters: {
                name: { iContains: debouncedSearchText },
            },
            offset: (activePage - 1) * pagePerItem,
            limit: pagePerItem,
        },
    });

    const totalItems = teamsResponse?.contributorTeams.results.length ?? 0;

    const filteredTeamList = teamsResponse?.contributorTeams.results ?? [];
    const totalCount = teamsResponse?.contributorTeams.totalCount ?? 0;

    const filtersApplied = isTruthyString(debouncedSearchText);

    return (
        <PageLayout
            heading="Teams"
            className={className}
            aside={(
                <>
                    <TextInput
                        icons={<FaSearch />}
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by title"
                    />
                    <Button
                        name={undefined}
                        onClick={setSearchText}
                    >
                        Clear filters
                    </Button>
                </>
            )}
        >
            <Container
                heading={`Showing ${totalItems} of ${teamsResponse?.contributorTeams.totalCount} teams`}
                pending={pending}
                filtered={filtersApplied}
                empty={totalCount === 0}
                emptyMessage="No team found!"
                filteredEmptyMessage="No matching team found!"
                spacing="lg"
                footerActions={(
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={teamsResponse?.contributorTeams.totalCount ?? 0}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            >
                {filteredTeamList.map((team) => (
                    <TeamListItem
                        key={team.id}
                        id={team.id}
                        name={team.name}
                        createdAt={team.createdAt}
                        createdBy={team.createdBy.displayName}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default Teams;

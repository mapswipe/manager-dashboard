import {
    useMemo,
    useState,
} from 'react';
import { gql } from 'urql';

import SearchSelectInput, { type SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    GetTeamQuery,
    GetTeamQueryVariables,
    Ordering,
    useGetTeamQuery,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEAM = gql`
    query GetTeam(
        $order: ContributorTeamOrder,
        $filters: ContributorTeamFilter,
    ) {
        contributorTeams(
            order: $order,
            filters: $filters,
        ) {
            totalCount
            results {
                id
                name
            }
        }
    }
`;

export type TeamOption = NonNullable<NonNullable<GetTeamQuery['contributorTeams']>['results']>[number];

const keySelector = (d: TeamOption) => d.id;
const labelSelector = (d: TeamOption) => d.name;

type Def = { containerClassName?: string };
type SelectInputProps<
    K extends string,
> = SearchSelectInputProps<
    string,
    K,
    TeamOption,
    Def,
    'keySelector'
    | 'labelSelector'
    | 'onOptionsChange'
    | 'onSearchValueChange'
    | 'onShowDropdownChange'
    | 'options'
    | 'optionsPending'
    | 'searchOptions'
    | 'totalOptionsCount'
>;

function TeamSelectInput<K extends string>(props: SelectInputProps<K>) {
    const {
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [opened, setOpened] = useState(false);

    const debouncedSearchText = useDebouncedValue(searchText);

    const searchVariable = useMemo(
        (): GetTeamQueryVariables => (
            debouncedSearchText ? {
                filters: {
                    name: debouncedSearchText,
                },
            } : {
                order: {
                    name: Ordering.Asc,
                },
            }
        ),
        [debouncedSearchText],
    );

    const [{
        fetching,
        data,
    }] = useGetTeamQuery({
        variables: searchVariable,
        pause: !opened,
    });

    const searchOptions = data?.contributorTeams?.results;
    const totalOptionsCount = data?.contributorTeams?.totalCount;

    const [options, setOptions] = useOptions('project');

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onOptionsChange={setOptions}
            onSearchValueChange={setSearchText}
            onShowDropdownChange={setOpened}
            options={options}
            optionsPending={fetching}
            searchOptions={searchOptions}
            totalOptionsCount={totalOptionsCount ?? undefined}
        />
    );
}

export default TeamSelectInput;

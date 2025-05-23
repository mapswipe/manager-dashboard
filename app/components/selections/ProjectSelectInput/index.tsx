import {
    useMemo,
    useState,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import { _cs } from '@togglecorp/fujs';

import SearchSelectInput, { type SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    GetProjectQuery,
    GetProjectQueryVariables,
    Ordering,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

import styles from './styles.module.css';

const PROJECT = gql`
    query GetProject(
        $order: ProjectOrder,
        $filters: ProjectFilter,
    ) {
        projects(
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

export type ProjectOption = NonNullable<NonNullable<GetProjectQuery['projects']>['results']>[number];

const keySelector = (d: ProjectOption) => d.id;
const labelSelector = (d: ProjectOption) => d.name;

type Def = { containerClassName?: string };
type SelectInputProps<
    K extends string,
> = SearchSelectInputProps<
    string,
    K,
    ProjectOption,
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

function ProjectSelectInput<K extends string>(props: SelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [opened, setOpened] = useState(false);

    const debouncedSearchText = useDebouncedValue(searchText);

    const searchVariable = useMemo(
        (): GetProjectQueryVariables => (
            debouncedSearchText ? {
                filters: {
                    name: {
                        iContains: debouncedSearchText,
                    },
                },
            } : {
                order: {
                    name: Ordering.Asc,
                },
            }
        ),
        [debouncedSearchText],
    );

    const {
        loading,
        previousData,
        data = previousData,
    } = useQuery<GetProjectQuery>(PROJECT, {
        variables: searchVariable,
        skip: !opened,
    });

    const searchOptions = data?.projects?.results;
    const totalOptionsCount = data?.projects?.totalCount;

    const [options, setOptions] = useOptions('project');

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.projectSelectInput, className)}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onOptionsChange={setOptions}
            onSearchValueChange={setSearchText}
            onShowDropdownChange={setOpened}
            options={options}
            optionsPending={loading}
            searchOptions={searchOptions}
            totalOptionsCount={totalOptionsCount ?? undefined}
        />
    );
}

export default ProjectSelectInput;

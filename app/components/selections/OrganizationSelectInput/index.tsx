import {
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql } from 'urql';

import SearchSelectInput, { type SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    GetOrganizationQuery,
    GetOrganizationQueryVariables,
    Ordering,
    useGetOrganizationQuery,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ORGANIZATION = gql`
    query GetOrganization(
        $order: OrganizationOrder,
        $filters: OrganizationFilter,
    ) {
        organizations(
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

export type OrganizationOption = NonNullable<NonNullable<GetOrganizationQuery['organizations']>['results']>[number];

const keySelector = (d: OrganizationOption) => d.id;
const labelSelector = (d: OrganizationOption) => d.name;

type Def = { containerClassName?: string };
type SelectInputProps<
    K extends string,
> = SearchSelectInputProps<
    string,
    K,
    OrganizationOption,
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

function OrganizationSelectInput<K extends string>(props: SelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [opened, setOpened] = useState(false);

    const debouncedSearchText = useDebouncedValue(searchText);

    const searchVariable = useMemo(
        (): GetOrganizationQueryVariables => (
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
    }] = useGetOrganizationQuery({
        variables: searchVariable,
        pause: !opened,
    });

    const searchOptions = data?.organizations?.results;
    const totalOptionsCount = data?.organizations?.totalCount;

    const [options, setOptions] = useOptions('organization');

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.organizationSelectInput, className)}
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

export default OrganizationSelectInput;

import {
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql } from 'urql';

import SearchSelectInput, { type SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    GetUserQuery,
    GetUserQueryVariables,
    Ordering,
    useGetUserQuery,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const USER = gql`
    query GetUser(
        $order: UserOrder,
        $filters: UserFilter,
    ) {
        users(
            order: $order,
            filters: $filters,
        ) {
            totalCount
            results {
                id
                displayName
            }
        }
    }
`;

export type UserOption = NonNullable<NonNullable<GetUserQuery['users']>['results']>[number];

const keySelector = (d: UserOption) => d.id;
const labelSelector = (d: UserOption) => d.displayName;

type Def = { containerClassName?: string };
type SelectInputProps<
    K extends string,
> = SearchSelectInputProps<
    string,
    K,
    UserOption,
    Def,
    'onSearchValueChange'
    | 'searchOptions'
    | 'optionsPending'
    | 'keySelector'
    | 'labelSelector'
    | 'totalOptionsCount'
    | 'onShowDropdownChange'
    | 'options'
    | 'onOptionsChange'
>;

function UserSelectInput<K extends string>(props: SelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [opened, setOpened] = useState(false);

    const debouncedSearchText = useDebouncedValue(searchText);

    const searchVariable = useMemo(
        (): GetUserQueryVariables => (
            debouncedSearchText ? {
                filters: {
                    displayName: debouncedSearchText,
                },
            } : {
                order: {
                    displayName: Ordering.Asc,
                },
            }
        ),
        [debouncedSearchText],
    );

    const [{
        fetching,
        data,
    }] = useGetUserQuery({
        variables: searchVariable,
        pause: !opened,
    });

    const searchOptions = data?.users?.results;
    const totalOptionsCount = data?.users?.totalCount;

    const [options, setOptions] = useOptions('user');

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.userSelectInput, className)}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            onShowDropdownChange={setOpened}
            searchOptions={searchOptions}
            optionsPending={fetching}
            totalOptionsCount={totalOptionsCount ?? undefined}
            options={options}
            onOptionsChange={setOptions}
        />
    );
}

export default UserSelectInput;

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
    GetUserQuery,
    GetUserQueryVariables,
    Ordering,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

import styles from './styles.module.css';

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
                    displayName: {
                        iContains: debouncedSearchText,
                    },
                },
            } : {
                order: {
                    displayName: Ordering.Asc,
                },
            }
        ),
        [debouncedSearchText],
    );

    const {
        loading,
        previousData,
        data = previousData,
    } = useQuery<GetUserQuery>(USER, {
        variables: searchVariable,
        skip: !opened,
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
            optionsPending={loading}
            totalOptionsCount={totalOptionsCount ?? undefined}
            options={options}
            onOptionsChange={setOptions}
        />
    );
}

export default UserSelectInput;

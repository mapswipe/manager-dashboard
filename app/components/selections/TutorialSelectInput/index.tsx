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
    GetTutorialQuery,
    GetTutorialQueryVariables,
    Ordering,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

import styles from './styles.module.css';

const TUTORIAL = gql`
    query GetTutorial(
        $order: TutorialOrder,
        $filters: TutorialFilter,
    ) {
        tutorials(
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

export type TutorialOption = NonNullable<NonNullable<GetTutorialQuery['tutorials']>['results']>[number];

const keySelector = (d: TutorialOption) => d.id;
const labelSelector = (d: TutorialOption) => d.name;

type Def = { containerClassName?: string };
type SelectInputProps<
    K extends string,
> = SearchSelectInputProps<
    string,
    K,
    TutorialOption,
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

function TutorialSelectInput<K extends string>(props: SelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [opened, setOpened] = useState(false);

    const debouncedSearchText = useDebouncedValue(searchText);

    const searchVariable = useMemo(
        (): GetTutorialQueryVariables => (
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
    } = useQuery<GetTutorialQuery>(TUTORIAL, {
        variables: searchVariable,
        skip: !opened,
    });

    const searchOptions = data?.tutorials?.results;
    const totalOptionsCount = data?.tutorials?.totalCount;

    const [options, setOptions] = useOptions('tutorial');

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.tutorialSelectInput, className)}
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

export default TutorialSelectInput;

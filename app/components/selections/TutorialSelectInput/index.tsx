import {
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql } from 'urql';

import SearchSelectInput, { type SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    GetTutorialQuery,
    GetTutorialQueryVariables,
    Ordering,
    ProjectTypeEnum,
    useGetTutorialQuery,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useOptions from '#hooks/useOptions';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
> & {
    projectType: ProjectTypeEnum;
};

function TutorialSelectInput<K extends string>(props: SelectInputProps<K>) {
    const {
        className,
        projectType,
        hint = "Please note that you'll only be able to select the tutorial of same project type",
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [opened, setOpened] = useState(false);

    const debouncedSearchText = useDebouncedValue(searchText);

    const searchVariable = useMemo(
        (): GetTutorialQueryVariables => (
            debouncedSearchText ? {
                filters: {
                    project: {
                        projectType: {
                            exact: projectType,
                        },
                    },
                    name: debouncedSearchText,
                },
            } : {
                filters: {
                    project: {
                        projectType: {
                            exact: projectType,
                        },
                    },
                },
                order: {
                    name: Ordering.Asc,
                },
            }
        ),
        [debouncedSearchText, projectType],
    );

    const [{
        fetching,
        data,
    }] = useGetTutorialQuery({
        variables: searchVariable,
        pause: !opened,
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
            optionsPending={fetching}
            searchOptions={searchOptions}
            totalOptionsCount={totalOptionsCount ?? undefined}
            hint={hint}
        />
    );
}

export default TutorialSelectInput;

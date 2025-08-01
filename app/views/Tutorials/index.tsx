import {
    useCallback,
    useContext,
    useState,
} from 'react';
import { FaSearch } from 'react-icons/fa';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { gql } from 'urql';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import EnumsContext from '#base/context/EnumsContext';
import Button from '#components/Button';
import Container from '#components/Container';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import {
    TutorialStatusEnum,
    useTutorialsListQuery,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
    keySelector,
    labelSelector,
} from '#utils/common';

import TutorialListItem from './TutorialListItem';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENUM_QUERY = gql`
query TutorialFilterEnums {
    enums {
        TutorialStatusEnum {
            key
            label
        }
    }
}
`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TUTORIALS_LIST_QUERY = gql`
query TutorialsList($filters: TutorialFilter, $offset: Int!, $limit: Int) {
    tutorials(pagination: {offset: $offset, limit: $limit}, filters: $filters) {
        totalCount
        results {
            id
            createdBy {
                id
                displayName
            }
            createdAt
            name
            status
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

function Tutorials(props: Props) {
    const {
        className,
    } = props;

    const [selectedTutorialStat, setSelectedTutorialStat] = useInputState<
        TutorialStatusEnum | undefined
    >(undefined);
    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    const debouncedSearchText = useDebouncedValue(searchText?.trim());
    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const [{
        data: tutorialResponse,
        fetching: pending,
    }] = useTutorialsListQuery({
        variables: {
            filters: {
                name: { iContains: debouncedSearchText },
                status: { exact: selectedTutorialStat },
            },
            offset: (activePage - 1) * pagePerItem,
            limit: pagePerItem,
        },
    });

    const handleClearFilterButtonClick = useCallback(() => {
        setSelectedTutorialStat(undefined);
        setSearchText(undefined);
    }, [setSearchText, setSelectedTutorialStat]);

    const totalItems = tutorialResponse?.tutorials.results.length ?? 0;

    const {
        TutorialStatusEnum: tutorialStatusOptions,
    } = useContext(EnumsContext);

    const filteredTutorialList = tutorialResponse?.tutorials.results ?? [];
    const totalCount = tutorialResponse?.tutorials.totalCount ?? 0;

    const filtersApplied = isTruthyString(debouncedSearchText)
        || isDefined(selectedTutorialStat);

    return (
        <PageLayout
            heading="Tutorials"
            className={className}
            headerActions={(
                <>
                    <SmartLink
                        route={routes.newProject}
                        spacing="md"
                        styleVariant="outline"
                    >
                        New Project
                    </SmartLink>
                    <SmartLink
                        route={routes.newTutorial}
                        colorVariant="accent"
                        styleVariant="filled"
                        spacing="md"
                    >
                        New Tutorial
                    </SmartLink>
                </>
            )}
            aside={(
                <>
                    <TextInput
                        icons={<FaSearch />}
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by title"
                    />
                    <RadioInput
                        label="Tutorial status"
                        name={undefined}
                        options={tutorialStatusOptions ?? []}
                        value={selectedTutorialStat}
                        onChange={setSelectedTutorialStat}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        radioListLayout="block"
                    />
                    <Button
                        name={undefined}
                        onClick={handleClearFilterButtonClick}
                    >
                        Clear filters
                    </Button>
                </>
            )}
        >
            <Container
                heading={`Showing ${totalItems} of ${tutorialResponse?.tutorials.totalCount} tutorial`}
                pending={pending}
                filtered={filtersApplied}
                empty={totalCount === 0}
                emptyMessage="No tutorial found!"
                filteredEmptyMessage="No matching tutorial found!"
                spacing="lg"
                footerActions={(
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={tutorialResponse?.tutorials.totalCount ?? 0}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                )}
            >
                {!pending && filteredTutorialList.map((tutorial) => (
                    <TutorialListItem
                        key={tutorial.id}
                        id={tutorial.id}
                        status={tutorial.status}
                        name={tutorial.name}
                        createdAt={tutorial.createdAt}
                        createdBy={tutorial.createdBy.displayName}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default Tutorials;

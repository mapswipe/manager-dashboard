import { useContext } from 'react';
import {
    PiFlag,
    PiMagnifyingGlass,
    PiMapPin,
} from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import SmartLink from '#base/components/SmartLink';
import Button from '#components/Button';
import Checklist from '#components/Checklist';
import Container from '#components/Container';
import OrderingInput from '#components/domain/OrderingInput';
import SortByInput, { SortByOption } from '#components/domain/SortByInput';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import {
    Ordering,
    ProjectFilter,
    TutorialFilter,
    TutorialOrder,
    useTutorialsListQuery,
} from '#generated/types/graphql';
import useListManagement, {
    ExactFilter,
    ListFilter,
} from '#hooks/useListManagement';
import {
    defaultPagePerItemOptions,
    formatNumber,
    keySelector,
    labelSelector,
    removeEmptyList,
} from '#utils/common';

import TutorialListItem from './TutorialListItem';

type TutorialFilterValue = {
    name: TutorialFilter['name'];
    status: ListFilter<TutorialFilter, 'status'>;
    organization: ExactFilter<ProjectFilter, 'requestingOrganizationId'>;
    region: ProjectFilter['region'];
    projectType: ListFilter<ProjectFilter, 'projectType'>;

}

const sortKeyOptions: SortByOption<keyof TutorialOrder>[] = [
    {
        key: 'id',
        label: 'Created',
    },
    {
        key: 'name',
        label: 'Title',
    },
];

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
query TutorialsList($filters: TutorialFilter, $order: TutorialOrder, $pagination: OffsetPaginationInput!) {
    tutorials(pagination: $pagination, order: $order, filters: $filters, includeAll: true) {
        totalCount
        results {
            id
            clientId
            firebaseId
            firebasePushStatus
            firebaseLastPushed
            createdBy {
                id
                displayName
            }
            createdAt
            name
            status
            projectId
            project {
                id
                clientId
                projectType
                projectInstruction
                lookFor
                region
                requestingOrganization {
                    id
                    name
                }
            }
        }
    }
}
`;

function Tutorials() {
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
    } = useListManagement<TutorialFilterValue, keyof TutorialOrder>({
        defaultFilters: {
            name: undefined,
            status: undefined,
            organization: undefined,
            region: undefined,
            projectType: undefined,
        },
        defaultSort: {
            key: 'id',
            ordering: Ordering.Desc,
        },
    });

    const [{
        data: tutorialResponse,
        fetching: pending,
    }] = useTutorialsListQuery({
        variables: {
            order: isDefined(sort) ? ({
                [sort.key]: sort.ordering,
            }) : undefined,
            filters: {
                name: filters.name,
                status: { inList: removeEmptyList(filters.status) },
                project: {
                    requestingOrganizationId: { exact: filters.organization },
                    region: filters.region,
                    projectType: { inList: removeEmptyList(filters.projectType) },
                },
            },
            pagination: {
                limit,
                offset,
            },
        },
    });

    const totalItems = tutorialResponse?.tutorials.results.length ?? 0;
    const {
        tutorialStatusOptions,
        projectTypeOptions,
    } = useContext(EnumsContext);

    const filteredTutorialList = tutorialResponse?.tutorials.results ?? [];
    const totalCount = tutorialResponse?.tutorials.totalCount ?? 0;

    return (
        <PageLayout
            heading="Tutorials"
            headerActions={(
                <SmartLink
                    route="newTutorial"
                    withLinkIcon
                    styleVariant="translucent"
                >
                    New Tutorial
                </SmartLink>
            )}
            aside={(
                <>
                    <TextInput
                        name="name"
                        icons={<PiMagnifyingGlass />}
                        value={rawFilters.name}
                        onChange={setFilterField}
                        placeholder="Search by title"
                    />
                    <TextInput
                        name="region"
                        icons={<PiMapPin />}
                        value={rawFilters.region}
                        onChange={setFilterField}
                        placeholder="Search by region"
                    />
                    <OrganizationSelectInput
                        name="organization"
                        icons={<PiFlag />}
                        label="Organization"
                        placeholder="All"
                        value={rawFilters.organization}
                        onChange={setFilterField}
                    />
                    <Checklist
                        label="Project type"
                        name="projectType"
                        options={projectTypeOptions}
                        value={rawFilters.projectType}
                        onChange={setFilterField}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                    />
                    <Checklist
                        label="Tutorial status"
                        name="status"
                        options={tutorialStatusOptions}
                        value={rawFilters.status}
                        onChange={setFilterField}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
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
                heading={`Showing ${formatNumber(totalItems)} of ${formatNumber(totalCount)} tutorial`}
                withWrapInHeader
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
                spacing="lg"
                empty={totalCount === 0}
                emptyMessage="No tutorial found!"
                filteredEmptyMessage="No matching tutorial found!"
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
                {!pending && filteredTutorialList.map((tutorial) => (
                    <TutorialListItem
                        key={tutorial.id}
                        value={tutorial}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default Tutorials;

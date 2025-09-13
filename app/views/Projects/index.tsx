import { useContext } from 'react';
import {
    PiFlag,
    PiLock,
    PiMagnifyingGlass,
    PiStar,
    PiUsersThree,
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
import SelectInput from '#components/SelectInput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TeamSelectInput from '#components/selections/TeamSelectInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import {
    Ordering,
    ProjectFilter,
    ProjectOrder,
    useProjectsListQuery,
} from '#generated/types/graphql';
import useListManagement, {
    ExactFilter,
    IdFilter,
    ListFilter,
} from '#hooks/useListManagement';
import {
    defaultPagePerItemOptions,
    formatNumber,
    keySelector,
    labelSelector,
    removeEmptyList,
} from '#utils/common';

import ProjectListItem from './ProjectListItem';

type BooleanOption = {
    key: boolean,
    label: string;
}

const featuredOptions: BooleanOption[] = [
    {
        key: true,
        label: 'Featured only',
    },
    {
        key: false,
        label: 'Not featured only',
    },
];

const privateOptions: BooleanOption[] = [
    {
        key: true,
        label: 'Private only',
    },
    {
        key: false,
        label: 'Public only',
    },
];

const sortKeyOptions: SortByOption<keyof ProjectOrder>[] = [
    {
        key: 'id',
        label: 'Created',
    },
    {
        key: 'name',
        label: 'Title',
    },
];

type ProjectFilterValue = {
    name: ProjectFilter['name'];
    region: ProjectFilter['region'];

    projectType: ListFilter<ProjectFilter, 'projectType'>;
    status: ListFilter<ProjectFilter, 'status'>;
    organization: ExactFilter<ProjectFilter, 'requestingOrganizationId'>;
    isFeatured: ExactFilter<ProjectFilter, 'isFeatured'>;
    isPrivate: ExactFilter<ProjectFilter, 'isPrivate'>;
    team: IdFilter<ProjectFilter, 'team'> | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENUM_QUERY = gql`
query ProjectsFilterEnums {
    enums {
        ProjectTypeEnum {
            key
            label
        }
        ProjectStatusEnum {
            key
            label
        }
    }
}
`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_LIST_QUERY = gql`
query ProjectsList($filters: ProjectFilter, $order: ProjectOrder, $pagination: OffsetPaginationInput) {
    projects(pagination: $pagination, order: $order, filters: $filters, includeAll: true) {
        totalCount
        results {
            id
            clientId
            firebaseId
            firebasePushStatus
            firebaseLastPushed
            additionalInfoUrl
            createdBy {
                displayName
                id
            }
            createdAt
            description
            groupSize
            isFeatured
            lookFor
            projectInstruction
            maxTasksPerUser
            name
            topic
            projectNumber
            region
            processingStatus
            progress
            projectType
            status
            verificationNumber
            requiredResults
            contributorsCount
            image {
                id
                file {
                    url
                }
            }
            requestingOrganization {
                name
                id
            }
            team {
                id
                name
            }
            tutorial {
                id
                name
            }
        }
        pageInfo {
            limit
            offset
        }
    }
}
`;

function Projects() {
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
    } = useListManagement<ProjectFilterValue, keyof ProjectOrder>({
        defaultFilters: {
            name: undefined,
            projectType: undefined,
            status: undefined,
            organization: undefined,
            region: undefined,
            isFeatured: undefined,
            isPrivate: undefined,
            team: undefined,
        },
        defaultSort: {
            key: 'id',
            ordering: Ordering.Desc,
        },
    });

    const [{
        data: projectsResponse,
        fetching: pending,
    }] = useProjectsListQuery({
        variables: {
            pagination: {
                limit,
                offset,
            },
            order: isDefined(sort) ? ({
                [sort.key]: sort.ordering,
            }) : undefined,
            filters: {
                name: filters.name,
                projectType: { inList: removeEmptyList(filters.projectType) },
                status: { inList: removeEmptyList(filters.status) },
                requestingOrganizationId: { exact: filters.organization },
                region: filters.region,
                isFeatured: { exact: filters.isFeatured },
                isPrivate: { exact: filters.isFeatured },
                team: isDefined(filters.team) ? ({ id: filters.team }) : undefined,
            },
        },
    });

    const totalItems = projectsResponse?.projects.results.length ?? 0;

    const {
        projectTypeOptions,
        projectStatusOptions,
    } = useContext(EnumsContext);

    const filteredProjectList = projectsResponse?.projects.results ?? [];
    const totalCount = projectsResponse?.projects.totalCount ?? 0;

    return (
        <PageLayout
            heading="Projects"
            headerActions={(
                <SmartLink
                    route="newProject"
                    withLinkIcon
                    styleVariant="translucent"
                >
                    New Project
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
                    {/* NOTE: search by region is already included in search by title (name)
                    <TextInput
                        name="region"
                        icons={<PiMapPin />}
                        value={rawFilters.region}
                        onChange={setFilterField}
                        placeholder="Search by region"
                    />
                    */}
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
                        label="Project status"
                        name="status"
                        options={projectStatusOptions}
                        value={rawFilters.status}
                        onChange={setFilterField}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                    />
                    <OrganizationSelectInput
                        name="organization"
                        icons={<PiFlag />}
                        label="Organization"
                        placeholder="All"
                        value={rawFilters.organization}
                        onChange={setFilterField}
                    />
                    <SelectInput
                        name="isFeatured"
                        icons={<PiStar />}
                        label="Featured"
                        placeholder="All"
                        options={featuredOptions}
                        value={rawFilters.isFeatured}
                        onChange={setFilterField}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                    />
                    <SelectInput
                        name="isPrivate"
                        icons={<PiLock />}
                        label="Private"
                        placeholder="All"
                        options={privateOptions}
                        value={rawFilters.isPrivate}
                        onChange={setFilterField}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                    />
                    {rawFilters.isPrivate && (
                        <TeamSelectInput
                            name="team"
                            icons={<PiUsersThree />}
                            placeholder="Team (private project)"
                            onChange={setFilterField}
                            value={rawFilters.team}
                        />
                    )}
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
                heading={`Showing ${formatNumber(totalItems)} of ${formatNumber(totalCount)} projects`}
                headingLevel={6}
                withWrapInHeader
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
                empty={totalCount === 0}
                emptyMessage="No projects found!"
                filteredEmptyMessage="No matching projects found!"
                spacing="lg"
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
                {!pending && filteredProjectList.map((project) => (
                    <ProjectListItem
                        key={project.id}
                        value={project}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default Projects;

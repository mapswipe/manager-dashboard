import { useContext } from 'react';
import { FaSearch } from 'react-icons/fa';
import {
    PiArrowsDownUp,
    PiFlag,
    PiLock,
    PiSortAscending,
    PiSortDescending,
    PiStar,
    PiUsersThree,
} from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import EnumsContext from '#base/context/EnumsContext';
import Button from '#components/Button';
import Checklist from '#components/Checklist';
import Container from '#components/Container';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import PopupButton from '#components/PopupButton';
import SelectInput from '#components/SelectInput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TeamSelectInput from '#components/selections/TeamSelectInput';
import TextInput from '#components/TextInput';
import {
    Ordering,
    ProjectFilter,
    ProjectOrder,
    useProjectsListQuery,
} from '#generated/types/graphql';
import useListManagement from '#hooks/useListManagement';
import {
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
    keySelector,
    labelSelector,
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

type OrderingOption = {
    key: Ordering;
    label: React.ReactNode;
}

const orderingOptions: OrderingOption[] = [
    {
        key: Ordering.Asc,
        label: <PiSortAscending />,
    },
    {
        key: Ordering.Desc,
        label: <PiSortDescending />,
    },
];

type OrderPropertyOption = {
    key: keyof ProjectOrder;
    label: string;
}

const orderPropertyOptions: OrderPropertyOption[] = [
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
    projectType: NonNullable<ProjectFilter['projectType']>['inList'];
    status: NonNullable<ProjectFilter['status']>['inList'];
    organization: NonNullable<ProjectFilter['requestingOrganizationId']>['exact'];
    region: ProjectFilter['region'];
    isFeatured: NonNullable<ProjectFilter['isFeatured']>['exact'];
    isPrivate: NonNullable<ProjectFilter['isPrivate']>['exact'];
    team: NonNullable<ProjectFilter['team']>['id'] | undefined;
}

type ProjectOrderValue = {
    value: Ordering,
    property: keyof ProjectOrder;
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
query ProjectsList($filters: ProjectFilter, $order: ProjectOrder, $offset: Int!, $limit: Int) {
    projects(pagination: {offset: $offset, limit: $limit}, order: $order, filters: $filters, includeAll: true) {
        totalCount
        results {
            id
            clientId
            firebaseId
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
        }
        pageInfo {
            limit
            offset
        }
    }
}
`;

function removeEmptyList<T>(list: T[] | undefined | null) {
    if (isDefined(list) && list.length === 0) {
        return undefined;
    }
    return list;
}

interface Props {
    className?: string;
}

function Projects(props: Props) {
    const { className } = props;

    const {
        filters,
        rawFilters,
        order,
        sortState,
        page,
        setPage,
        pageSize,
        offset,
        limit,
        filtersApplied,
        setFilterField,
        resetFilters,
    } = useListManagement<ProjectFilterValue, ProjectOrderValue>({
        filters: {
            name: undefined,
            projectType: undefined,
            status: undefined,
            organization: undefined,
            region: undefined,
            isFeatured: undefined,
            isPrivate: undefined,
            team: undefined,
        },
        order: {
            property: 'id',
            value: Ordering.Desc,
        },
        pageSize: DEFAULT_PAGE_SIZE,
    });

    const [{
        data: projectsResponse,
        fetching: pending,
    }] = useProjectsListQuery({
        variables: {
            offset,
            order: isDefined(order) ? ({
                [order.property]: order.value,
            }) : undefined,
            limit,
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
            className={className}
            headerActions={(
                <SmartLink
                    route={routes.newProject}
                    spacing="md"
                    withLinkIcon
                >
                    New Project
                </SmartLink>
            )}
            aside={(
                <>
                    <TextInput
                        name="name"
                        icons={<FaSearch />}
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
                heading={`Showing ${totalItems} of ${projectsResponse?.projects.totalCount ?? 0} projects`}
                headingLevel={6}
                headerActions={(
                    <PopupButton
                        label={<PiArrowsDownUp />}
                        withoutDropdownIcon
                        styleVariant="translucent"
                        colorVariant="accent"
                    >
                        {orderPropertyOptions.flatMap((property) => (
                            orderingOptions.map((ordering) => (
                                <Button
                                    key={`${property.key}-${ordering.key}`}
                                    name={{
                                        property: property.key,
                                        value: ordering.key,
                                    } satisfies ProjectOrderValue}
                                    styleVariant="transparent"
                                    colorVariant={property.key === sortState.sorting?.property && ordering.key === sortState.sorting.value ? 'accent' : 'text'}
                                    withFullWidth
                                    end={ordering.label}
                                    onClick={sortState.setSorting}
                                >
                                    {property.label}
                                </Button>
                            ))
                        ))}
                    </PopupButton>
                )}
                pending={pending}
                filtered={filtersApplied}
                empty={totalCount === 0}
                withBackground={totalCount === 0}
                withPadding={totalCount === 0}
                withMinHeight={totalCount === 0}
                emptyMessage="No projects found!"
                filteredEmptyMessage="No matching projects found!"
                spacing="lg"
                footerActions={(
                    <Pager
                        pagePerItem={pageSize}
                        activePage={page}
                        onActivePageChange={setPage}
                        totalItems={projectsResponse?.projects.totalCount ?? 0}
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

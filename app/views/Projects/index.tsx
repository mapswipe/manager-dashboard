import {
    useCallback,
    useState,
} from 'react';
import { MdSearch, MdSwipeLeft } from 'react-icons/md';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Button from '#components/Button';
import PageLayout from '#components/PageLayout';
import Pager from '#components/Pager';
import PendingMessage from '#components/PendingMessage';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import {
    ProjectsFilterEnumsQuery,
    ProjectsFilterEnumsQueryVariables,
    ProjectsListQuery,
    ProjectsListQueryVariables,
    ProjectStatusEnum,
    ProjectTypeEnum,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useInputState from '#hooks/useInputState';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import ProjectListItem from './ProjectListItem';

import styles from './styles.module.css';
import EmptyMessage from '#components/EmptyMessage';

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
const PROJECT_LIST_QUERY = gql`
query ProjectsList($filters: ProjectFilter, $offset: Int!, $limit: Int) {
    projects(pagination: {offset: $offset, limit: $limit}, filters: $filters) {
        totalCount
        results {
            id
            additionalInfoUrl
            description
            groupSize
            isFeatured
            lookFor
            maxTasksPerUser
            name
            processingStatus
            progress
            projectType
            status
            verificationNumber
            projectTypeSpecifics {
                ... on CompareProjectPropertyType {
                    __typename
                    zoomLevel
                    tileServerProperty {
                        name
                    }
                    tileServerBProperty {
                        name
                    }
                }
                ... on FindProjectPropertyType {
                    __typename
                    zoomLevel
                    tileServerProperty {
                        name
                    }
                }
            }
            requestingOrganization {
                name
                id
            }
        }
        pageInfo {
            limit
            offset
        }
    }
}
`;

const defaultPagePerItemOptions = [
    { value: 2, label: '2 items / page' },
    { value: 5, label: '5 items / page' },
    { value: 10, label: '10 items / page' },
    { value: 20, label: '20 items / page' },
    { value: 50, label: '50 items / page' },
    { value: 100, label: '100 items / page' },
];

interface Props {
    className?: string;
}

function Projects(props: Props) {
    const {
        className,
    } = props;

    const [selectedProjectStat, setSelectedProjectStat] = useInputState<
        ProjectStatusEnum | undefined
    >(undefined);
    const [selectedProjectType, setSelectedProjectType] = useInputState<
        ProjectTypeEnum | undefined
    >(undefined);
    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    const debouncedSearchText = useDebouncedValue(searchText);
    const [activePage, setActivePage] = useState(1);
    const [pagePerItem, setPagePerItem] = useState(2);

    const {
        data: projectsResponse,
        loading: pending,
    } = useQuery<ProjectsListQuery, ProjectsListQueryVariables>(
        PROJECT_LIST_QUERY,
        {
            variables: {
                filters: {
                    name: { iContains: debouncedSearchText },
                    status: { exact: selectedProjectStat },
                    projectType: { exact: selectedProjectType },
                },
                offset: (activePage - 1) * pagePerItem,
                limit: pagePerItem,
            },
        },
    );

    const handleClearFilterButtonClick = useCallback(() => {
        setSelectedProjectStat(undefined);
        setSelectedProjectType(undefined);
        setSearchText(undefined);
    }, [setSearchText, setSelectedProjectType, setSelectedProjectStat]);

    const totalItems = projectsResponse?.projects.results.length ?? 0;

    const {
        data: projectsFilterEnumsResponse,
    } = useQuery<ProjectsFilterEnumsQuery, ProjectsFilterEnumsQueryVariables>(ENUM_QUERY);

    const filteredProjectList = projectsResponse?.projects.results ?? [];
    const totalCount = projectsResponse?.projects.totalCount ?? 0;

    return (
        <PageLayout
            heading="Projects"
            className={_cs(styles.projects, className)}
            headerActions={(
                <>
                    <SmartLink
                        route={routes.newTutorial}
                    >
                        New Tutorial
                    </SmartLink>
                    <SmartLink
                        route={routes.newProject}
                    >
                        New Project
                    </SmartLink>
                </>
            )}
            aside={(
                <div className={styles.filters}>
                    <TextInput
                        icons={<MdSearch />}
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by title"
                    />
                    <RadioInput
                        label="Project type"
                        name={undefined}
                        options={projectsFilterEnumsResponse?.enums.ProjectTypeEnum ?? []}
                        value={selectedProjectType}
                        onChange={setSelectedProjectType}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        layout="block"
                    />
                    <RadioInput
                        label="Project status"
                        name={undefined}
                        options={projectsFilterEnumsResponse?.enums.ProjectStatusEnum ?? []}
                        value={selectedProjectStat}
                        onChange={setSelectedProjectStat}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        layout="block"
                    />
                    <Button
                        name={undefined}
                        onClick={handleClearFilterButtonClick}
                    >
                        Clear filters
                    </Button>
                </div>
            )}
            mainContentClassName={styles.projectList}
        >
            {pending && (
                <PendingMessage
                    className={styles.loading}
                />
            )}
            {!pending && totalCount === 0 && (
                <EmptyMessage
                    icon={<MdSwipeLeft />}
                    title="No matching projects found!"
                    description="There are currently no projects for the selected filter."
                />
            )}
            {/* !pending && totalCount > 0 && filteredProjectList.length === 0 && (
                <EmptyMessage
                    icon={<MdSwipeLeft />}
                    title="No projects found!"
                    description="There are no projects for selected filter."
                />
            ) */}
            {!pending
                && isDefined(projectsResponse)
                && projectsResponse.projects.totalCount > 0 && (
                <div className={styles.pageStatus}>
                    <div className={styles.projectCount}>
                        {`Showing ${totalItems} of ${projectsResponse.projects.totalCount} projects`}
                    </div>
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={projectsResponse?.projects.totalCount ?? 0}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                </div>
            )}
            {!pending && filteredProjectList.map((project) => (
                <ProjectListItem
                    key={project.id}
                    value={project}
                />
            ))}
        </PageLayout>
    );
}

export default Projects;

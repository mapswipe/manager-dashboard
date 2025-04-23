import { MdSearch } from 'react-icons/md';
import {
    gql,
    useQuery,
} from '@apollo/client';
import { _cs } from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import route from '#base/configs/routes';
import Pager from '#components/Pager';
import PendingMessage from '#components/PendingMessage';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import {
    ProjectsListQuery,
    ProjectsListQueryVariables,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useInputState from '#hooks/useInputState';
import usePagination from '#hooks/usePagination';
import {
    labelSelector,
    valueSelector,
} from '#utils/common';

import ProjectDetails, { projectStatusOptions } from './ProjectDetails';

import styles from './styles.module.css';

const PROJECT_LIST_QUERY = gql`
query ProjectsList($search: String, $offset: Int!, $limit: Int) {
    projects(pagination: {offset: $offset, limit: $limit}, filters: {name: {iContains: $search}}) {
        totalCount
        results {
            id
            name
            projectType
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

interface Props {
    className?: string;
}

function Projects(props: Props) {
    const {
        className,
    } = props;

    const [selectedProjectStat, setSelectedProjectStat] = useInputState<string>('active');
    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        data: projectsResponse,
        loading: pending,
    } = useQuery<ProjectsListQuery, ProjectsListQueryVariables>(
        PROJECT_LIST_QUERY,
        {
            variables: {
                search: debouncedSearchText,
                offset: 0,
                limit: 10,
            },
        },
    );

    const filteredProjectList = projectsResponse?.projects.results ?? [];

    const {
        showPager,
        activePage,
        setActivePage,
        pagePerItem,
        setPagePerItem,
        pagePerItemOptions,
        totalItems,
        items: filteredProjectListInCurrentPage,
    } = usePagination(filteredProjectList);

    return (
        <div className={_cs(styles.projects, className)}>
            <div className={styles.headingContainer}>
                <h2 className={styles.heading}>
                    Projects
                </h2>
                <div className={styles.actions}>
                    <TextInput
                        icons={<MdSearch />}
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by title"
                    />
                    <SmartLink
                        route={route.newTutorial}
                    >
                        Add New Tutorial
                    </SmartLink>
                    <SmartLink
                        route={route.newProject}
                    >
                        Add New Project
                    </SmartLink>
                </div>
            </div>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <div className={styles.filters}>
                        <RadioInput
                            label="Project Status"
                            name={undefined}
                            options={projectStatusOptions}
                            value={selectedProjectStat}
                            onChange={setSelectedProjectStat}
                            keySelector={valueSelector}
                            labelSelector={labelSelector}
                        />
                    </div>
                </div>
                <div
                    className={_cs(styles.projectList, className)}
                    key={selectedProjectStat}
                >
                    {pending && (
                        <PendingMessage
                            className={styles.loading}
                        />
                    )}
                    {!pending && filteredProjectListInCurrentPage.length === 0 && (
                        <div className={styles.emptyMessage}>
                            No projects found!
                        </div>
                    )}
                    {!pending && filteredProjectListInCurrentPage.length > 0 && (
                        <div className={styles.projectCount}>
                            {`${totalItems} ${totalItems > 1 ? 'projects' : 'project'}`}
                        </div>
                    )}
                    {!pending && filteredProjectListInCurrentPage.map((project) => (
                        <ProjectDetails
                            key={project.id}
                            data={project}
                        />
                    ))}
                    {!pending && showPager && (
                        <div className={styles.footerActions}>
                            <Pager
                                pagePerItem={pagePerItem}
                                onPagePerItemChange={setPagePerItem}
                                activePage={activePage}
                                onActivePageChange={setActivePage}
                                totalItems={totalItems}
                                pagePerItemOptions={pagePerItemOptions}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Projects;

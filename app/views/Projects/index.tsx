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
    ProjectStatusEnum,
    ProjectTypeEnum,
    useProjectsListQuery,
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

import ProjectListItem from './ProjectListItem';

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
query ProjectsList($filters: ProjectFilter, $offset: Int!, $limit: Int) {
    projects(pagination: {offset: $offset, limit: $limit}, filters: $filters, includeAll: true) {
        totalCount
        results {
            id
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

    const debouncedSearchText = useDebouncedValue(searchText?.trim());
    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const [{
        data: projectsResponse,
        fetching: pending,
    }] = useProjectsListQuery({
        variables: {
            filters: {
                name: debouncedSearchText,
                status: { exact: selectedProjectStat },
                projectType: { exact: selectedProjectType },
            },
            offset: (activePage - 1) * pagePerItem,
            limit: pagePerItem,
        },
    });

    const handleClearFilterButtonClick = useCallback(() => {
        setSelectedProjectStat(undefined);
        setSelectedProjectType(undefined);
        setSearchText(undefined);
    }, [setSearchText, setSelectedProjectType, setSelectedProjectStat]);

    const totalItems = projectsResponse?.projects.results.length ?? 0;

    const {
        ProjectTypeEnum: projectTypeOptions,
        ProjectStatusEnum: projectStatusOptions,
    } = useContext(EnumsContext);

    const filteredProjectList = projectsResponse?.projects.results ?? [];
    const totalCount = projectsResponse?.projects.totalCount ?? 0;

    const filtersApplied = isTruthyString(debouncedSearchText)
        || isDefined(selectedProjectStat)
        || isDefined(selectedProjectType);

    return (
        <PageLayout
            heading="Projects"
            className={className}
            headerActions={(
                <SmartLink
                    route={routes.newProject}
                    styleVariant="filled"
                    colorVariant="accent"
                    spacing="md"
                >
                    New Project
                </SmartLink>
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
                        label="Project type"
                        name={undefined}
                        options={projectTypeOptions ?? []}
                        value={selectedProjectType}
                        onChange={setSelectedProjectType}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        radioListLayout="block"
                    />
                    <RadioInput
                        label="Project status"
                        name={undefined}
                        options={projectStatusOptions ?? []}
                        value={selectedProjectStat}
                        onChange={setSelectedProjectStat}
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
                heading={`Showing ${totalItems} of ${projectsResponse?.projects.totalCount ?? 0} projects`}
                pending={pending}
                filtered={filtersApplied}
                empty={totalCount === 0}
                emptyMessage="No projects found!"
                filteredEmptyMessage="No matching projects found!"
                spacing="lg"
                footerActions={(
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
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

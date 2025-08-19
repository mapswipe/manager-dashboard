import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import {
    IoCalendar,
    IoChevronDown,
    IoChevronUp,
    IoEye,
    IoPerson,
} from 'react-icons/io5';
import { isDefined } from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Button from '#components/Button';
import Container from '#components/Container';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import ProjectTypeIcon from '#components/domain/ProjectTypeIcon';
import GridLayoutItem from '#components/GridLayoutItem';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import {
    ProjectsListQuery,
    ProjectTypeEnum,
} from '#generated/types/graphql';
import compareIllustration from '#resources/images/compare-illustration.svg';
import findIllustration from '#resources/images/find-illustration.svg';
import validateIllustration from '#resources/images/validate-illustration.svg';

import styles from './styles.module.css';
import MarkdownPreview from '#components/MarkdownPreview';

const projectTypeIllustrations: Record<ProjectTypeEnum, string> = {
    [ProjectTypeEnum.Find]: findIllustration,
    [ProjectTypeEnum.Compare]: compareIllustration,
    [ProjectTypeEnum.Validate]: validateIllustration,
    [ProjectTypeEnum.ValidateImage]: validateIllustration,
    [ProjectTypeEnum.Completeness]: findIllustration,
};

interface MetaProps {
    icon?: React.ReactNode;
    label: React.ReactNode;
}

function Meta(props: MetaProps) {
    const {
        icon,
        label,
    } = props;

    return (
        <InlineLayout
            className={styles.meta}
            start={icon}
            withPadding
            spacing="xs"
        >
            {label}
        </InlineLayout>
    );
}

interface Props {
    value: ProjectsListQuery['projects']['results'][number];
}

function ProjectListItem(props: Props) {
    const {
        value,
    } = props;

    const [showDetails, setShowDetails] = useState(false);

    return (
        <Container
            className={styles.projectListItem}
            contentLayout="block"
            spacing="lg"
            withBackground
            withPadding
            withShadow
            footerActions={(
                <Button
                    name={!showDetails}
                    styleVariant="transparent"
                    withoutPadding
                    start={showDetails ? <IoChevronUp /> : <IoChevronDown />}
                    onClick={setShowDetails}
                    spacing="sm"
                >
                    {showDetails ? 'Hide details' : 'Show details'}
                </Button>
            )}
        >
            <ListLayout
                className={styles.basicDetails}
                layout="grid"
                numPreferredGridColumns={4}
                minGridColumnSize="9rem"
                spacing="lg"
            >
                <img
                    className={styles.image}
                    alt=""
                    src={value.image?.file.url ?? projectTypeIllustrations[value.projectType]}
                />
                <GridLayoutItem columnSpan={3}>
                    <Container
                        className={styles.details}
                        heading={value.name}
                        headingLevel={5}
                        headerActions={(
                            <SmartLink
                                route={routes.editProject}
                                attrs={{
                                    id: value.id,
                                }}
                                start={<FaEdit />}
                                spacing="sm"
                                withoutPadding
                            >
                                Edit
                            </SmartLink>
                        )}
                    >
                        <ListLayout withWrap>
                            <Meta
                                label={value.status}
                            />
                            <Meta
                                icon={<ProjectTypeIcon type={value.projectType} />}
                                label={value.projectType}
                            />
                            <Meta
                                icon={<GoOrganization />}
                                label={value.requestingOrganization.name}
                            />
                        </ListLayout>
                        <ListLayout withWrap>
                            <TextOutput
                                icon={<IoCalendar />}
                                label="Created on"
                                value={value.createdAt}
                                valueType="date"
                            />
                            <TextOutput
                                icon={<IoPerson />}
                                label="Created by"
                                value={value.createdBy.displayName}
                            />
                            <TextOutput
                                icon={<IoEye />}
                                label="Look for"
                                value={value.lookFor}
                            />
                            {isDefined(value.team) && (
                                <TextOutput
                                    icon={<IoPerson />}
                                    label="Team"
                                    value={value.team.name}
                                />
                            )}
                        </ListLayout>
                        {isDefined(value.description) && (
                            <MarkdownPreview
                                className={styles.description}
                                markdown={value.description}
                            />
                        )}
                    </Container>
                </GridLayoutItem>
            </ListLayout>
            {showDetails && (
                <ProjectSpecificDetails
                    projectId={value.id}
                />
            )}
        </Container>
    );
}

export default ProjectListItem;

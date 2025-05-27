import { FaEdit } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import { isDefined } from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import ProjectTypeIcon from '#components/ProjectTypeIcon';
import TextOutput from '#components/TextOutput';
import {
    ProjectsListQuery,
    ProjectTypeEnum,
} from '#generated/types/graphql';
import compareIllustration from '#resources/images/compare-illustration.svg';
import findIllustration from '#resources/images/find-illustration.svg';
import validateIllustration from '#resources/images/validate-illustration.svg';

import styles from './styles.module.css';

const projectTypeIllustrations: Record<ProjectTypeEnum, string> = {
    [ProjectTypeEnum.Find]: findIllustration,
    [ProjectTypeEnum.Compare]: compareIllustration,
    [ProjectTypeEnum.Validate]: validateIllustration,
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

const dateFormatter = new Intl.DateTimeFormat(
    undefined,
    {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    },
);

interface Props {
    value: ProjectsListQuery['projects']['results'][number];
}

function ProjectListItem(props: Props) {
    const {
        value,
    } = props;

    return (
        <InlineLayout
            className={styles.projectListItem}
            start={(
                <img
                    className={styles.image}
                    alt=""
                    src={isDefined(value.image)
                        ? value.image.file.url
                        : projectTypeIllustrations[value.projectType]}
                />
            )}
            withPadding
        >
            <Container
                className={styles.details}
                heading={value.name}
                headingLevel={4}
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
                <ListLayout>
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
                <div>
                    <TextOutput
                        label="Created on"
                        value={dateFormatter.format(new Date(value.createdAt))}
                        description={(
                            <TextOutput
                                label="by"
                                value={value.createdBy.displayName}
                                withoutLabelColon
                            />
                        )}
                    />
                    <TextOutput
                        label="Look for"
                        value={value.lookFor}
                    />
                </div>
                <div className={styles.description}>
                    {value.description}
                </div>
            </Container>
        </InlineLayout>
    );
}

export default ProjectListItem;

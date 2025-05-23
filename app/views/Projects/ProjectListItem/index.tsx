import { FaEdit } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import { isDefined } from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Heading from '#components/Heading';
import ProjectTypeIcon from '#components/ProjectTypeIcon';
import {
    ProjectsListQuery,
    ProjectTypeEnum,
} from '#generated/types/graphql';
import compareIllustration from '#resources/images/compare-illustration.svg';
import findIllustration from '#resources/images/find-illustration.svg';
import validateIllustration from '#resources/images/validate-illustration.svg';
import { getFullAssetUrl } from '#utils/common';

import styles from './styles.module.css';

const projectTypeIllustrations: Record<ProjectTypeEnum, string> = {
    [ProjectTypeEnum.Find]: findIllustration,
    [ProjectTypeEnum.Compare]: compareIllustration,
    [ProjectTypeEnum.Completeness]: validateIllustration,
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
        <div className={styles.meta}>
            {icon}
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

interface Props {
    value: ProjectsListQuery['projects']['results'][number];
}

function ProjectListItem(props: Props) {
    const {
        value,
    } = props;

    return (
        <section className={styles.projectListItem}>
            <img
                className={styles.image}
                alt=""
                src={isDefined(value.image)
                    ? value.image.file.url
                    : projectTypeIllustrations[value.projectType]}
            />
            <div className={styles.details}>
                <div className={styles.header}>
                    <Heading
                        className={styles.heading}
                        level={3}
                    >
                        {value.name}
                    </Heading>
                    <div className={styles.actions}>
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
                    </div>
                </div>
                <div className={styles.description}>
                    {value.description}
                </div>
                <div className={styles.metaList}>
                    <Meta
                        icon={<ProjectTypeIcon type={value.projectType} />}
                        label={value.projectType}
                    />
                    <Meta
                        icon={<GoOrganization />}
                        label={value.requestingOrganization.name}
                    />
                    <Meta
                        label={value.status}
                    />
                </div>
            </div>
        </section>
    );
}

export default ProjectListItem;

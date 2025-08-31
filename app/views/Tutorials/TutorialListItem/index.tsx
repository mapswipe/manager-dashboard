import { useState } from 'react';
import {
    PiCalendar,
    PiCaretDown,
    PiCaretUp,
    PiFlag,
    PiInfo,
    PiMapPin,
    PiTextT,
    PiUser,
} from 'react-icons/pi';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Button from '#components/Button';
import Container from '#components/Container';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import ProjectTypeOutput from '#components/domain/ProjectTypeOutput';
import TutorialStatusOutput from '#components/domain/TutorialStatusOutput';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import OverflowMenu from '#components/OverflowMenu';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import { TutorialsListQuery } from '#generated/types/graphql';
import TutorialActions from '#views/EditTutorial/TutorialActions';

import styles from './styles.module.css';

interface Props {
    value: TutorialsListQuery['tutorials']['results'][number];
}

function TutorialListItem(props: Props) {
    const {
        value: {
            id,
            status,
            name,
            createdAt,
            createdBy,
            clientId,
            firebaseId,
            projectId,
            project,
        },
    } = props;

    const [showDetails, setShowDetails] = useState(false);

    return (
        <Container
            className={styles.tutorialListItem}
            contentLayout="block"
            spacing="lg"
            withBackground
            withPadding
            withShadow
            heading={(
                <SmartLink
                    route={routes.editTutorial}
                    attrs={{ id }}
                    withoutPadding
                    colorVariant="primary"
                    withLinkIcon
                >
                    {name}
                </SmartLink>
            )}
            headingLevel={4}
            headerActions={(
                <OverflowMenu persistent>
                    <TutorialActions
                        clientId={clientId}
                        status={status}
                        tutorialId={id}
                        buttonStyleVariant="transparent"
                    />
                </OverflowMenu>
            )}
            headerDescription={(
                <ListLayout withWrap>
                    <Tag>
                        <TutorialStatusOutput
                            value={status}
                        />
                    </Tag>
                    <Tag>
                        <ProjectTypeOutput
                            value={project.projectType}
                        />
                    </Tag>
                </ListLayout>
            )}
            footerActions={(
                <Button
                    name={!showDetails}
                    styleVariant="transparent"
                    withoutPadding
                    start={showDetails ? <PiCaretUp /> : <PiCaretDown />}
                    onClick={setShowDetails}
                    spacing="sm"
                >
                    {showDetails ? 'Hide details' : 'Show details'}
                </Button>
            )}
        >
            <ListLayout
                layout="grid"
                spacing="sm"
            >
                <GridLayoutItem columnSpan={2}>
                    <TextOutput
                        icon={<PiInfo />}
                        label="Instruction"
                        value={project.projectInstruction}
                        withCenterAlign
                    />
                </GridLayoutItem>
                <TextOutput
                    icon={<PiMapPin />}
                    label="Region"
                    value={project.region}
                    withWrap
                    withCenterAlign
                />
                <TextOutput
                    icon={<PiFlag />}
                    label="Organization"
                    value={project.requestingOrganization.name}
                />
                <TextOutput
                    icon={<PiCalendar />}
                    label="Create on"
                    value={createdAt}
                    valueType="date"
                    withCenterAlign
                />
                <TextOutput
                    icon={<PiUser />}
                    label="Created by"
                    value={createdBy.displayName}
                    withCenterAlign
                />
                <GridLayoutItem columnSpan={2}>
                    <TextOutput
                        icon={<PiTextT />}
                        label="Firebase ID"
                        value={firebaseId}
                        withCenterAlign
                    />
                </GridLayoutItem>
            </ListLayout>
            {showDetails && (
                <>
                    <div />
                    <ProjectSpecificDetails
                        projectId={projectId}
                    />
                </>
            )}
        </Container>
    );
}

export default TutorialListItem;

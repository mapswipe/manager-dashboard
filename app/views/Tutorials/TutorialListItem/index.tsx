import {
    useContext,
    useState,
} from 'react';
import {
    PiArrowsClockwise,
    PiCalendar,
    PiCaretDown,
    PiCaretUp,
    PiFlag,
    PiInfo,
    PiMapPin,
    PiUser,
} from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import Button from '#components/Button';
import Container from '#components/Container';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import ProjectTypeOutput from '#components/domain/ProjectTypeOutput';
import TutorialStatusOutput from '#components/domain/TutorialStatusOutput';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import OverflowMenu from '#components/OverflowMenu';
import PopupButton from '#components/PopupButton';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import EnumsContext from '#contexts/EnumsContext';
import {
    TutorialsListQuery,
    TutorialStatusEnum,
} from '#generated/types/graphql';
import { getInstruction } from '#utils/common';
import TutorialActions from '#views/EditTutorial/TutorialActions';

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
            firebasePushStatus,
            firebaseLastPushed,
        },
    } = props;

    const [showDetails, setShowDetails] = useState(false);
    const { firebasePushStatusMapping } = useContext(EnumsContext);

    return (
        <Container
            contentLayout="block"
            spacing="lg"
            withBackground
            withPadding
            withShadow
            heading={(
                <SmartLink
                    route="editTutorial"
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
                        withFullWidth
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
                        value={getInstruction(
                            project.projectInstruction,
                            project.lookFor,
                            project.projectType,
                        )}
                        withCenterAlign
                        withWrap
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
                    withWrap
                />
                <TextOutput
                    icon={<PiCalendar />}
                    label="Create on"
                    value={createdAt}
                    valueType="date"
                    withCenterAlign
                    withWrap
                />
                <TextOutput
                    icon={<PiUser />}
                    label="Created by"
                    value={createdBy.displayName}
                    withCenterAlign
                    withWrap
                />
                {(status === TutorialStatusEnum.PublishingFailed
                    || status === TutorialStatusEnum.ReadyToPublish
                    || status === TutorialStatusEnum.Published
                    || status === TutorialStatusEnum.Archived
                ) && (
                    <GridLayoutItem columnSpan={2}>
                        <TextOutput
                            label="Firebase ID"
                            value={firebaseId}
                            withWrap
                            description={(
                                <PopupButton
                                    label={<PiInfo />}
                                    withoutPadding
                                    withoutDropdownIcon
                                    styleVariant="transparent"
                                    preferredWidth="18rem"
                                >
                                    <TextOutput
                                        icon={<PiArrowsClockwise />}
                                        label="Firebase last synced"
                                        value={firebaseLastPushed}
                                        withCenterAlign
                                        withWrap
                                        valueType="date"
                                    />
                                    <TextOutput
                                        label="Firebase push status"
                                        value={isDefined(firebasePushStatus)
                                            ? firebasePushStatusMapping?.[firebasePushStatus].label
                                            : undefined}
                                        withCenterAlign
                                        withWrap
                                        icon={<PiCalendar />}
                                    />
                                </PopupButton>
                            )}
                        />
                    </GridLayoutItem>
                )}
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

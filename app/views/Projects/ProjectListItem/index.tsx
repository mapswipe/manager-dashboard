import {
    useContext,
    useState,
} from 'react';
import {
    PiArrowsClockwise,
    PiCalendar,
    PiFlag,
    PiInfo,
    PiLock,
    PiMapPin,
    PiStar,
    PiUser,
    PiUsersThree,
} from 'react-icons/pi';
import { isDefined } from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import Container from '#components/Container';
import Description from '#components/Description';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import ProjectStatusOutput from '#components/domain/ProjectStatusOutput';
import ProjectTypeOutput from '#components/domain/ProjectTypeOutput';
import ExpandableContainer from '#components/ExpandableContainer';
import GridLayoutItem from '#components/GridLayoutItem';
import ImagePreview from '#components/ImagePreview';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import MarkdownPreview from '#components/MarkdownPreview';
import OverflowMenu from '#components/OverflowMenu';
import PopupButton from '#components/PopupButton';
import ProgressBar from '#components/ProgressBar';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import EnumsContext from '#contexts/EnumsContext';
import {
    ProjectsListQuery,
    ProjectStatusEnum,
} from '#generated/types/graphql';
import { getInstruction } from '#utils/common';
import ProjectActions from '#views/EditProject/ProjectActions';

interface Props {
    value: ProjectsListQuery['projects']['results'][number];
}

function ProjectListItem(props: Props) {
    const { value } = props;
    const [showDetails, setShowDetails] = useState(false);
    const { firebasePushStatusMapping } = useContext(EnumsContext);

    return (
        <ExpandableContainer
            name={undefined}
            isExpanded={showDetails}
            onExpansionChange={setShowDetails}
            contentLayout="block"
            withBackground
            withPadding
            withShadow
            spacing="lg"
            alwaysVisibleContent={(
                <ListLayout
                    layout="grid"
                    numPreferredGridColumns={4}
                    minGridColumnSize="10rem"
                >
                    <ImagePreview
                        src={value.image?.file?.url}
                        alt=""
                    />
                    <GridLayoutItem columnSpan={3}>
                        <Container
                            headingLevel={4}
                            heading={(
                                <SmartLink
                                    route="editProject"
                                    attrs={{
                                        id: value.id,
                                    }}
                                    withoutPadding
                                    colorVariant="primary"
                                    withLinkIcon
                                >
                                    {value.name}
                                </SmartLink>
                            )}
                            headerDescription={(
                                <ListLayout>
                                    <Tag>
                                        <ProjectTypeOutput value={value.projectType} />
                                    </Tag>
                                    <Tag>
                                        <ProjectStatusOutput value={value.status} />
                                    </Tag>
                                    {isDefined(value.team) && (
                                        <Tag>
                                            <InlineLayout
                                                start={<PiLock />}
                                                spacingOffset={-2}
                                                withCenterAlign
                                            >
                                                Private
                                            </InlineLayout>
                                        </Tag>
                                    )}
                                    {value.isFeatured && (
                                        <Tag>
                                            <InlineLayout
                                                start={<PiStar />}
                                                spacingOffset={-2}
                                                withCenterAlign
                                            >
                                                Featured
                                            </InlineLayout>
                                        </Tag>
                                    )}
                                    {(value.status === ProjectStatusEnum.Published
                                        || value.status === ProjectStatusEnum.Paused) && (
                                        <ProgressBar
                                            total={1}
                                            value={value.progress}
                                        />
                                    )}
                                </ListLayout>
                            )}
                            contentLayout="block"
                            headerActions={(value.status !== ProjectStatusEnum.Discarded
                                && value.status !== ProjectStatusEnum.Withdrawn) && (
                                <OverflowMenu persistent>
                                    <ProjectActions
                                        clientId={value.clientId}
                                        status={value.status}
                                        projectId={value.id}
                                        buttonStyleVariant="transparent"
                                    />
                                </OverflowMenu>
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
                                            value.projectInstruction,
                                            value.lookFor,
                                            value.projectType,
                                        )}
                                        withWrap
                                        withCenterAlign
                                    />
                                </GridLayoutItem>
                                <TextOutput
                                    icon={<PiMapPin />}
                                    label="Region"
                                    value={value.region}
                                    withWrap
                                    withCenterAlign
                                />
                                <TextOutput
                                    icon={<PiFlag />}
                                    label="Organization"
                                    value={value.requestingOrganization.name}
                                    withWrap
                                    withCenterAlign
                                />
                                <TextOutput
                                    icon={<PiCalendar />}
                                    label="Created on"
                                    value={value.createdAt}
                                    valueType="date"
                                    withWrap
                                    withCenterAlign
                                />
                                <TextOutput
                                    icon={<PiUser />}
                                    label="Created by"
                                    value={value.createdBy.displayName}
                                    withWrap
                                    withCenterAlign
                                />
                                {isDefined(value.team) && (
                                    <TextOutput
                                        icon={<PiUsersThree />}
                                        label="Team"
                                        value={value.team.name}
                                        withCenterAlign
                                    />
                                )}
                            </ListLayout>
                            {showDetails && (
                                <>
                                    {isDefined(value.tutorial) && (
                                        <TextOutput
                                            label="Tutorial"
                                            value={(
                                                <SmartLink
                                                    route="editTutorial"
                                                    attrs={{ id: value.tutorial.id }}
                                                    withLinkIcon
                                                    withoutPadding
                                                    spacing="xs"
                                                >
                                                    {value.tutorial.name}
                                                </SmartLink>
                                            )}
                                        />
                                    )}
                                    <ListLayout
                                        layout="grid"
                                        spacing="sm"
                                    >
                                        <TextOutput
                                            label="Required results"
                                            value={value.requiredResults}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            label="Group size"
                                            value={value.groupSize}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            label="Verification number"
                                            value={value.verificationNumber}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            label="Number of contributors"
                                            value={value.contributorsCount}
                                            valueType="number"
                                        />
                                    </ListLayout>
                                    {(value.status === ProjectStatusEnum.PublishingFailed
                                        || value.status === ProjectStatusEnum.Published
                                        || value.status === ProjectStatusEnum.Paused
                                        || value.status === ProjectStatusEnum.Finished
                                        || value.status === ProjectStatusEnum.Withdrawn
                                    ) && (
                                        <GridLayoutItem columnSpan={2}>
                                            <TextOutput
                                                label="Firebase ID"
                                                value={value.firebaseId}
                                                withWrap
                                                description={(
                                                    <PopupButton
                                                        label={<PiInfo />}
                                                        withoutPadding
                                                        withoutDropdownIcon
                                                        styleVariant="transparent"
                                                    >
                                                        <TextOutput
                                                            icon={<PiArrowsClockwise />}
                                                            label="Firebase last synced"
                                                            value={value.firebaseLastPushed}
                                                            withCenterAlign
                                                            valueType="date"
                                                        />
                                                        <TextOutput
                                                            label="Firebase push status"
                                                            // eslint-disable-next-line max-len
                                                            value={isDefined(value.firebasePushStatus)
                                                                // eslint-disable-next-line max-len
                                                                ? firebasePushStatusMapping?.[value.firebasePushStatus].label
                                                                : undefined}
                                                            withCenterAlign
                                                            icon={<PiCalendar />}
                                                        />
                                                    </PopupButton>
                                                )}
                                            />
                                        </GridLayoutItem>
                                    )}

                                    {isDefined(value.description) && (
                                        <Description>
                                            <MarkdownPreview markdown={value.description} />
                                        </Description>
                                    )}
                                </>
                            )}
                        </Container>
                    </GridLayoutItem>
                </ListLayout>
            )}
        >
            <ProjectSpecificDetails
                projectId={value.id}
                withWelledContent
                spacing="lg"
            />
        </ExpandableContainer>
    );
}

export default ProjectListItem;

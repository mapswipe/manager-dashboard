import {
    PiArrowSquareOut,
    PiCalendar,
    PiHandSwipeLeft,
    PiMapTrifold,
    PiTimer,
    PiUser,
} from 'react-icons/pi';
import { RiFirebaseLine } from 'react-icons/ri';
import { isDefined } from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import Container from '#components/Container';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import { ContributorUserType } from '#generated/types/graphql';

interface Props {
    value: ContributorUserType;
    compact?: boolean;
}

function ContributorUserCard(props: Props) {
    const {
        value: {
            username,
            communityDashboardUrl,
            createdAt,
            firebaseId,
            totalSwipes,
            totalSwipeTime,
            totalMappingProjects,
        },
        compact,
    } = props;

    return (
        <Container
            heading={username}
            withShadow
            withBackground
            withPadding
            headingLevel={5}
            headerIcons={<PiUser />}
            contentLayout="block"
            withHeaderBorder
            headerActions={(
                <a
                    href={communityDashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ButtonLayout
                        end={<PiArrowSquareOut />}
                        styleVariant={compact ? 'action' : 'translucent'}
                        spacing="sm"
                    >
                        View profile
                    </ButtonLayout>
                </a>
            )}
        >
            <ListLayout
                spacing="sm"
                layout="block"
            >
                {isDefined(createdAt) && (
                    <TextOutput
                        icon={<PiCalendar />}
                        label="Created on"
                        value={createdAt}
                        valueType="date"
                        withCenterAlign
                    />
                )}
                <GridLayoutItem colSpan={3}>
                    <TextOutput
                        withWrap
                        withCenterAlign
                        icon={<RiFirebaseLine />}
                        label="Firebase ID"
                        value={firebaseId}
                    />
                </GridLayoutItem>
            </ListLayout>
            <ListLayout
                layout={compact ? 'block' : 'grid'}
                minGridColumnSize="12rem"
                spacing="sm"
                numPreferredGridColumns={3}
            >
                <TextOutput
                    icon={<PiHandSwipeLeft />}
                    label="Total swipes"
                    value={totalSwipes}
                    valueType="number"
                    withCenterAlign
                />
                <TextOutput
                    icon={<PiTimer />}
                    label="Time spent"
                    value={totalSwipeTime}
                    valueType="number"
                    withCenterAlign
                />
                <TextOutput
                    icon={<PiMapTrifold />}
                    label="Projects contributed"
                    value={totalMappingProjects}
                    valueType="number"
                    withCenterAlign
                />
            </ListLayout>
        </Container>
    );
}

export default ContributorUserCard;

import {
    PiArrowSquareOut,
    PiUser,
} from 'react-icons/pi';
import { gql } from 'urql';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import PageLayout from '#components/PageLayout';
import TextOutput from '#components/TextOutput';
import { useContributorUserListQuery } from '#generated/types/graphql';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CONTRIBUTOR_USER_QUERY = gql`
query ContributorUserList($filters: ContributorUserFilter, $pagination: OffsetPaginationInput) {
    contributorUsers(pagination: $pagination, filters: $filters) {
        totalCount
        results {
            firebaseId
            id
            createdAt
            communityDashboardUrl
            totalMappingProjects
            totalSwipeTime
            totalSwipes
            username
        }
    }
}
`;

interface Props {
    className?: string;
}

function Contributors(props: Props) {
    const { className } = props;

    const [{
        data: contributorUsersResponse,
    }] = useContributorUserListQuery({
        variables: {
            pagination: {
                offset: 0,
                limit: 5,
            },
        },
    });

    return (
        <PageLayout
            heading="Contributors"
            className={className}
        >
            <ListLayout
                layout="grid"
                numPreferredGridColumns={3}
            >
                {contributorUsersResponse?.contributorUsers.results.map((contributor) => (
                    <Container
                        heading={contributor.username}
                        withShadow
                        withBackground
                        withPadding
                        headingLevel={5}
                        headerIcons={<PiUser />}
                        contentLayout="block"
                        headerActions={(
                            <a href={contributor.communityDashboardUrl}>
                                <PiArrowSquareOut />
                            </a>
                        )}
                    >
                        <ListLayout layout="block" spacing="xs">
                            <TextOutput
                                label="Created on"
                                value={contributor.createdAt}
                                valueType="date"
                            />
                            <TextOutput
                                label="Firebase ID"
                                value={contributor.firebaseId}
                            />
                        </ListLayout>
                        <ListLayout
                            layout="grid"
                            minGridColumnSize="10rem"
                            spacing="sm"
                        >
                            <TextOutput
                                label="Total swipes"
                                value={contributor.totalSwipes}
                                valueType="number"
                            />
                            <TextOutput
                                label="Time spent"
                                value={contributor.totalSwipeTime}
                                valueType="number"
                            />
                            <TextOutput
                                label="Projects contributed"
                                value={contributor.totalMappingProjects}
                                valueType="number"
                            />
                        </ListLayout>
                    </Container>
                ))}
            </ListLayout>
        </PageLayout>
    );
}

export default Contributors;

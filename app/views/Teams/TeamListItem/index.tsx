import {
    IoCalendar,
    IoPerson,
} from 'react-icons/io5';

import Container from '#components/Container';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import { TeamsListQuery } from '#generated/types/graphql';

interface Props {
    value: TeamsListQuery['contributorTeams']['results'][number];
}

function TeamListItem(props: Props) {
    const {
        value,
    } = props;

    return (
        <Container
            contentLayout="block"
            spacing="lg"
            withBackground
            withPadding
            withShadow
        >
            <ListLayout
                layout="grid"
                numPreferredGridColumns={4}
                minGridColumnSize="9rem"
                spacing="lg"
            >
                <GridLayoutItem columnSpan={4}>
                    <Container
                        heading={value.name}
                        headingLevel={3}
                    >
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
                        </ListLayout>
                    </Container>
                </GridLayoutItem>
            </ListLayout>
        </Container>
    );
}

export default TeamListItem;

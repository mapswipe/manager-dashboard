import { FaEdit } from 'react-icons/fa';
import {
    IoCalendar,
    IoPerson,
} from 'react-icons/io5';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Container from '#components/Container';
import GridLayoutItem from '#components/GridLayoutItem';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import { TutorialsListQuery } from '#generated/types/graphql';

import styles from './styles.module.css';

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
    value: TutorialsListQuery['tutorials']['results'][number];
}

function TutorialListItem(props: Props) {
    const {
        value,
    } = props;

    return (
        <Container
            className={styles.tutorialListItem}
            contentLayout="block"
            spacing="lg"
            withBackground
            withPadding
            withShadow
        >
            <ListLayout
                className={styles.basicDetails}
                layout="grid"
                numPreferredGridColumns={4}
                minGridColumnSize="9rem"
                spacing="lg"
            >
                <GridLayoutItem columnSpan={4}>
                    <Container
                        heading={value.name}
                        headingLevel={3}
                        headerActions={(
                            <SmartLink
                                route={routes.editTutorial}
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
                        </ListLayout>
                    </Container>
                </GridLayoutItem>
            </ListLayout>
        </Container>
    );
}

export default TutorialListItem;

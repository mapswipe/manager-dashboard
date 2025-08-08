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
    id: string;
    status: string;
    name: string;
    createdAt: string;
    createdBy: string;
}

function TutorialListItem(props: Props) {
    const {
        id,
        status,
        name,
        createdAt,
        createdBy,
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
                        heading={name}
                        headingLevel={5}
                        headerActions={(
                            <SmartLink
                                route={routes.editTutorial}
                                attrs={{ id }}
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
                                label={status}
                            />
                        </ListLayout>
                        <ListLayout withWrap>
                            <TextOutput
                                icon={<IoCalendar />}
                                label="Created on"
                                value={createdAt}
                                valueType="date"
                            />
                            <TextOutput
                                icon={<IoPerson />}
                                label="Created by"
                                value={createdBy}
                            />
                        </ListLayout>
                    </Container>
                </GridLayoutItem>
            </ListLayout>
        </Container>
    );
}

export default TutorialListItem;

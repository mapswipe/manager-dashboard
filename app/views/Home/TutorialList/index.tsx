import { useState } from 'react';
import { CgCollage } from 'react-icons/cg';
import { FaEdit } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import { gql } from 'urql';

import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import Pager from '#components/Pager';
import { useTutorialListQuery } from '#generated/types/graphql';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TUTORIAL_LIST_QUERY = gql`
query TutorialList($pagination: OffsetPaginationInput!) {
    tutorials(pagination: $pagination, includeAll: true) {
        totalCount
        results {
            name
            id
        }
    }
}
`;

interface Props {
    className?: string;
}

function TutorialList(props: Props) {
    const { className } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const [{
        data: tutorialListResponse,
        fetching: tutorialListPending,
    }] = useTutorialListQuery({
        variables: {
            pagination: {
                offset: (activePage - 1) * pagePerItem,
                limit: pagePerItem,
            },
        },
    });

    const tutorialList = tutorialListResponse?.tutorials.results ?? [];
    const totalItems = tutorialListResponse?.tutorials.totalCount ?? 0;

    return (
        <Container
            className={className}
            heading="Tutorials"
            headingLevel={2}
            pending={tutorialListPending}
            empty={tutorialList.length === 0}
            withHeaderBorder
            withFooterBorder
            withPadding
            withBackground
            withShadow
            spacing="lg"
            headerActions={(
                <SmartLink
                    route={routes.newTutorial}
                    start={<IoAdd />}
                    withoutPadding
                >
                    New Tutorial
                </SmartLink>
            )}
            footerActions={(
                <Pager
                    pagePerItem={pagePerItem}
                    onPagePerItemChange={setPagePerItem}
                    activePage={activePage}
                    onActivePageChange={setActivePage}
                    totalItems={totalItems}
                    pagePerItemOptions={defaultPagePerItemOptions}
                />
            )}
        >
            {tutorialList.map((tutorial) => (
                <InlineLayout
                    key={tutorial.id}
                    start={<CgCollage />}
                    end={(
                        <SmartLink
                            route={routes.editTutorial}
                            attrs={{
                                id: tutorial.id,
                            }}
                            start={<FaEdit />}
                            spacing="sm"
                            withoutPadding
                        >
                            Edit
                        </SmartLink>
                    )}
                >
                    {tutorial.name}
                </InlineLayout>
            ))}
        </Container>
    );
}

export default TutorialList;

import { useState } from 'react';
import { CgOrganisation } from 'react-icons/cg';

import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import Pager from '#components/Pager';
import useOrganizationListQuery from '#hooks/useOrganizationListQuery';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

interface Props {
    className?: string;
}

function OrganizationList(props: Props) {
    const { className } = props;

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const {
        data: organizationListResponse,
        loading: organizationListPending,
    } = useOrganizationListQuery({
        offset: (activePage - 1) * pagePerItem,
        limit: pagePerItem,
    });

    const organizationList = organizationListResponse?.organizations.results ?? [];
    const totalItems = organizationListResponse?.organizations.totalCount ?? 0;

    return (
        <Container
            className={className}
            heading="Organizations"
            headingLevel={2}
            pending={organizationListPending}
            empty={organizationList.length === 0}
            withHeaderBorder
            withFooterBorder
            withPadding
            spacing="lg"
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
            {organizationList.map((organization) => (
                <InlineLayout
                    key={organization.id}
                    start={<CgOrganisation />}
                >
                    {organization.name}
                </InlineLayout>
            ))}
        </Container>
    );
}

export default OrganizationList;

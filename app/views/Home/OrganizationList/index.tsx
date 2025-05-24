import {
    useCallback,
    useState,
} from 'react';
import { CgOrganisation } from 'react-icons/cg';
import { IoAdd } from 'react-icons/io5';

import Button from '#components/Button';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import Pager from '#components/Pager';
import useBooleanState from '#hooks/useBooleanState';
import useOrganizationListQuery from '#hooks/useOrganizationListQuery';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

import OrganizationFormModal from './OrganizationFormModal';

interface Props {
    className?: string;
}

function OrganizationList(props: Props) {
    const { className } = props;
    const [
        showAddModal,
        setShowAddModalTrue,
        setShowAddModalFalse,
    ] = useBooleanState(false);

    const [activePage, setActivePage] = useState(DEFAULT_PAGE);
    const [pagePerItem, setPagePerItem] = useState(DEFAULT_PAGE_SIZE);

    const {
        previousData: previousOrganizationListResponse,
        data: organizationListResponse = previousOrganizationListResponse,
        loading: organizationListPending,
        refetch: refetchOrganization,
    } = useOrganizationListQuery({
        offset: (activePage - 1) * pagePerItem,
        limit: pagePerItem,
    });

    const handleOrganizationModalUpdate = useCallback(() => {
        setShowAddModalFalse();
        refetchOrganization();
    }, [refetchOrganization, setShowAddModalFalse]);

    const organizationList = organizationListResponse?.organizations.results ?? [];
    const totalItems = organizationListResponse?.organizations.totalCount ?? 0;

    return (
        <>
            <Container
                className={className}
                heading="Organizations"
                headingLevel={2}
                pending={organizationListPending}
                empty={organizationList.length === 0}
                withHeaderBorder
                withFooterBorder
                withBackground
                withPadding
                withShadow
                spacing="lg"
                headerActions={(
                    <Button
                        name={undefined}
                        styleVariant="transparent"
                        colorVariant="accent"
                        start={<IoAdd />}
                        onClick={setShowAddModalTrue}
                        withoutPadding
                    >
                        Add
                    </Button>
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
                {organizationList.map((organization) => (
                    <InlineLayout
                        key={organization.id}
                        start={<CgOrganisation />}
                    >
                        {organization.name}
                    </InlineLayout>
                ))}
            </Container>
            {showAddModal && (
                <OrganizationFormModal
                    onClose={setShowAddModalFalse}
                    onUpdate={handleOrganizationModalUpdate}
                />
            )}
        </>
    );
}

export default OrganizationList;

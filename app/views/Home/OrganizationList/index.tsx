import {
    useCallback,
    useState,
} from 'react';
import { CgOrganisation } from 'react-icons/cg';
import { FaEdit } from 'react-icons/fa';
import {
    IoAdd,
    IoCalendar,
    IoPerson,
} from 'react-icons/io5';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import Pager from '#components/Pager';
import TextOutput from '#components/TextOutput';
import { useOrganizationListQuery } from '#generated/types/graphql';
import useBooleanState from '#hooks/useBooleanState';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
} from '#utils/common';

import OrganizationFormModal from './OrganizationFormModal';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ORGANIZATION_LIST_QUERY = gql`
query OrganizationList($pagination: OffsetPaginationInput!) {
    organizations(pagination: $pagination) {
        totalCount
        results {
            name
            id
            modifiedBy {
                id
                displayName
            }
            modifiedAt
        }
    }
}
`;

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
    const [editOrganizationId, setEditOrganizationId] = useState<string | undefined>();

    const [
        {
            data: organizationListResponse,
            fetching: organizationListPending,
        },
        refetchOrganization,
    ] = useOrganizationListQuery({
        variables: {
            pagination: {
                offset: (activePage - 1) * pagePerItem,
                limit: pagePerItem,
            },
        },
    });

    const handleOrganizationModalUpdate = useCallback(() => {
        setEditOrganizationId(undefined);
        setShowAddModalFalse();
        refetchOrganization();
    }, [refetchOrganization, setShowAddModalFalse]);

    const organizationList = organizationListResponse?.organizations.results ?? [];
    const totalItems = organizationListResponse?.organizations.totalCount ?? 0;

    return (
        <>
            <Container
                className={_cs(styles.organizationList, className)}
                heading="Organizations"
                headingLevel={2}
                pending={organizationListPending}
                empty={organizationList.length === 0}
                withHeaderBorder
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
                <ListLayout
                    layout="grid"
                    numPreferredGridColumns={3}
                >
                    {organizationList.map((organization) => (
                        <Container
                            key={organization.id}
                            className={styles.organizationItem}
                            heading={organization.name}
                            headerIcons={<CgOrganisation className={styles.orgIcon} />}
                            headingLevel={4}
                            withBackground
                            withPadding
                            withShadow
                            headerActions={(
                                <Button
                                    name={organization.id}
                                    colorVariant="accent"
                                    styleVariant="transparent"
                                    withoutPadding
                                    className={styles.editButton}
                                    onClick={setEditOrganizationId}
                                >
                                    <FaEdit />
                                </Button>
                            )}
                        >
                            <ListLayout
                                spacing="xs"
                                layout="block"
                            >
                                <TextOutput
                                    icon={<IoCalendar />}
                                    label="Updated on"
                                    value={organization.modifiedAt}
                                    valueType="date"
                                />
                                <TextOutput
                                    icon={<IoPerson />}
                                    label="Updated by"
                                    value={organization.modifiedBy.displayName}
                                />
                            </ListLayout>
                        </Container>
                    ))}
                </ListLayout>
            </Container>
            {showAddModal && (
                <OrganizationFormModal
                    onClose={setShowAddModalFalse}
                    onUpdate={handleOrganizationModalUpdate}
                />
            )}
            {isDefined(editOrganizationId) && (
                <OrganizationFormModal
                    organizationId={editOrganizationId}
                    onClose={setEditOrganizationId}
                    onUpdate={handleOrganizationModalUpdate}
                />
            )}
        </>
    );
}

export default OrganizationList;

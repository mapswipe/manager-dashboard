import {
    useCallback,
    useState,
} from 'react';
import { CgOrganisation } from 'react-icons/cg';
import { IoTrashBin } from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import Pager from '#components/Pager';
import PendingMessage from '#components/PendingMessage';
import useOrganizationListQuery from '#hooks/useOrganizationListQuery';
import { defaultPagePerItemOptions } from '#utils/common';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function OrganisationList(props: Props) {
    const { className } = props;
    const [orgKeyToRemove, setOrgKeyToRemove] = useState<string | undefined>(undefined);

    const [activePage, setActivePage] = useState(1);
    const [pagePerItem, setPagePerItem] = useState(2);

    const {
        data: organizationListResponse,
        loading: organizationListPending,
    } = useOrganizationListQuery({
        offset: (activePage - 1) * pagePerItem,
        limit: pagePerItem,
    });

    const organisationList = organizationListResponse?.organizations.results ?? [];
    const totalItems = organizationListResponse?.organizations.totalCount ?? 0;

    const removeOrganisation = useCallback(
        async (orgId: string) => {
            console.info('Remove not implemented yet!', orgId);
        },
        [],
    );

    return (
        <div className={_cs(styles.organisationList, className)}>
            {organizationListPending && (
                <PendingMessage />
            )}
            {!organizationListPending && organisationList
                && organisationList.length > 0 && (
                <div className={styles.list}>
                    {organisationList.map((organization) => (
                        <div
                            className={styles.organisation}
                            key={organization.id}
                        >
                            <div className={styles.heading}>
                                <CgOrganisation className={styles.icon} />
                                <div className={styles.name}>
                                    {organization.name}
                                </div>
                                <Button
                                    disabled={!!orgKeyToRemove}
                                    className={styles.removeButton}
                                    name={organization.id}
                                    icons={<IoTrashBin />}
                                    variant="action"
                                    onClick={setOrgKeyToRemove}
                                >
                                    Remove
                                </Button>
                            </div>
                            {/* organization.description && (
                                <div className={styles.description}>
                                    {organization.description}
                                </div>
                            ) */}
                        </div>
                    ))}
                </div>
            )}
            {!organizationListPending && (!organisationList
                || organisationList.length === 0) && (
                <div className={styles.emptyList}>
                    No organisations yet!
                </div>
            )}
            {!organizationListPending && totalItems > 0 && (
                <div className={styles.footerActions}>
                    <Pager
                        pagePerItem={pagePerItem}
                        onPagePerItemChange={setPagePerItem}
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        totalItems={totalItems}
                        pagePerItemOptions={defaultPagePerItemOptions}
                    />
                </div>
            )}
            {orgKeyToRemove && (
                <Modal
                    className={styles.removeConfirmation}
                    heading="Remove Organisation"
                    footerClassName={styles.confirmationActions}
                    closeButtonHidden
                    footer={(
                        <>
                            <Button
                                name={undefined}
                                onClick={setOrgKeyToRemove}
                                variant="action"
                            >
                                Cancel
                            </Button>
                            <Button
                                name={orgKeyToRemove}
                                onClick={removeOrganisation}
                            >
                                Yes
                            </Button>
                        </>
                    )}
                >
                    Are you sure you want to remove the Organisation?
                </Modal>
            )}
        </div>
    );
}

export default OrganisationList;

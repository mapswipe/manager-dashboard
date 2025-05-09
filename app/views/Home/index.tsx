import { useState } from 'react';
import {
    IoChevronDown,
    IoChevronUp,
} from 'react-icons/io5';
import { Link } from 'react-router';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Heading from '#components/Heading';
import useBooleanState from '#hooks/useBooleanState';

import OrganisationList from './OrganizationList';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function Home(props: Props) {
    const { className } = props;

    const [
        showOrganisationFormModal,
        setShowOrganisationFormModalTrue,
        setShowOrganisationFormModalFalse,
    ] = useBooleanState(false);

    const [showOrganisationList, setShowOrganisationList] = useState(false);

    return (
        <div className={_cs(styles.home, className)}>
            <div className={styles.container}>
                <div className={styles.introduction}>
                    <div className={styles.greetings}>
                        <div className={styles.welcome}>
                            Welcome to
                        </div>
                        <div className={styles.appName}>
                            MapSwipe Manager Dashboard
                        </div>
                    </div>
                    <div className={styles.description}>
                        <p>
                            You can set up a new project by setting up project draft through
                            &nbsp;
                            <Link to="/new-project/">
                                New Project
                            </Link>
                            &nbsp;
                            page.
                        </p>
                        <p>
                            You may find some of the useful stuff below.
                        </p>
                    </div>
                </div>
                <div className={styles.organisationContainer}>
                    <div className={styles.header}>
                        <Heading level={2} className={styles.heading}>
                            Organisations
                        </Heading>
                        <Button
                            className={styles.addButton}
                            name={undefined}
                            onClick={setShowOrganisationFormModalTrue}
                            disabled
                        >
                            Add New Organisation
                        </Button>
                    </div>
                    {showOrganisationList && (
                        <OrganisationList className={styles.organisationList} />
                    )}
                    <Button
                        name={!showOrganisationList}
                        actions={showOrganisationList ? <IoChevronUp /> : <IoChevronDown />}
                        onClick={setShowOrganisationList}
                        variant="action"
                    >
                        {showOrganisationList ? 'Hide Organisations' : 'View Organisations'}
                    </Button>
                </div>
            </div>
            {showOrganisationFormModal && (
                <OrganisationFormModal
                    onCloseButtonClick={setShowOrganisationFormModalFalse}
                />
            )}
        </div>
    );
}

export default Home;

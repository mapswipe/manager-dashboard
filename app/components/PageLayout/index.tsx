import { _cs } from '@togglecorp/fujs';

import Heading from '#components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    mainContentClassName?: string;
    heading: React.ReactNode;
    headerIcons?: React.ReactNode;
    headerActions?: React.ReactNode;
    headerDescription?: React.ReactNode;
    aside?: React.ReactNode;
    children: React.ReactNode;
    footerActions?: React.ReactNode;
}

function PageLayout(props: Props) {
    const {
        className,
        heading,
        headerIcons,
        headerActions,
        headerDescription,
        aside,
        children,
        footerActions,
        mainContentClassName,
    } = props;

    return (
        <div className={_cs(styles.pageLayout, className)}>
            <div className={styles.pageHeader}>
                <div className={styles.headingRow}>
                    {headerIcons && (
                        <div className={styles.headerIcons}>
                            {headerIcons}
                        </div>
                    )}
                    <Heading
                        level={1}
                        className={styles.heading}
                    >
                        {heading}
                    </Heading>
                    {headerActions && (
                        <div className={styles.headerActions}>
                            {headerActions}
                        </div>
                    )}
                </div>
                {headerDescription && (
                    <div className={styles.headerDescription}>
                        {headerDescription}
                    </div>
                )}
            </div>
            <div className={styles.contents}>
                {aside && (
                    <aside className={styles.aside}>
                        {aside}
                    </aside>
                )}
                <main className={_cs(styles.main, mainContentClassName)}>
                    {children}
                </main>
            </div>
            {footerActions && (
                <div className={styles.footerActions}>
                    {footerActions}
                </div>
            )}
        </div>
    );
}

export default PageLayout;

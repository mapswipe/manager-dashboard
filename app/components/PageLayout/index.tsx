import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Heading from '#components/Heading';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';

import styles from './styles.module.css';

interface Props {
    className?: string;
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
    } = props;

    return (
        <div className={_cs(styles.pageLayout, className)}>
            <ListLayout
                layout="block"
                className={styles.pageHeader}
            >
                <InlineLayout
                    start={headerIcons}
                    end={headerActions}
                >
                    <Heading
                        level={1}
                        className={styles.heading}
                    >
                        {heading}
                    </Heading>
                </InlineLayout>
                {headerDescription && (
                    <div className={styles.headerDescription}>
                        {headerDescription}
                    </div>
                )}
            </ListLayout>
            <div
                className={_cs(
                    styles.contents,
                    isDefined(aside) && styles.withAside,
                )}
            >
                {aside && (
                    <aside className={styles.aside}>
                        <ListLayout
                            layout="block"
                            spacing="lg"
                            className={styles.asideContent}
                        >
                            {aside}
                        </ListLayout>
                    </aside>
                )}
                <main className={styles.main}>
                    <ListLayout
                        layout="block"
                        spacing="xl"
                    >
                        {children}
                    </ListLayout>
                </main>
            </div>
            {footerActions && (
                <ListLayout className={styles.footerActions}>
                    {footerActions}
                </ListLayout>
            )}
        </div>
    );
}

export default PageLayout;

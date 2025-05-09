import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import EmptyMessage from '#components/EmptyMessage';
import Heading, { type Props as HeadingProps } from '#components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    heading?: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    headerDescription?: React.ReactNode;
    headerIcons?: React.ReactNode;
    headerActions?: React.ReactNode;
    children: React.ReactNode;
    isEmpty?: boolean;
    withHeaderBorder?: boolean;
    contentClassName?: string;
}

function Container(props: Props) {
    const {
        className,
        heading,
        headingLevel,
        headerIcons,
        headerActions,
        headerDescription,
        children,
        isEmpty,
        withHeaderBorder,
        contentClassName,
    } = props;

    const shouldShowHeadingRow = isDefined(heading)
        || isDefined(headerIcons)
        || isDefined(headerActions);
    const shouldShowHeader = shouldShowHeadingRow
        || isDefined(headerDescription);

    return (
        <div className={_cs(styles.container, className)}>
            {shouldShowHeader && (
                <div className={styles.header}>
                    {shouldShowHeadingRow && (
                        <div className={styles.headingRow}>
                            {headerIcons && (
                                <div className={styles.icons}>
                                    {headerIcons}
                                </div>
                            )}
                            <Heading
                                level={headingLevel}
                                className={styles.heading}
                            >
                                {heading}
                            </Heading>
                            <div className={styles.icons}>
                                {headerActions}
                            </div>
                        </div>
                    )}
                    {headerDescription && (
                        <div className={styles.description}>
                            {headerDescription}
                        </div>
                    )}
                </div>
            )}
            {withHeaderBorder && <hr className={styles.headerBorder} />}
            <div className={_cs(styles.content, contentClassName)}>
                {isEmpty && (
                    <EmptyMessage
                        title="No data found!"
                    />
                )}
                {!isEmpty && children}
            </div>
        </div>
    );
}

export default Container;

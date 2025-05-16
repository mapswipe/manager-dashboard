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
    headingDescription?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headerIcons?: React.ReactNode;
    headerActions?: React.ReactNode;
    children: React.ReactNode;
    isEmpty?: boolean;
    withHeaderBorder?: boolean;
    contentClassName?: string;
    spacing?: 'sm' | 'md' | 'lg';
}

function Container(props: Props) {
    const {
        className,
        heading,
        headingDescription,
        headingLevel,
        headerIcons,
        headerActions,
        headerDescription,
        children,
        isEmpty,
        withHeaderBorder,
        contentClassName,
        spacing = 'md',
    } = props;

    const shouldShowHeadingRow = isDefined(heading)
        || isDefined(headingDescription)
        || isDefined(headerIcons)
        || isDefined(headerActions);
    const shouldShowHeader = shouldShowHeadingRow
        || isDefined(headerDescription);

    return (
        <div
            className={_cs(
                styles.container,
                spacing === 'sm' && styles.withSmallSpacing,
                spacing === 'md' && styles.withMediumSpacing,
                spacing === 'lg' && styles.withLargeSpacing,
                className,
            )}
        >
            {shouldShowHeader && (
                <div className={styles.header}>
                    {shouldShowHeadingRow && (
                        <div
                            className={_cs(
                                styles.headingRow,
                                isDefined(headingDescription) && styles.withHeadingDescription,
                            )}
                        >
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
                            {isDefined(headingDescription) && (
                                <div className={styles.headingDescription}>
                                    {headingDescription}
                                </div>
                            )}
                            <div className={styles.icons}>
                                {headerActions}
                            </div>
                        </div>
                    )}
                    {shouldShowHeader && (
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

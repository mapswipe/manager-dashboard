import { RefObject } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import BlockLayout from '#components/BlockLayout';
import Heading, { type Props as HeadingProps } from '#components/Heading';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import Message from '#components/Message';
import useSpacingToken from '#hooks/useSpacingToken';
import {
    fullSpacings,
    gapSpacings,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

export interface ContainerProps {
    className?: string;

    heading?: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    headerDescription?: React.ReactNode;
    headerIcons?: React.ReactNode;
    headerActions?: React.ReactNode;
    withHeaderBorder?: boolean;

    children: React.ReactNode;
    contentClassName?: string;
    contentLayout?: 'inline' | 'block';

    footerIcons?: React.ReactNode;
    footerActions?: React.ReactNode;
    footer?: React.ReactNode;
    withFooterBorder?: boolean;
    withWrapInHeader?: boolean;

    pending?: boolean;
    overlayPending?: boolean;
    empty?: boolean;
    filtered?: boolean;
    errored?: boolean;
    emptyMessage?: React.ReactNode;
    filteredEmptyMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    withoutMessageIcon?: boolean;

    spacing?: SpacingType;
    withPadding?: boolean;
    withContentBackgroundAndPadding?: boolean;
    withBackground?: boolean;
    withShadow?: boolean;
    withMinHeight?: boolean;
    withWelledContent?: boolean;

    elementRef?: RefObject<HTMLDivElement>;
}

function Container(props: ContainerProps) {
    const {
        className,

        heading,
        headingLevel,
        headerIcons,
        headerActions,
        headerDescription,
        withHeaderBorder,
        withWrapInHeader,

        footerIcons,
        footer,
        footerActions,
        withFooterBorder,

        children,
        contentClassName,
        contentLayout = 'block',

        empty,
        filtered,
        pending,
        overlayPending,
        errored,
        emptyMessage,
        filteredEmptyMessage,
        pendingMessage,
        errorMessage,
        withoutMessageIcon,

        spacing,
        withPadding,
        withBackground,
        withShadow,
        withMinHeight,
        withContentBackgroundAndPadding,
        withWelledContent,

        elementRef,
    } = props;

    const shouldShowHeadingRow = isDefined(heading)
        || isDefined(headerIcons)
        || isDefined(headerActions);
    const shouldShowHeader = shouldShowHeadingRow
        || isDefined(headerDescription);

    const shouldShowFooter = isDefined(footer)
        || isDefined(footerIcons)
        || isDefined(footerActions);

    const contentSpacingClassName = useSpacingToken({
        spacing,
        modes: (withContentBackgroundAndPadding || withWelledContent)
            ? fullSpacings
            : gapSpacings,
    });

    return (
        <BlockLayout
            elementRef={elementRef}
            className={_cs(
                styles.container,
                withBackground && styles.withBackground,
                withShadow && styles.withShadow,
                withMinHeight && styles.withMinHeight,
                withWelledContent && styles.withWelledContent,
                className,
            )}
            spacing={spacing}
            withPadding={withPadding}
            start={shouldShowHeader && (
                <ListLayout
                    spacing={spacing}
                    layout="block"
                >
                    {shouldShowHeadingRow && (
                        <InlineLayout
                            spacing={spacing}
                            start={headerIcons}
                            end={headerActions}
                            className={styles.headingRow}
                            withWrap={withWrapInHeader}
                        >
                            <Heading
                                level={headingLevel}
                                className={styles.heading}
                            >
                                {heading}
                            </Heading>
                        </InlineLayout>
                    )}
                    {isDefined(headerDescription) && (
                        <div className={styles.description}>
                            {headerDescription}
                        </div>
                    )}
                </ListLayout>
            )}
            end={shouldShowFooter && (
                <InlineLayout
                    spacing={spacing}
                    start={footerIcons}
                    end={footerActions}
                >
                    {footer}
                </InlineLayout>
            )}
            withStartSeparator={withHeaderBorder}
            withEndSeparator={withFooterBorder}
            childrenContainerClassName={_cs(
                styles.content,
                contentSpacingClassName,
                contentLayout === 'inline' && styles.inlineContent,
                contentLayout === 'block' && styles.blockContent,
                overlayPending && styles.pendingOverlaid,
                withContentBackgroundAndPadding && styles.withBackground,
                contentClassName,
            )}
        >
            {(children || empty || pending || errored || filtered) && (
                <>
                    <Message
                        className={styles.message}
                        pending={pending}
                        filtered={filtered}
                        errored={errored}
                        empty={empty}
                        overlayPending={overlayPending}
                        emptyMessage={emptyMessage}
                        filteredEmptyMessage={filteredEmptyMessage}
                        pendingMessage={pendingMessage}
                        errorMessage={errorMessage}
                        withoutIcon={withoutMessageIcon}
                    />
                    {!empty && !errored && (!pending || overlayPending) && children}
                </>
            )}
        </BlockLayout>
    );
}

export default Container;

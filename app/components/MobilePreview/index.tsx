import {
    IoArrowBack,
    IoInformationCircleOutline,
} from 'react-icons/io5';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import BlockLayout from '#components/BlockLayout';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';

import styles from './styles.module.css';

interface Props {
    className?: string;
    headerDescription?: React.ReactNode;
    heading?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;

    popupTitle?: React.ReactNode;
    popupDescription?: React.ReactNode;
    popupIcons?: React.ReactNode;
    contentClassName?: string;
    popupClassName?: string;
    popupVerticalPosition?: 'top' | 'center';
    popupVariant?: 'default' | 'success';
}

function MobilePreview(props: Props) {
    const {
        className,
        headerDescription,
        heading,
        actions,
        children,
        popupTitle,
        popupDescription,
        popupIcons,
        contentClassName,
        popupClassName,
        popupVerticalPosition,
        popupVariant = 'default',
    } = props;

    return (
        <div className={_cs(styles.mobilePreview, className)}>
            <BlockLayout
                className={styles.container}
                start={(
                    <>
                        <div className={styles.statusBar} />
                        <InlineLayout
                            className={styles.header}
                            spacing="sm"
                            start={(
                                <IoArrowBack className={styles.backIcon} />
                            )}
                            end={(
                                <>
                                    {actions}
                                    <IoInformationCircleOutline className={styles.infoIcon} />
                                </>
                            )}
                        >
                            <ListLayout
                                layout="block"
                                spacing="2xs"
                                className={styles.headerContent}
                            >
                                {isDefined(heading) && (
                                    <div
                                        className={styles.heading}
                                    >
                                        {heading}
                                    </div>
                                )}
                                {isDefined(headerDescription) && (
                                    <div className={styles.description}>
                                        {headerDescription}
                                    </div>
                                )}
                            </ListLayout>
                        </InlineLayout>
                    </>
                )}
                childrenContainerClassName={_cs(styles.content, contentClassName)}
            >
                {(popupTitle || popupDescription || popupIcons) && (
                    <InlineLayout
                        end={popupIcons}
                        endContainerClassName={styles.icons}
                        className={_cs(
                            styles.popup,
                            popupClassName,
                            popupVerticalPosition === 'center' && styles.verticallyCentered,
                            popupVariant === 'success' && styles.successVariant,
                        )}
                        withPadding
                        spacing="sm"
                    >
                        <BlockLayout>
                            <div className={styles.title}>
                                {popupTitle}
                            </div>
                            <div className={styles.description}>
                                {popupDescription}
                            </div>
                        </BlockLayout>
                    </InlineLayout>
                )}
                {children}
            </BlockLayout>
        </div>
    );
}

export default MobilePreview;

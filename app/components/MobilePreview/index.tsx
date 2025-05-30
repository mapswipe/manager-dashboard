import {
    IoArrowBack,
    IoInformationCircleOutline,
} from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';

import BlockLayout from '#components/BlockLayout';
import Heading from '#components/Heading';
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
    } = props;

    return (
        <BlockLayout
            className={_cs(styles.mobilePreview, className)}
            start={(
                <InlineLayout
                    className={styles.header}
                    withPadding
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
                        spacing="xs"
                    >
                        <div className={styles.description}>
                            {headerDescription}
                        </div>
                        <Heading
                            level={5}
                            className={styles.heading}
                        >
                            {heading}
                        </Heading>
                    </ListLayout>
                </InlineLayout>
            )}
            childrenContainerClassName={_cs(styles.content, contentClassName)}
            spacing="none"
        >
            {(popupTitle || popupDescription || popupIcons) && (
                <InlineLayout
                    end={popupIcons}
                    endContainerClassName={styles.icons}
                    className={_cs(
                        styles.popup,
                        popupClassName,
                        popupVerticalPosition === 'center' && styles.verticallyCentered,
                    )}
                    withPadding
                >
                    <div className={styles.title}>
                        {popupTitle}
                    </div>
                    <div className={styles.description}>
                        {popupDescription}
                    </div>
                </InlineLayout>
            )}
            {children}
        </BlockLayout>
    );
}

export default MobilePreview;

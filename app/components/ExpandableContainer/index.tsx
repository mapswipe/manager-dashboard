import { useState } from 'react';
import {
    IoIosArrowDown,
    IoIosArrowUp,
} from 'react-icons/io';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';

import styles from './styles.module.css';

interface Props {
    icons?: React.ReactNode;
    header?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    openByDefault?: boolean;
    expanded?: boolean;
    onExpandedChange?: (v: boolean) => void;
}

function ExpandableContainer(props: Props) {
    const {
        children,
        className,
        icons,
        header,
        actions,
        openByDefault = false,
        expanded,
        onExpandedChange,
    } = props;

    const [internalExpanded, setInternalExpanded] = useState(openByDefault);
    const isExpanded = expanded ?? internalExpanded;

    const handleToggle = () => {
        const newValue = !isExpanded;
        if (onExpandedChange) {
            onExpandedChange(newValue);
        } else {
            setInternalExpanded(newValue);
        }
    };

    return (
        <div
            className={_cs(
                styles.expandableContainer,
                isExpanded && styles.expanded,
                className,
            )}
        >
            <div className={styles.headerContainer}>
                {icons && (
                    <div className={styles.icons}>
                        {icons}
                    </div>
                )}
                <div className={styles.header}>
                    {header}
                </div>
                <div className={styles.actions}>
                    {actions}
                    <Button
                        name={!isExpanded}
                        onClick={handleToggle}
                        styleVariant="action"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? (
                            <IoIosArrowUp />
                        ) : (
                            <IoIosArrowDown />
                        )}
                    </Button>
                </div>
            </div>
            {isExpanded && (
                <div className={styles.children}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default ExpandableContainer;

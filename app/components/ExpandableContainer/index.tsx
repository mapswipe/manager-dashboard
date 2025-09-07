import { useCallback } from 'react';
import {
    PiCaretDown,
    PiCaretUp,
} from 'react-icons/pi';

import Button from '#components/Button';
import Container, { type ContainerProps } from '#components/Container';

interface Props<NAME> extends ContainerProps {
    name: NAME,
    isExpanded?: boolean;
    onExpansionChange?: (v: boolean, name: NAME) => void;
    alwaysVisibleContent?: React.ReactNode;
    className?: string;
    showDetailsButtonLabel?: React.ReactNode;
    hideDetailsButtonLabel?: React.ReactNode;
}

function ExpandableContainer<NAME>(props: Props<NAME>) {
    const {
        children,
        isExpanded,
        footerActions,
        onExpansionChange,
        name,
        alwaysVisibleContent,
        showDetailsButtonLabel = 'Show details',
        hideDetailsButtonLabel = 'Hide details',
        ...containerProps
    } = props;

    const handleExpandButtonClick = useCallback((newValue: boolean) => {
        onExpansionChange?.(newValue, name);
    }, [name, onExpansionChange]);

    return (
        <Container
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...containerProps}
            footerActions={(
                <>
                    {footerActions}
                    <Button
                        name={!isExpanded}
                        onClick={handleExpandButtonClick}
                        styleVariant="action"
                        start={isExpanded ? <PiCaretUp /> : <PiCaretDown />}
                    >
                        {isExpanded ? hideDetailsButtonLabel : showDetailsButtonLabel}
                    </Button>
                </>
            )}
        >
            {alwaysVisibleContent}
            {isExpanded && children}
        </Container>
    );
}

export default ExpandableContainer;

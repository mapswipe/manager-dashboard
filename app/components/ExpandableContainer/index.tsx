import { useCallback } from 'react';
import {
    IoIosArrowDown,
    IoIosArrowUp,
} from 'react-icons/io';

import Button from '#components/Button';
import Container, { type Props as ContainerProps } from '#components/Container';

interface Props<NAME> extends ContainerProps {
    name: NAME,
    initallyExpanded?: boolean;
    isExpanded?: boolean;
    onExpansionChange?: (v: boolean, name: NAME) => void;
}

function ExpandableContainer<NAME>(props: Props<NAME>) {
    const {
        children,
        isExpanded,
        headerActions,
        onExpansionChange,
        name,
        ...containerProps
    } = props;

    const handleExpandButtonClick = useCallback((newValue: boolean) => {
        onExpansionChange?.(newValue, name);
    }, [name, onExpansionChange]);

    return (
        <Container
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...containerProps}
            headerActions={(
                <>
                    {headerActions}
                    <Button
                        name={!isExpanded}
                        onClick={handleExpandButtonClick}
                        styleVariant="action"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? (
                            <IoIosArrowUp />
                        ) : (
                            <IoIosArrowDown />
                        )}
                    </Button>
                </>
            )}
        >
            {isExpanded && children}
        </Container>
    );
}

export default ExpandableContainer;

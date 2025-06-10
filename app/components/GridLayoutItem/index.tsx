import {
    HTMLProps,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

interface Props extends Omit<HTMLProps<HTMLDivElement>, 'ref'> {
    rowSpan?: number;
    columnSpan?: number;
}

function GridLayoutItem(props: Props) {
    const {
        rowSpan,
        columnSpan,
        style,
        ...otherProps
    } = props;

    const combinedStyle = useMemo(() => {
        if (isNotDefined(rowSpan) && isNotDefined(columnSpan)) {
            return style;
        }

        const tempStyle = { ...style };

        if (isDefined(rowSpan)) {
            tempStyle.gridRow = `span ${rowSpan}`;
        }

        if (isDefined(columnSpan)) {
            tempStyle.gridColumn = `span ${columnSpan}`;
        }

        return tempStyle;
    }, [style, rowSpan, columnSpan]);

    return (
        <div
            style={combinedStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        />
    );
}

export default GridLayoutItem;

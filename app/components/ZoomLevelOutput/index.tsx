import { isDefined } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import { zoomLevelOptions } from '#utils/common';

interface Props {
    className?: string;
    value: number;
}

function ZoomLevelOutput(props: Props) {
    const {
        className,
        value,
    } = props;

    const selectedOption = zoomLevelOptions.find(({ value: zoomLevel }) => zoomLevel === value);

    return (
        <TextOutput
            className={className}
            label="Zoom level"
            value={selectedOption?.value ?? value}
            valueType="number"
            description={isDefined(selectedOption)
                ? ` - ${selectedOption?.label} (${selectedOption?.description})`
                : null}
        />
    );
}

export default ZoomLevelOutput;

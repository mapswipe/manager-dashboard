import SegmentInput from '#components/SegmentInput';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

export type MapZoomViewType = 'zoomLevel' | 'aoiBounds';

type MapZoomViewOption = {
    key: MapZoomViewType ;
    label: string;
};

const options: MapZoomViewOption[] = [
    {
        key: 'zoomLevel',
        label: 'Zoom level',
    },
    {
        key: 'aoiBounds',
        label: 'AOI bounds',
    },
];

interface Props {
    value: MapZoomViewType;
    onChange: React.Dispatch<React.SetStateAction<MapZoomViewType>>;
}

function MapZoomViewSelectInput(props: Props) {
    const {
        value,
        onChange,
    } = props;

    return (
        <SegmentInput
            spacing="sm"
            name={undefined}
            value={value}
            onChange={onChange}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            activeSegmentStyleVariant="translucent"
        />
    );
}

export default MapZoomViewSelectInput;

import {
    PiSortAscending,
    PiSortDescending,
} from 'react-icons/pi';

import SegmentInput from '#components/SegmentInput';
import { Ordering } from '#generated/types/graphql';
import { keySelector } from '#utils/common';

type OrderingOption = {
    key: Ordering;
    icon: React.ReactNode,
    label: string;
}

const orderingOptions: OrderingOption[] = [
    {
        key: Ordering.Asc,
        icon: <PiSortAscending />,
        label: 'Ascending',
    },
    {
        key: Ordering.Desc,
        icon: <PiSortDescending />,
        label: 'Descending',
    },
];

function orderingLabelSelector(option: OrderingOption) {
    if (
        option.key === Ordering.Asc
            || option.key === Ordering.AscNullsLast
            || option.key === Ordering.AscNullsFirst
    ) {
        return <PiSortAscending title={option.label} />;
    }

    return <PiSortDescending title={option.label} />;
}

interface Props<NAME> {
    name: NAME
    value: Ordering | undefined;
    onChange: (newValue: Ordering, name: NAME) => void;
}

function OrderingInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
    } = props;

    return (
        <SegmentInput
            name={name}
            options={orderingOptions}
            keySelector={keySelector}
            labelSelector={orderingLabelSelector}
            onChange={onChange}
            value={value}
        />

    );
}

export default OrderingInput;

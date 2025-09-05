import { PiArrowsDownUp } from 'react-icons/pi';
import { _cs } from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import styles from './styles.module.css';

export interface SortByOption<KEY> {
    key: KEY;
    label: string;
}

interface Props<NAME, KEY> {
    className?: string;
    name: NAME
    value: KEY | undefined;
    onChange: (newValue: KEY, name: NAME) => void;
    options: SortByOption<KEY>[];
}

function SortByInput<const NAME, KEY extends string | number | boolean>(props: Props<NAME, KEY>) {
    const {
        className,
        name,
        value,
        onChange,
        options,
    } = props;

    return (
        <SelectInput
            className={_cs(styles.sortByInput, className)}
            name={name}
            icons={<PiArrowsDownUp />}
            options={options}
            value={value}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onChange={onChange}
            nonClearable
        />
    );
}

export default SortByInput;

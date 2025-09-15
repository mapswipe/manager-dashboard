import { useCallback } from 'react';

import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import SelectInput from '#components/SelectInput';
import {
    formatNumber,
    valueSelector,
    zoomLevelOptions,
    ZoomLeveOption,
} from '#utils/common';

import styles from './styles.module.css';

interface Props<NAME> {
    className?: string;
    label?: React.ReactNode;
    name: NAME;
    onChange: (newValue: number, name: NAME) => void;
    value: number | undefined | null;
    error?: React.ReactNode;
    disabled?: boolean;
}

function formatArea(area: number) {
    return formatNumber(
        area > 1000000 ? area / 1000000 : area,
        {
            prefix: '~',
            suffix: area > 1000000 ? 'km²' : 'm²',
        },
    );
}

function ZoomLevelSelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        label = 'Zoom level',
        name,
        onChange,
        value,
        error,
        disabled,
    } = props;

    const zoomLevelOptionLabelSelector = useCallback((option: ZoomLeveOption) => {
        const area = option.area * 1000 * 1000;

        return (
            <ListLayout
                layout="block"
                spacing="xs"
                className={styles.option}
            >
                <InlineLayout
                    start={option.value}
                    spacing="sm"
                >
                    <InlineLayout
                        withEndAlign
                        spacing="sm"
                        end={(
                            <span className={styles.area}>
                                {formatArea(area)}
                            </span>
                        )}
                    >
                        {option.label}
                    </InlineLayout>
                </InlineLayout>
                <span className={styles.description}>
                    {option.description}
                </span>
            </ListLayout>
        );
    }, []);

    const zoomLevelLabelSelector = useCallback((option: ZoomLeveOption) => (
        `${option.value} - ${option.label} -- ${option.description} ${formatArea(option.area)}`
    ), []);

    return (
        <SelectInput
            className={className}
            label={label}
            name={name}
            onChange={onChange}
            value={value}
            options={zoomLevelOptions}
            keySelector={valueSelector}
            labelSelector={zoomLevelLabelSelector}
            optionLabelSelector={zoomLevelOptionLabelSelector}
            error={error}
            disabled={disabled}
            nonClearable
            hint="We use the Tile Map Service zoom levels. Please check for your area which zoom level is available. If you use a custom tile server you may be able to use even higher zoom levels."
        />
    );
}

export default ZoomLevelSelectInput;

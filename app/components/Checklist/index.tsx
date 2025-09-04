import {
    useCallback,
    useId,
} from 'react';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import Checkbox from '#components/Checkbox';
import InputLabel from '#components/InputLabel';
import ListLayout from '#components/ListLayout';
import { SpacingType } from '#utils/styles';

type Key = string | number;

interface Props<NAME, VALUE, OPTION> {
    name: NAME;
    value: VALUE[] | undefined | null;
    onChange: (newValue: VALUE[] | undefined, name: NAME) => void;
    options: OPTION[];
    keySelector: (option: OPTION) => Key;
    labelSelector: (option: OPTION) => React.ReactNode;
    disabled?: boolean;
    label?: React.ReactNode;
    spacing?: SpacingType;
}

function Checklist<const NAME, VALUE extends Key, OPTION>(props: Props<NAME, VALUE, OPTION>) {
    const {
        name,
        value,
        onChange,
        options,
        keySelector,
        labelSelector,
        label,
        disabled,
        spacing,
    } = props;

    const inputId = useId();

    const valueMap = listToMap(
        value ?? [],
        (key) => key,
        () => true,
    );

    const handleChange = useCallback((newValue: boolean, key: Key) => {
        const valueIndex = value?.findIndex((valueKey) => valueKey === key);

        if (!newValue) {
            if (isNotDefined(valueIndex) || valueIndex === -1) {
                return;
            }

            onChange(value?.toSpliced(valueIndex, 1), name);
            return;
        }

        if (isNotDefined(valueIndex) || valueIndex === -1) {
            onChange([...(value ?? []), key as VALUE], name);
        }
    }, [name, onChange, value]);

    return (
        <ListLayout
            layout="block"
            spacingOffset={-1}
            spacing={spacing}
        >
            <InputLabel inputId={inputId}>
                {label}
            </InputLabel>
            {options.map((option) => {
                const optionKey = keySelector(option);

                return (
                    <Checkbox
                        disabled={disabled}
                        key={optionKey}
                        name={optionKey}
                        label={labelSelector(option)}
                        value={!!valueMap[optionKey as VALUE]}
                        onChange={handleChange}
                    />
                );
            })}
        </ListLayout>
    );
}

export default Checklist;

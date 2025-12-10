import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import InlineLayout from '#components/InlineLayout';
import SelectInput from '#components/SelectInput';
import { SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    conflationTileOptions,
    labelSelector,
    OPACITY_TILE_SELECTED,
    TileSelectOption,
    valueSelector,
} from '#utils/common';

interface ColorPreviewProps {
    value: string | undefined | null;
}

function ColorPreview(props: ColorPreviewProps) {
    const {
        value,
    } = props;

    return (
        <div
            style={{
                backgroundColor: value ?? undefined,
                height: '1rem',
                width: '1rem',
                opacity: OPACITY_TILE_SELECTED,
            }}
        />
    );
}

function iconOptionLabelSelector(option: TileSelectOption) {
    return (
        <InlineLayout
            start={<ColorPreview value={option.color} />}
        >
            {option.label}
        </InlineLayout>
    );
}

type Def = { containerClassName?: string };

type Props<NAME> = SearchSelectInputProps<
number,
NAME,
TileSelectOption,
Def,
'onSearchValueChange'
| 'searchOptions'
| 'onShowDropdownChange'
| 'totalOptionsCount'
| 'value'
| 'options'
| 'keySelector'
| 'labelSelector'
| 'optionLabelSelector'
| 'icons'
> & { value: number | undefined | null};

function TileOptionSelectInput<const NAME>(props: Props<NAME>) {
    const {
        value,
        ...otherProps
    } = props;

    const optionToColorMapping = listToMap(
        conflationTileOptions,
        (option) => option.value,
        (option) => option.color,
    );

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            value={value}
            options={conflationTileOptions}
            keySelector={valueSelector}
            labelSelector={labelSelector}
            optionLabelSelector={iconOptionLabelSelector}
            icons={isDefined(value) && (
                <ColorPreview value={optionToColorMapping[value]} />
            )}
        />
    );
}

export default TileOptionSelectInput;

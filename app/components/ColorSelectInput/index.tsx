import InlineLayout from '#components/InlineLayout';
import SelectInput from '#components/SelectInput';
import { SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    colorOptions,
    labelSelector,
    StringValueOption,
    valueSelector,
} from '#utils/common';

import ColorPreview from './ColorPreview';

type Def = { containerClassName?: string };

function colorOptionLabelSelector(colorOption: StringValueOption) {
    return (
        <InlineLayout
            start={<ColorPreview value={colorOption.value} />}
        >
            {colorOption.label}
        </InlineLayout>
    );
}

type Props<NAME> = SearchSelectInputProps<
string,
NAME,
StringValueOption,
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
> & { value: string | undefined | null};

function ColorSelectInput<const NAME>(props: Props<NAME>) {
    const {
        value,
        ...otherProps
    } = props;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            value={value}
            options={colorOptions}
            keySelector={valueSelector}
            labelSelector={labelSelector}
            optionLabelSelector={colorOptionLabelSelector}
            icons={<ColorPreview value={value} />}
            nonClearable
        />
    );
}

export default ColorSelectInput;

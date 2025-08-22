import InlineLayout from '#components/InlineLayout';
import SelectInput from '#components/SelectInput';
import { SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import { IconEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';
import {
    IconItem,
    iconList,
} from '#utils/icon';

import Icon from '../Icon';

function iconOptionLabelSelector(iconOption: IconItem) {
    const IconElement = iconOption.component;
    return (
        <InlineLayout
            start={<IconElement />}
        >
            {iconOption.label}
        </InlineLayout>
    );
}

type Def = { containerClassName?: string };

type Props<NAME> = SearchSelectInputProps<
IconEnum,
NAME,
IconItem,
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
> & { value: IconEnum | undefined | null};

function IconSelectInput<const NAME>(props: Props<NAME>) {
    const {
        value,
        ...otherProps
    } = props;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            value={value}
            options={iconList}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionLabelSelector={iconOptionLabelSelector}
            icons={<Icon value={value} />}
        />
    );
}

export default IconSelectInput;

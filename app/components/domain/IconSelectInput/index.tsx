import { isDefined } from '@togglecorp/fujs';

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
    iconMapping,
} from '#utils/icon';

function iconOptionLabelSelector(iconOption: IconItem) {
    const Icon = iconOption.component;
    return (
        <InlineLayout
            start={<Icon />}
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

    const IconPreview = isDefined(value)
        ? iconMapping[value]
        : null;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            value={value}
            options={iconList}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionLabelSelector={iconOptionLabelSelector}
            icons={IconPreview && <IconPreview />}
        />
    );
}

export default IconSelectInput;

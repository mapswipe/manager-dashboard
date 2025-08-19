import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import InlineLayout from '#components/InlineLayout';
import SelectInput from '#components/SelectInput';
import { SearchSelectInputProps } from '#components/SelectInput/SearchSelectInput';
import {
    labelSelector,
    valueSelector,
} from '#utils/common';

import { PartialCustomOptionInputFields } from '../CustomOptionInput/schema';

interface Option {
    value: number;
    label: string;
    color: string;
}

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
            }}
        />
    );
}

function iconOptionLabelSelector(option: Option) {
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
Option,
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
> & {
    value: number | undefined | null,
    options: PartialCustomOptionInputFields[] | undefined | null;
};

function CustomOptionSelectInput<const NAME>(props: Props<NAME>) {
    const {
        value,
        options,
        ...otherProps
    } = props;

    const flattendOptions = options?.flatMap((option) => {
        const {
            title,
            value: optionValue,
            iconColor,
            subOptions,
        } = option;

        if (isNotDefined(optionValue) || isNotDefined(title) || isNotDefined(iconColor)) {
            return undefined;
        }

        if (isDefined(subOptions)) {
            return [
                {
                    value: optionValue,
                    label: title,
                    color: iconColor,
                } satisfies Option,

                ...(subOptions.map((subOption) => {
                    const {
                        value: subOptionValue,
                        description: subOptionDescription,
                    } = subOption;

                    if (isNotDefined(subOptionValue) || isNotDefined(subOptionDescription)) {
                        return undefined;
                    }

                    return {
                        value: subOptionValue,
                        label: `${title} > ${subOptionDescription}`,
                        color: iconColor,
                    } satisfies Option;
                })),
            ];
        }

        return {
            value: optionValue,
            label: title,
            color: iconColor,
        } satisfies Option;
    }).filter(isDefined);

    const optionToColorMapping = listToMap(
        flattendOptions,
        (option) => option.value,
        (option) => option.color,
    );

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            value={value}
            options={flattendOptions}
            keySelector={valueSelector}
            labelSelector={labelSelector}
            optionLabelSelector={iconOptionLabelSelector}
            icons={isDefined(value) && (
                <ColorPreview value={optionToColorMapping[value]} />
            )}
        />
    );
}

export default CustomOptionSelectInput;

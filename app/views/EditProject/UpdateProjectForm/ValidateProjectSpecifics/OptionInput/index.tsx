import InlineLayout from '#components/InlineLayout';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import {
    keySelector,
    labelSelector,
} from '#utils/common';
import {
    combinedIconList,
    IconItem,
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

interface Props {
    className?: string;
}

function OptionInput(props: Props) {
    const {
        className,
    } = props;

    // const Icon = isDefined(value.icon) ? iconMap[value.icon] : null;

    return (
        <div className={className}>
            <TextInput
                label="Title"
                name="title"
                value=""
                // value={value.title}
                // error={error?.title}
                // onChange={setFieldValue}
                // disabled={disabled}
            />
            <SelectInput
                label="Icon"
                name="icon"
                options={combinedIconList}
                value={undefined}
                // value={value.icon}
                // onChange={setFieldValue}
                keySelector={keySelector}
                labelSelector={labelSelector}
                // optionLabelSelector={iconOptionLabelSelector}
                // error={error?.instructionsIcon}
                // icons={Icon && <Icon />}
                // disabled={disabled}
            />
            <TextInput
                label="Value"
                name="value"
                value=""
                // value={value.value}
                // error={error?.value}
                // onChange={setFieldValue}
                // disabled={disabled}
            />
        </div>
    );
}

export default OptionInput;

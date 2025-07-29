import SearchSelectInput, { SearchSelectInputProps } from './SearchSelectInput';
import {
    OptionKey,
    rankedSearchOnList,
} from './utils';

type Def = { containerClassName?: string };

export type SelectInputProps<
    OPTION_KEY extends OptionKey,
    NAME,
    OPTION extends object,
    OPTION_RENDERER_PROPS extends Def,
> = SearchSelectInputProps<OPTION_KEY, NAME, OPTION, OPTION_RENDERER_PROPS, 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount'>;

function SelectInput<
OPTION_KEY extends OptionKey,
const NAME,
OPTION extends object,
OPTION_RENDERER_PROPS extends Def
>(
    props: SelectInputProps<OPTION_KEY, NAME, OPTION, OPTION_RENDERER_PROPS>,
) {
    const {
        name,
        options,
        labelSelector,
        nonClearable, // eslint-disable-line @typescript-eslint/no-unused-vars
        onChange, // eslint-disable-line @typescript-eslint/no-unused-vars
        totalOptionsCount, // eslint-disable-line @typescript-eslint/no-unused-vars
        ...otherProps
    } = props;

    // NOTE: this looks weird but we need to use typeguard to identify between
    // different union types (for onChange and nonClearable)
    // eslint-disable-next-line react/destructuring-assignment
    if (props.nonClearable) {
        return (
            <SearchSelectInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                // eslint-disable-next-line react/destructuring-assignment
                onChange={props.onChange}
                // eslint-disable-next-line react/destructuring-assignment
                nonClearable={props.nonClearable}
                name={name}
                options={options}
                labelSelector={labelSelector}
                sortFunction={rankedSearchOnList}
                searchOptions={options}
            />
        );
    }
    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            // eslint-disable-next-line react/destructuring-assignment
            onChange={props.onChange}
            // eslint-disable-next-line react/destructuring-assignment
            nonClearable={props.nonClearable}
            name={name}
            options={options}
            labelSelector={labelSelector}
            sortFunction={rankedSearchOnList}
            searchOptions={options}
        />
    );
}

export default SelectInput;

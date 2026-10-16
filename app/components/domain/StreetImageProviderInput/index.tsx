import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import { StreetImageProviderNameEnum } from '#generated/types/graphql';

import { PartialStreetImageProviderInputFields } from './schema';

interface Props {
    value: PartialStreetImageProviderInputFields | undefined;
    error: LeafError | ObjectError<PartialStreetImageProviderInputFields>;
    setFieldValue: (
        ...entries: EntriesAsList<PartialStreetImageProviderInputFields>
    ) => void;
    disabled?: boolean;
}

interface StreetProviderOption {
    key: StreetImageProviderNameEnum;
    label: string;
}

function providerKeySelector(option: StreetProviderOption) {
    return option.key;
}

function providerLabelSelector(option: StreetProviderOption) {
    return option.label;
}

function StreetImageProviderInput(props: Props) {
    const {
        value, error: formError, setFieldValue, disabled,
    } = props;

    const { streetImageProviderNameOptions } = useContext(EnumsContext);
    const error = getErrorObject(formError);

    const providerOptions = useMemo(() => {
        if (!streetImageProviderNameOptions || streetImageProviderNameOptions.length === 0) {
            return [];
        }

        return streetImageProviderNameOptions.map((option) => ({
            key: option.key as StreetImageProviderNameEnum,
            label: option.label,
        }));
    }, [streetImageProviderNameOptions]);

    const handleChange = useCallback((newValue: StreetImageProviderNameEnum) => {
        setFieldValue(newValue, 'name');
        if (newValue !== StreetImageProviderNameEnum.PanoramaxCustom) {
            setFieldValue(undefined, 'url');
        }
    }, [setFieldValue]);

    return (
        <Container heading="Street-level imagery provider">
            <ListLayout layout="block">
                <RadioInput
                    name="provider"
                    label="Image provider"
                    options={providerOptions}
                    keySelector={providerKeySelector}
                    labelSelector={providerLabelSelector}
                    value={value?.name}
                    onChange={handleChange}
                    error={error?.name}
                    disabled={disabled}
                    radioListLayout="block"
                />

                {value?.name === StreetImageProviderNameEnum.PanoramaxCustom && (
                    <TextInput
                        name="url"
                        label="Panoramax API URL"
                        value={value?.url}
                        error={error?.url}
                        onChange={setFieldValue}
                        disabled={disabled}
                    />
                )}
            </ListLayout>
        </Container>
    );
}

export default StreetImageProviderInput;

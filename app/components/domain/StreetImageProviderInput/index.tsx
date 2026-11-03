import {
    useCallback,
    useContext,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import { StreetImageProviderEnum } from '#generated/types/graphql';

import {
    defaultStreetImageFiltersValue,
    PartialStreetImageFiltersFields,
    PartialStreetImageProviderConfigFields,
    PartialStreetImageProviderInputFields,
    streetImageProviderToConfigKey,
} from './schema';

interface Props {
    value: PartialStreetImageProviderInputFields | undefined;
    error: LeafError | ObjectError<PartialStreetImageProviderInputFields>;
    setFieldValue: (
        ...entries: EntriesAsList<PartialStreetImageProviderInputFields>
    ) => void;
    disabled?: boolean;
}

interface StreetProviderOption {
    key: StreetImageProviderEnum;
    label: string;
}

function getCommonFilters(
    config: PartialStreetImageProviderConfigFields | undefined,
): PartialStreetImageFiltersFields {
    if (isNotDefined(config)) {
        return defaultStreetImageFiltersValue;
    }

    return {
        startTime: config.startTime,
        endTime: config.endTime,
        creatorId: config.creatorId,
        panoOnly: config.panoOnly,
        randomizeOrder: config.randomizeOrder,
        samplingThreshold: config.samplingThreshold,
    };
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

    const { streetImageProviderOptions } = useContext(EnumsContext);
    const error = getErrorObject(formError);

    const setPanoramaxCustomFieldValue = useFormObject<
        'panoramaxCustom',
        PartialStreetImageProviderConfigFields
    >(
        'panoramaxCustom',
        setFieldValue,
        defaultStreetImageFiltersValue,
    );

    const handleProviderChange = useCallback((newProvider: StreetImageProviderEnum) => {
        const oldConfig: PartialStreetImageProviderConfigFields | undefined = (
            isNotDefined(value?.provider)
                ? undefined
                : value[streetImageProviderToConfigKey[value.provider]]
        );
        const newConfigKey = streetImageProviderToConfigKey[newProvider];

        setFieldValue(newProvider, 'provider');
        setFieldValue(
            {
                ...value?.[newConfigKey],
                ...getCommonFilters(oldConfig),
            },
            newConfigKey,
        );
    }, [value, setFieldValue]);

    return (
        <Container
            heading="Street-level imagery provider"
            headingLevel={4}
            headerDescription={(
                <NonFieldError error={error} />
            )}
        >
            <ListLayout layout="block">
                <RadioInput
                    name="provider"
                    label="Image provider"
                    options={streetImageProviderOptions}
                    keySelector={providerKeySelector}
                    labelSelector={providerLabelSelector}
                    value={value?.provider}
                    onChange={handleProviderChange}
                    error={error?.provider}
                    disabled={disabled}
                    radioListLayout="block"
                />

                {value?.provider === StreetImageProviderEnum.PanoramaxCustom && (
                    <TextInput
                        name="url"
                        label="Panoramax instance URL"
                        hint="Domain of the Panoramax instance, e.g. https://panoramax.openstreetmap.fr"
                        value={value.panoramaxCustom?.url}
                        error={getErrorObject(error?.panoramaxCustom)?.url}
                        onChange={setPanoramaxCustomFieldValue}
                        disabled={disabled}
                    />
                )}
            </ListLayout>
        </Container>
    );
}

export default StreetImageProviderInput;

import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import EnumsContext from '#base/context/EnumsContext';
import TileServerContext from '#base/context/TileServerContext';
import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import RadioInput from '#components/RadioInput';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import { VectorTileServerNameEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import {
    PartialCommonVectorTileServerConfigFields,
    PartialCustomVectorTileServerConfigFields,
    PartialVectorTileServerInputFields,
    VectorTileInputKeys,
    vectorTileServerNameToTileInputKey,
} from './schema';

interface Props {
    label?: React.ReactNode;
    value: PartialVectorTileServerInputFields | undefined;
    error: LeafError | ObjectError<PartialVectorTileServerInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialVectorTileServerInputFields>) => void;
    disabled?: boolean;
}

function VectorTileServerInput(props: Props) {
    const {
        label = 'Tile Server',
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const { VectorTileServerNameEnum: vectorTileServerNameOptions } = useContext(EnumsContext);

    const fieldName = (isDefined(value)
        && isDefined(value.name)
    ) ? vectorTileServerNameToTileInputKey[value.name] : 'custom';

    const setCommonTileServerFieldValue = useFormObject<
        Exclude<VectorTileInputKeys, 'custom'>,
        PartialCommonVectorTileServerConfigFields
    >(
        // FIXME: this should be undefined instead of openStreetMap
        fieldName === 'custom' ? 'openStreetMap' : fieldName,
        setFieldValue,
        {},
    );

    const setCustomTileServerFieldValue = useFormObject<
        'custom',
        PartialCustomVectorTileServerConfigFields
    >(
        'custom',
        setFieldValue,
        {},
    );

    const { vector: vectorTileServers } = useContext(TileServerContext);
    const tileServerMapping = useMemo(() => (
        listToMap(vectorTileServers, ({ type }) => type)
    ), [vectorTileServers]);

    const handleImageryServerChange = useCallback((newValue: VectorTileServerNameEnum) => {
        setFieldValue(newValue, 'name');

        if (newValue !== VectorTileServerNameEnum.Custom) {
            setFieldValue(
                {
                    credits: tileServerMapping[newValue]?.credits,
                    sourceLayer: tileServerMapping[newValue]?.layers?.[0],
                },
                vectorTileServerNameToTileInputKey[newValue],
            );
        }
    }, [setFieldValue, tileServerMapping]);

    const sourceLayerOptions = useMemo(() => {
        if (isNotDefined(value?.name) || value.name === VectorTileServerNameEnum.Custom) {
            return [];
        }

        return tileServerMapping[value.name].layers.map((layer) => ({
            key: layer,
            label: layer,
        }));
    }, [value, tileServerMapping]);

    return (
        <Container
            heading={label}
            headingLevel={4}
        >
            <RadioInput
                label="Imagery Server"
                name="name"
                options={vectorTileServerNameOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={value?.name}
                error={error?.name}
                onChange={handleImageryServerChange}
                disabled={disabled}
            />
            {isDefined(value)
                && isDefined(value.name)
                && value.name !== VectorTileServerNameEnum.Custom
                && (
                    <>
                        <TextInput
                            name="credits"
                            label="Imagery Credits"
                            value={value[fieldName]?.credits}
                            error={getErrorObject(error?.[fieldName])?.credits}
                            onChange={setCommonTileServerFieldValue}
                            disabled={disabled}
                        />
                        <SelectInput
                            label="Source layer"
                            name="sourceLayer"
                            value={value[fieldName]?.sourceLayer}
                            error={getErrorObject(error?.[fieldName])?.sourceLayer}
                            onChange={setCommonTileServerFieldValue}
                            options={sourceLayerOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                    </>
                )}
            {isDefined(value)
                && isDefined(value.name)
                && value.name === VectorTileServerNameEnum.Custom
                && (
                    <>
                        <TextInput
                            name="url"
                            label="Imagery Server URL"
                            hint="Make sure you have permission. Add a custom tile server URL that uses {x}, {y} (or {-y}) & {z} or {quad_key} as placeholders and that already includes the api key."
                            value={value.custom?.url}
                            error={getErrorObject(error?.custom)?.url}
                            onChange={setCustomTileServerFieldValue}
                            disabled={disabled}
                        />
                        <TextInput
                            name="credits"
                            label="Imagery Credits"
                            hint="Insert appropriate imagery credits"
                            value={value.custom?.credits}
                            error={getErrorObject(error?.[fieldName])?.credits}
                            onChange={setCustomTileServerFieldValue}
                            disabled={disabled}
                        />
                        <TextInput
                            label="Source layer"
                            name="sourceLayer"
                            value={value.custom?.sourceLayer}
                            error={getErrorObject(error?.[fieldName])?.sourceLayer}
                            onChange={setCustomTileServerFieldValue}
                        />
                        <ListLayout layout="grid">
                            <NumberInput
                                label="Min Zoom"
                                name="minZoom"
                                value={value.custom?.minZoom}
                                error={getErrorObject(error?.custom)?.minZoom}
                                onChange={setCustomTileServerFieldValue}
                            />
                            <NumberInput
                                label="Max Zoom"
                                name="maxZoom"
                                value={value.custom?.maxZoom}
                                error={getErrorObject(error?.custom)?.maxZoom}
                                onChange={setCustomTileServerFieldValue}
                            />
                        </ListLayout>
                    </>
                )}
        </Container>
    );
}

export default VectorTileServerInput;

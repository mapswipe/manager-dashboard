import {
    useCallback,
    useContext,
} from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import EnumsContext from '#base/context/EnumsContext';
import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import { TileServerNameEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
    tileServerDefaultCredits,
} from '#utils/common';
import ProjectAssetPreview from '#views/EditProject/ProjectAssetPreview';

import {
    getTileServerUrlAndCredits,
    PartialCommonTileServerConfigFields,
    PartialCustomTileServerConfigFields,
    type PartialTileServerInputFields,
    TileInputKeys,
    tileServerNameToTileInputKey,
} from './schema';

interface Props {
    label?: string;
    value: PartialTileServerInputFields | undefined,
    error: LeafError | ObjectError<PartialTileServerInputFields>,
    setFieldValue: (...entries: EntriesAsList<PartialTileServerInputFields>) => void;
    disabled?: boolean;
    aoiGeoJsonAssetId?: string;
}

function TileServerInput(props: Props) {
    const {
        label = 'Tile server',
        value,
        error: formError,
        setFieldValue,
        disabled,
        aoiGeoJsonAssetId,
    } = props;

    const error = getErrorObject(formError);

    const { TileServerNameEnum: tileServerNameOptions } = useContext(EnumsContext);

    const fieldName = (isDefined(value)
        && isDefined(value.name)
    ) ? tileServerNameToTileInputKey[value.name] : 'custom';

    const setCommonTileServerFieldValue = useFormObject<
        Exclude<TileInputKeys, 'custom'>,
        PartialCommonTileServerConfigFields
    >(
        fieldName === 'custom' ? 'bing' : fieldName,
        setFieldValue,
        {},
    );

    const setCustomTileServerFieldValue = useFormObject<
        'custom',
        PartialCustomTileServerConfigFields
    >(
        'custom',
        setFieldValue,
        {},
    );

    const handleImageryServerChange = useCallback((newValue: TileServerNameEnum) => {
        setFieldValue(newValue, 'name');

        if (newValue !== TileServerNameEnum.Custom) {
            setFieldValue(
                {
                    credits: tileServerDefaultCredits[newValue],
                },
                tileServerNameToTileInputKey[newValue],
            );
        }
    }, [setFieldValue]);

    const tileServerValue = getTileServerUrlAndCredits(value);

    return (
        <Container
            heading={label}
            headingLevel={4}
        >
            <ListLayout
                layout="grid"
            >
                <ListLayout layout="block">
                    <RadioInput
                        label="Imagery Server"
                        name="name"
                        options={tileServerNameOptions ?? []}
                        value={value?.name}
                        onChange={handleImageryServerChange}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        error={error?.name}
                        disabled={disabled}
                        radioListLayout="block"
                    />
                    {isDefined(value)
                        && isDefined(value.name)
                        && value.name !== TileServerNameEnum.Custom
                        && (
                            <TextInput
                                name="credits"
                                label="Imagery Credits"
                                value={value[fieldName]?.credits}
                                error={getErrorObject(error?.[fieldName])?.credits}
                                onChange={setCommonTileServerFieldValue}
                                disabled={disabled}
                            />
                        )}
                    {isDefined(value)
                        && isDefined(value.name)
                        && value.name === TileServerNameEnum.Custom
                        && (
                            <>
                                <TextInput
                                    name="url"
                                    label="Custom Imagery Server URL"
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
                                    value={value[fieldName]?.credits}
                                    error={getErrorObject(error?.[fieldName])?.credits}
                                    onChange={setCustomTileServerFieldValue}
                                    disabled={disabled}
                                />
                            </>
                        )}
                </ListLayout>
                {isDefined(aoiGeoJsonAssetId) && (
                    <ProjectAssetPreview
                        assetId={aoiGeoJsonAssetId}
                        geoJsonImageryServerUrl={tileServerValue?.url}
                        geoJsonImageryCredits={tileServerValue?.credits}
                    />
                )}
            </ListLayout>
        </Container>
    );
}

export default TileServerInput;

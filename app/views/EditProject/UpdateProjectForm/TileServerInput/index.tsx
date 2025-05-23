import { useCallback } from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import {
    TileServerEnumsQuery,
    TileServerEnumsQueryVariables,
    TileServerNameEnum,
} from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
    tileServerDefaultCredits,
    tileServerUrls,
} from '#utils/common';
import ProjectAssetPreview from '#views/EditProject/ProjectAssetPreview';

import {
    PartialCommonTileServerConfigFields,
    PartialCustomTileServerConfigFields,
    type PartialTileServerInputFields,
    TileInputKeys,
    tileServerNameToTileInputKey,
} from './schema';

import styles from './styles.module.css';

const TILE_SERVER_ENUM_QUERY = gql`
query TileServerEnums {
    enums {
        TileServerNameEnum {
            key
            label
        }
    }
}
`;

function getUrlAndCredits(tileServerProperty: PartialTileServerInputFields | undefined) {
    if (isNotDefined(tileServerProperty)) {
        return undefined;
    }

    const { name } = tileServerProperty;
    if (isNotDefined(name)) {
        return undefined;
    }

    if (name === TileServerNameEnum.Custom) {
        return {
            url: tileServerProperty.custom?.url,
            credits: tileServerProperty.custom?.credits,
        };
    }

    return {
        url: tileServerUrls[name],
        credits: tileServerProperty[tileServerNameToTileInputKey[name]]?.credits,
    };
}

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

    const {
        data: tileServerEnumResponse,
    } = useQuery<TileServerEnumsQuery, TileServerEnumsQueryVariables>(TILE_SERVER_ENUM_QUERY);

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

    const tileServerValue = getUrlAndCredits(value);

    return (
        <Container
            className={styles.tileServerInput}
            heading={label}
            headingLevel={4}
            spacing="sm"
            contentClassName={styles.content}
        >
            <div className={styles.inputs}>
                <RadioInput
                    label="Imagery Server"
                    name="name"
                    options={tileServerEnumResponse?.enums.TileServerNameEnum ?? []}
                    value={value?.name}
                    onChange={handleImageryServerChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    error={error?.name}
                    disabled={disabled}
                    layout="block"
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
            </div>
            {isDefined(aoiGeoJsonAssetId) && (
                <ProjectAssetPreview
                    assetId={aoiGeoJsonAssetId}
                    geoJsonImageryServerUrl={tileServerValue?.url}
                    geoJsonImageryCredits={tileServerValue?.credits}
                />
            )}
        </Container>
    );
}

export default TileServerInput;

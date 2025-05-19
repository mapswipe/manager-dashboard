import {
    gql,
    useQuery,
} from '@apollo/client';
import { isDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

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
} from '#utils/common';

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

interface Props {
    label?: string;
    value: PartialTileServerInputFields | undefined,
    error: LeafError | ObjectError<PartialTileServerInputFields>,
    setFieldValue: (...entries: EntriesAsList<PartialTileServerInputFields>) => void;
    disabled?: boolean;
}

function TileServerInput(props: Props) {
    const {
        label = 'Tile server',
        value,
        error: formError,
        setFieldValue,
        disabled,
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

    return (
        <div className={styles.tileServerInput}>
            <RadioInput
                label={label}
                name="name"
                options={tileServerEnumResponse?.enums.TileServerNameEnum ?? []}
                value={value?.name}
                onChange={setFieldValue}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={error?.name}
                disabled={disabled}
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
                            label="Custom Tile Server URL"
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
    );
}

export default TileServerInput;

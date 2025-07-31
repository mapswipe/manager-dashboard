import {
    useCallback,
    useId,
    useState,
} from 'react';
import {
    check,
    HintError,
} from '@placemarkio/check-geojson';

import FileInput from '#components/FileInput';
import InputContainerLayout, { type Props as InputContainerLayoutProps } from '#components/InputContainerLayout';
import useMountedRef from '#hooks/useMountedRef';

type ParseGeoJSONResponse = {
    errored?: false,
    value: GeoJSON.GeoJSON,
} | {
    errored: true,
    errors: HintError['issues'],
};

// FIXME: Move to utils
function parseGeoJSON(value: string): ParseGeoJSONResponse {
    try {
        const parsedValues = check(value);
        return {
            value: parsedValues,
        };
    } catch (ex: unknown) {
        const err = ex as HintError;
        return {
            errored: true,
            errors: err.issues,
        };
    }
}

// FIXME: Move to utils
function readUploadedFileAsText(inputFile: File) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException('Problem parsing input file.'));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsText(inputFile);
    });
}

const ONE_MB = 1024 * 1024;
const DEFAULT_MAX_FILE_SIZE = ONE_MB;

interface Props<NAME> extends Omit<InputContainerLayoutProps, 'children' | 'inputId'> {
    name: NAME;
    maxFileSize?: number;
    onChange: (newValue: GeoJSON.GeoJSON | undefined, name: NAME) => void;
}

function GeoJsonFileInput<N>(props: Props<N>) {
    const {
        name,
        error,
        maxFileSize = DEFAULT_MAX_FILE_SIZE,
        onChange,
        disabled,
        ...inputContainerLayoutProps
    } = props;

    const mountedRef = useMountedRef();
    const inputId = useId();

    const [
        internalErrorMessage,
        setInternalErrorMessage,
    ] = useState<string>();

    const [tempValue, setTempValue] = useState<File | undefined>(undefined);

    const handleChange = useCallback(
        (newValue: File | undefined) => {
            if (!newValue) {
                setInternalErrorMessage(undefined);
                setTempValue(newValue);
                onChange(undefined, name);
                return;
            }

            if (newValue.size > maxFileSize) {
                setInternalErrorMessage(`File size is too large: ${(newValue.size / ONE_MB).toFixed(2)}MB.`);
                setTempValue(newValue);
                onChange(undefined, name);
                return;
            }

            const file = newValue;

            async function handleValidationAndChange() {
                let fileAsJson;
                try {
                    const text = await readUploadedFileAsText(file);
                    if (!mountedRef.current) {
                        return;
                    }

                    if (!text || typeof text !== 'string') {
                        setInternalErrorMessage('Failed to read the GeoJson file');
                        setTempValue(newValue);
                        onChange(undefined, name);
                        return;
                    }

                    const parsedGeoJSON = parseGeoJSON(text);

                    if (!parsedGeoJSON.errored) {
                        fileAsJson = parsedGeoJSON.value;
                    } else {
                        setInternalErrorMessage(parsedGeoJSON.errors.map((err) => err.message).join('\n'));
                        setTempValue(newValue);
                        onChange(undefined, name);
                        return;
                    }
                } catch {
                    if (!mountedRef.current) {
                        return;
                    }
                    setInternalErrorMessage('Failed to read the GeoJson file');
                    setTempValue(newValue);
                    onChange(undefined, name);
                    return;
                }

                setInternalErrorMessage(undefined);
                setTempValue(newValue);
                onChange(fileAsJson, name);
            }
            handleValidationAndChange();
        },
        [maxFileSize, mountedRef, onChange, name],
    );

    return (
        <InputContainerLayout
            inputId={inputId}
            error={internalErrorMessage ?? error}
            disabled={disabled}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerLayoutProps}
        >
            <FileInput
                inputId={inputId}
                disabled={disabled}
                name={name}
                value={tempValue}
                onChange={handleChange}
                accept=".geojson,.geo.json"
            />
        </InputContainerLayout>
    );
}

export default GeoJsonFileInput;

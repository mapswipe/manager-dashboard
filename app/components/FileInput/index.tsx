import {
    useCallback,
    useMemo,
} from 'react';
import { MdAttachFile } from 'react-icons/md';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import ListLayout from '#components/ListLayout';
import Preview from '#components/Preview';
import RawInput, { Props as RawInputProps } from '#components/RawInput';

import styles from './styles.module.css';

export type RawFileInputProps<NAME> = Omit<RawInputProps<NAME>, 'name' | 'value' | 'onChange' | 'multiple'>;
export type FileInputAdditionalProps<NAME> = {
    accept?: string;
    className?: string;
    inputId: string;
    name: NAME;
    selectButtonLabel?: React.ReactNode;
    showPreview?: boolean;
    children?: React.ReactNode;
    status?: React.ReactNode;
    withoutStatus?: boolean;
}

export type Props<NAME, OMISSION extends string> = Omit<
RawFileInputProps<NAME> & FileInputAdditionalProps<NAME>,
OMISSION
> & ({
    multiple?: false;
    value: File | undefined;
    onChange: (newValue: File | undefined, name: NAME) => void;
} | {
    value: File[] | undefined;
    multiple: true;
    onChange: (newValue: File[] | undefined, name: NAME) => void;
});

function FileInput<NAME>(props: Props<NAME, never>) {
    const {
        accept,
        className,
        disabled,
        inputId,
        name,
        onChange,
        selectButtonLabel = 'Select a file',
        showPreview,
        value,
        children,
        status,
        withoutStatus,
        multiple,
        ...otherInputProps
    } = props;

    const defaultStatus = useMemo(() => {
        if (isNotDefined(value)) {
            return 'No file selected';
        }

        if (multiple) {
            return `${value.length} files selected`;
        }

        return value.name ?? '1 file selected';
    }, [value, multiple]);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files || !onChange) {
                return;
            }

            const fileList = Array.from(files);

            if (multiple) {
                onChange(fileList, name);
                return;
            }

            const firstFile = fileList[0];
            onChange(firstFile, name);
        },
        [onChange, name, multiple],
    );

    const handleChange = useCallback((
        _: string | undefined,
        __: NAME,
        e?: React.FormEvent<HTMLInputElement>,
    ) => {
        if (e) {
            // React.FormEvent<HTMLInputElement> does not have target.files
            handleFiles((e as React.ChangeEvent<HTMLInputElement>).target.files);
        }
    }, [handleFiles]);

    return (
        <ListLayout
            className={_cs(styles.fileInput, className)}
            layout="block"
            spacing="sm"
        >
            <RawInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherInputProps}
                className={styles.input}
                id={inputId}
                type="file"
                value={undefined}
                name={name}
                onChange={handleChange}
                accept={accept}
                disabled={disabled}
                multiple={multiple}
            />
            <ListLayout
                spacing="sm"
                withWrap
            >
                <label htmlFor={inputId}>
                    <ButtonLayout
                        start={<MdAttachFile />}
                        spacing="sm"
                        disabled={disabled}
                    >
                        {selectButtonLabel}
                    </ButtonLayout>
                </label>
                {!withoutStatus && (
                    <div>
                        {status ?? defaultStatus}
                    </div>
                )}
            </ListLayout>
            {showPreview && !multiple && (
                <Preview
                    file={value}
                />
            )}
            {children}
        </ListLayout>
    );
}

export default FileInput;

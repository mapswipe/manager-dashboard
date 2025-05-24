import { useCallback } from 'react';
import { MdAttachFile } from 'react-icons/md';
import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import ListLayout from '#components/ListLayout';
import Preview from '#components/Preview';
import RawInput, { Props as RawInputProps } from '#components/RawInput';

import styles from './styles.module.css';

export interface Props<NAME> extends Omit<RawInputProps<NAME>, 'value' | 'onChange'> {
    accept?: string;
    className?: string;
    inputId: string;
    name: NAME;
    onChange: (newValue: File | undefined, name: NAME) => void;
    selectButtonLabel?: React.ReactNode;
    showPreview?: boolean;
    value: File | undefined;
    children?: React.ReactNode;
}

function FileInput<NAME>(props: Props<NAME>) {
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
        ...otherInputProps
    } = props;

    const status = value?.name ?? 'No file selected';

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files || !onChange) {
                return;
            }

            const fileList = Array.from(files);
            const firstFile = fileList[0];

            onChange(firstFile, name);
        },
        [onChange, name],
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
            />
            <ListLayout spacing="sm">
                <label htmlFor={inputId}>
                    <ButtonLayout
                        start={<MdAttachFile />}
                        spacing="sm"
                        disabled={disabled}
                    >
                        {selectButtonLabel}
                    </ButtonLayout>
                </label>
                <div>
                    {status}
                </div>
            </ListLayout>
            {showPreview && (
                <Preview
                    file={value}
                />
            )}
            {children}
        </ListLayout>
    );
}

export default FileInput;

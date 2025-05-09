import {
    useCallback,
    useId,
} from 'react';
import { MdAttachFile } from 'react-icons/md';
import {
    gql,
    useMutation,
} from '@apollo/client';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { ulid } from 'ulid';

import { useButtonFeatures } from '#components/Button';
import RawInput from '#components/RawInput';
import {
    CreateProjectAssetMutation,
    CreateProjectAssetMutationVariables,
    ProjectAssetMimetypeEnum,
} from '#generated/types/graphql';

import styles from './styles.module.css';

const CREATE_PROJECT_ASSET_MUTATION = gql`
mutation CreateProjectAsset($data: ProjectAssetCreateInput!) {
    createProjectAsset(data: $data) {
        ... on ProjectAssetTypeMutationResponseType {
            errors
            ok
            result {
                id
            }
        }
    }
}
`;

interface Props<NAME> {
    name: NAME,
    projectId: string;
    value: string | undefined | null;
    onChange: (newValue: string | undefined, name: NAME) => void;
    label?: React.ReactNode;
    selectFileButtonLabel?: React.ReactNode;
    error?: React.ReactNode;
    hint?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    inputType?: 'geojson' | 'image';
}

function AssetInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        projectId,
        value,
        onChange,
        className,
        disabled,
        label,
        selectFileButtonLabel = 'Select file',
        error,
        hint,
        inputType = 'geojson',
    } = props;

    const inputId = useId();
    const [
        createProjectAsset,
        { loading: createProjectAssetPending },
    ] = useMutation<CreateProjectAssetMutation, CreateProjectAssetMutationVariables>(
        CREATE_PROJECT_ASSET_MUTATION,
        { context: { hasUpload: true } },
    );

    const handleFileInputChange = useCallback(async (
        _: string | undefined,
        __: undefined,
        e?: React.FormEvent<HTMLInputElement>,
    ) => {
        if (e) {
            // React.FormEvent<HTMLInputElement> does not have target.files
            const { files } = (e as React.ChangeEvent<HTMLInputElement>).target;
            if (files && files.length > 0) {
                const { type } = files[0];
                const mimetypeEnumMap: Record<string, ProjectAssetMimetypeEnum> = {
                    'image/jpeg': ProjectAssetMimetypeEnum.ImageJpeg,
                    'image/png': ProjectAssetMimetypeEnum.ImagePng,
                    'image/gif': ProjectAssetMimetypeEnum.ImageGif,
                    'application/geo+json': ProjectAssetMimetypeEnum.Geojson,
                };

                const selectedEnum = mimetypeEnumMap[type];

                if (isNotDefined(selectedEnum)) {
                    // eslint-disable-next-line no-console
                    console.error('Invalid file selected!');
                    return;
                }

                const result = await createProjectAsset({
                    variables: {
                        data: {
                            clientId: ulid(),
                            file: files[0],
                            mimetype: selectedEnum,
                            project: projectId,
                        },
                    },
                });

                if (
                    // eslint-disable-next-line no-underscore-dangle
                    result.data?.createProjectAsset.__typename === 'ProjectAssetTypeMutationResponseType'
                    && result.data.createProjectAsset.ok
                    && result.data.createProjectAsset.result
                ) {
                    onChange(result.data.createProjectAsset.result.id, name);
                }
            }
        }
    }, [createProjectAsset, projectId, onChange, name]);

    const labelProps = useButtonFeatures({
        icons: <MdAttachFile />,
        children: selectFileButtonLabel,
        variant: 'secondary',
        className: styles.selectFileButton,
        disabled,
    });

    return (
        <div className={_cs(styles.assetInput, className)}>
            {label && (
                <div className={styles.label}>
                    {label}
                </div>
            )}
            <RawInput
                className={styles.input}
                name={undefined}
                id={inputId}
                type="file"
                value={undefined}
                onChange={handleFileInputChange}
                accept={inputType === 'geojson' ? '.geojson' : 'image/png, image/gif, image/jpeg'}
                disabled={disabled || createProjectAssetPending}
            />
            <div className={styles.inputSectionContainer}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label
                    htmlFor={inputId}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...labelProps}
                />
                <div className={styles.preview}>
                    {value ? '1 file selected' : 'No file selected'}
                </div>
            </div>
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
            {hint && (
                <div className={styles.hint}>
                    {hint}
                </div>
            )}
        </div>
    );
}

export default AssetInput;

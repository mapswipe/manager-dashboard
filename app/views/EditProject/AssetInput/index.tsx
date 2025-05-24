import {
    useCallback,
    useId,
} from 'react';
import {
    gql,
    useMutation,
} from '@apollo/client';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { ulid } from 'ulid';

import FileInput from '#components/FileInput';
import InputContainerLayout, { Props as InputContainerLayoutProps } from '#components/InputContainerLayout';
import {
    CreateProjectAssetMutation,
    CreateProjectAssetMutationVariables,
    ProjectAssetMimetypeEnum,
} from '#generated/types/graphql';

import ProjectAssetPreview from '../ProjectAssetPreview';

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

interface Props<NAME> extends Omit<InputContainerLayoutProps, 'children' | 'inputId'> {
    name: NAME,
    projectId: string;
    value: string | undefined | null;
    onChange: (newValue: string | undefined, name: NAME) => void;
    selectFileButtonLabel?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    inputType?: 'geojson' | 'image';
    withoutPreview?: boolean;
}

function AssetInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        projectId,
        value,
        onChange,
        disabled,
        inputType = 'geojson',
        selectFileButtonLabel = inputType === 'image'
            ? 'Select an image'
            : 'Select geojson',
        withoutPreview,
        ...inputLayoutContainerProps
    } = props;

    const inputId = useId();
    const [
        createProjectAsset,
        { loading: createProjectAssetPending },
    ] = useMutation<CreateProjectAssetMutation, CreateProjectAssetMutationVariables>(
        CREATE_PROJECT_ASSET_MUTATION,
        { context: { hasUpload: true } },
    );

    const handleFileInputChange = useCallback(async (file: File | undefined) => {
        if (file) {
            const { type } = file;
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
                        file,
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
    }, [createProjectAsset, projectId, onChange, name]);

    return (
        <InputContainerLayout
            inputId={inputId}
            className={className}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputLayoutContainerProps}
        >
            <FileInput
                name={undefined}
                inputId={inputId}
                type="file"
                value={undefined}
                onChange={handleFileInputChange}
                accept={inputType === 'geojson' ? '.geojson' : 'image/png, image/gif, image/jpeg'}
                disabled={disabled || createProjectAssetPending}
                selectButtonLabel={selectFileButtonLabel}
            >
                {!withoutPreview && isDefined(value) && (
                    <ProjectAssetPreview
                        assetId={value}
                    />
                )}
            </FileInput>
        </InputContainerLayout>
    );
}

export default AssetInput;

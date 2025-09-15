import {
    useCallback,
    useId,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { ulid } from 'ulid';
import { gql } from 'urql';

import ProjectAssetPreview from '#components/domain/ProjectAssetPreview';
import FileInput from '#components/FileInput';
import InputContainerLayout, { Props as InputContainerLayoutProps } from '#components/InputContainerLayout';
import {
    AssetMimetypeEnum,
    ProjectAssetInputTypeEnum,
    useCreateProjectAssetMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertCombinedError,
    transformErrors,
} from '#utils/error';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';

function getAcceptForInputType(value: ProjectAssetInputTypeEnum): string | undefined {
    if (value === ProjectAssetInputTypeEnum.AoiGeometry) {
        return '.geojson';
    }
    if (value === ProjectAssetInputTypeEnum.CoverImage) {
        return 'image/png, image/gif, image/jpeg';
    }
    if (value === ProjectAssetInputTypeEnum.ObjectImage) {
        return 'image/png, image/gif, image/jpeg';
    }
    value satisfies never;
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CREATE_PROJECT_ASSET_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation CreateProjectAsset($data: ProjectAssetCreateInput!) {
    createProjectAsset(data: $data) {
        ... on ProjectAssetTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
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
    inputType: ProjectAssetInputTypeEnum;
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
        inputType,
        selectFileButtonLabel = inputType === ProjectAssetInputTypeEnum.AoiGeometry
            ? 'Select geojson'
            : 'Select an image',
        withoutPreview,
        ...inputLayoutContainerProps
    } = props;

    const alert = useAlert();
    const inputId = useId();
    const [
        { fetching: createProjectAssetPending },
        createProjectAsset,
    ] = useCreateProjectAssetMutation();

    const handleFileInputChange = useCallback(async (file: File | undefined) => {
        if (file) {
            const { type } = file;
            const mimetypeEnumMap: Record<string, AssetMimetypeEnum> = {
                'image/jpeg': AssetMimetypeEnum.ImageJpeg,
                'image/png': AssetMimetypeEnum.ImagePng,
                'image/gif': AssetMimetypeEnum.ImageGif,
                'application/json': AssetMimetypeEnum.Json,
                'application/geo+json': AssetMimetypeEnum.Geojson,
            };
            const selectedEnum = mimetypeEnumMap[type];
            if (isNotDefined(selectedEnum)) {
                // eslint-disable-next-line no-console
                console.error('Invalid file selected!');
                return;
            }

            try {
                const result = await createProjectAsset({
                    data: {
                        clientId: ulid(),
                        file,
                        inputType,
                        project: projectId,
                    },
                });

                if (
                    isNotDefined(result.data)
                        // eslint-disable-next-line no-underscore-dangle
                        || result.data.createProjectAsset.__typename !== 'ProjectAssetTypeMutationResponseType'
                ) {
                    alert.show(
                        'Failed to upload the Project asset!',
                        {
                            description: 'Unexpectected response from the server!',
                            variant: 'danger',
                        },
                    );

                    return;
                }

                const {
                    ok,
                    errors,
                    // result,
                } = result.data.createProjectAsset;

                if (!ok || isNotDefined(result.data.createProjectAsset.result)) {
                    const formErrors = transformErrors(errors);
                    const errorMessage = isDefined(formErrors)
                        ? Object.values(formErrors).join(', ')
                        : 'Unknown error occured';

                    alert.show(
                        'Failed to upload the Project asset!',
                        {
                            description: errorMessage,
                            variant: 'danger',
                        },
                    );
                    // setError(transformErrors(errors));

                    return;
                }

                onChange(result.data.createProjectAsset.result.id, name);
            } catch (combinedError) {
                alertCombinedError(combinedError, alert);
            }
        }
    }, [createProjectAsset, projectId, onChange, name, inputType, alert]);

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
                accept={getAcceptForInputType(inputType)}
                disabled={disabled || createProjectAssetPending}
                selectButtonLabel={selectFileButtonLabel}
                status={isDefined(value) ? '1 file selected' : 'No file selected'}
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

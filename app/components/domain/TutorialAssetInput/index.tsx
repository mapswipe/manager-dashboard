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

import TutorialAssetPreview from '#components/domain/TutorialAssetPreview';
import FileInput from '#components/FileInput';
import InputContainerLayout, { Props as InputContainerLayoutProps } from '#components/InputContainerLayout';
import {
    AssetMimetypeEnum,
    TutorialAssetInputTypeEnum,
    useCreateTutorialAssetMutation,
} from '#generated/types/graphql';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';

function getAcceptForInputType(value: TutorialAssetInputTypeEnum): string | undefined {
    if (value === TutorialAssetInputTypeEnum.InformationBlockImage) {
        return 'image/png, image/gif, image/jpeg';
    }
    value satisfies never;
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CREATE_tutorial_ASSET_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation CreateTutorialAsset($data: TutorialAssetCreateInput!) {
    createTutorialAsset(data: $data) {
        ... on TutorialAssetTypeMutationResponseType {
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
    tutorialId: string;
    value: string | undefined | null;
    onChange: (newValue: string | undefined, name: NAME) => void;
    selectFileButtonLabel?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    inputType: TutorialAssetInputTypeEnum;
    withoutPreview?: boolean;
}

function TutorialAssetInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        tutorialId,
        value,
        onChange,
        disabled,
        inputType,
        selectFileButtonLabel = 'Select an image',
        withoutPreview,
        ...inputLayoutContainerProps
    } = props;

    const inputId = useId();
    const [
        { fetching: createTutorialAssetPending },
        createTutorialAsset,
    ] = useCreateTutorialAssetMutation();

    const handleFileInputChange = useCallback(async (file: File | undefined) => {
        if (file) {
            const { type } = file;
            const mimetypeEnumMap: Record<string, AssetMimetypeEnum> = {
                'image/jpeg': AssetMimetypeEnum.ImageJpeg,
                'image/png': AssetMimetypeEnum.ImagePng,
                'image/gif': AssetMimetypeEnum.ImageGif,
                'application/geo+json': AssetMimetypeEnum.Geojson,
            };

            const selectedEnum = mimetypeEnumMap[type];
            if (isNotDefined(selectedEnum)) {
                // eslint-disable-next-line no-console
                console.error('Invalid file selected!');
                return;
            }

            const result = await createTutorialAsset({
                data: {
                    clientId: ulid(),
                    file,
                    inputType,
                    tutorial: tutorialId,
                },
            });

            if (
                // eslint-disable-next-line no-underscore-dangle
                result.data?.createTutorialAsset.__typename === 'TutorialAssetTypeMutationResponseType'
                && result.data.createTutorialAsset.ok
                && result.data.createTutorialAsset.result
            ) {
                onChange(result.data.createTutorialAsset.result.id, name);
            } else {
                // eslint-disable-next-line no-underscore-dangle
                const errorMessage = result.data
                    ?.createTutorialAsset?.__typename === 'OperationInfo'
                    ? result.data.createTutorialAsset.messages
                    : result.data?.createTutorialAsset?.errors?.[0]?.message
                    || 'Failed to upload file. Please try again.';
                // eslint-disable-next-line no-console
                console.error(errorMessage);
            }
        }
    }, [createTutorialAsset, tutorialId, onChange, name, inputType]);

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
                disabled={disabled || createTutorialAssetPending}
                selectButtonLabel={selectFileButtonLabel}
                status={isDefined(value) ? '1 file selected' : 'No file selected'}
            >
                {!withoutPreview && isDefined(value) && (
                    <TutorialAssetPreview
                        assetId={value}
                    />
                )}
            </FileInput>
        </InputContainerLayout>
    );
}

export default TutorialAssetInput;

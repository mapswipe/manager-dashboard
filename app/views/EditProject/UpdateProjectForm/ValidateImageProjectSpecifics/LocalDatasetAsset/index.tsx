import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    PiArrowSquareOut,
    PiCheck,
    PiSpinner,
    PiTimer,
    PiWarningCircle,
} from 'react-icons/pi';

import BulkUploadContext from '#base/context/BulkUpload';
import ColorPreview from '#components/ColorSelectInput/ColorPreview';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import PopupButton from '#components/PopupButton';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import {
    ProjectAssetInputTypeEnum,
    useCreateProjectAssetMutation,
} from '#generated/types/graphql';
import {
    getErrorMessageAndDescriptionForCombinedError,
    getErrorMessageFromResult,
} from '#utils/error';
import {
    CocoAnnotationType,
    CocoObjectImage,
} from '#utils/validation';

import styles from './styles.module.css';

type CocoAnnotation = typeof CocoAnnotationType.infer;
type CocoImage = typeof CocoObjectImage.infer;

export interface LocalDatasetItem {
    clientId: string;
    image: {
        id: string;
        cocoUrl: CocoImage['coco_url'];
        fileName: CocoImage['file_name'];
        width: CocoImage['width'];
        height: CocoImage['height'];
        dateCaptured: CocoImage['date_captured'];
    };
    annotations: {
        id: string;
        categoryId: string | undefined;
        imageId: string;
        iscrowd: CocoAnnotation['iscrowd'];
        area: CocoAnnotation['area'];
        bbox: CocoAnnotation['bbox'];
    }[] | undefined;
}

interface Props {
    projectId: string;
    value: LocalDatasetItem;
}

function LocalDatasetAsset(props: Props) {
    const {
        projectId,
        value,
    } = props;

    const {
        statusMap,
        uploadTokens,
        register,
        unregister,
        updateStatus,
    } = useContext(BulkUploadContext);

    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        register(value.clientId);

        return () => { unregister(value.clientId); };
    }, [register, unregister, value.clientId]);

    const [
        { fetching: createProjectAssetPending },
        createProjectAsset,
    ] = useCreateProjectAssetMutation();

    const uploadDatasetItem = useCallback(async () => {
        try {
            const result = await createProjectAsset({
                data: {
                    clientId: value.clientId,
                    project: projectId,
                    inputType: ProjectAssetInputTypeEnum.ObjectImage,
                    externalUrl: value.image.cocoUrl,
                    assetTypeSpecifics: {
                        objectImage: {
                            image: value.image,
                            annotations: value.annotations,
                        },
                    },
                },
            });

            if (
                // eslint-disable-next-line no-underscore-dangle
                result.data?.createProjectAsset.__typename === 'ProjectAssetTypeMutationResponseType'
                    && result.data.createProjectAsset.ok
                    && result.data.createProjectAsset.result
            ) {
                updateStatus(value.clientId, 'success');
                setErrorMessage(undefined);
                return;
            }

            const resultErrorMessage = getErrorMessageFromResult(result);
            updateStatus(value.clientId, 'failed');

            setErrorMessage(
                resultErrorMessage ?? 'Unknown error occured!',
            );
        } catch (combinedError) {
            const { message } = getErrorMessageAndDescriptionForCombinedError(combinedError);
            updateStatus(value.clientId, 'failed');
            setErrorMessage(message);
        }
    }, [createProjectAsset, projectId, updateStatus, value]);

    const canStartUpload = uploadTokens[value.clientId];

    useEffect(() => {
        if (canStartUpload) {
            uploadDatasetItem();
        }
    }, [canStartUpload, uploadDatasetItem]);

    const currentStatus = statusMap[value.clientId];

    return (
        <Container
            className={styles.localDatasetAsset}
            withShadow
            withBackground
            withPadding
            key={value.clientId}
            heading={value.image.fileName}
            spacing="sm"
            headingLevel={6}
            headerActions={(
                <a
                    href={value.image.cocoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <PiArrowSquareOut />
                </a>
            )}
            headerDescription={(
                <ListLayout className={styles.meta}>
                    <Tag spacing="sm">
                        <TextOutput
                            value={value.annotations?.length ?? 0}
                            description="annotations"
                        />
                    </Tag>
                    <Tag spacing="sm">
                        {currentStatus === 'ready' && (
                            <InlineLayout
                                start={<PiTimer />}
                                withCenterAlign
                                spacing="xs"
                            >
                                Ready
                            </InlineLayout>
                        )}
                        {createProjectAssetPending && (
                            <InlineLayout
                                start={<PiSpinner className={styles.spinner} />}
                                withCenterAlign
                                spacing="xs"
                            >
                                Uploading
                            </InlineLayout>

                        )}
                        {currentStatus === 'success' && (
                            <InlineLayout
                                start={<PiCheck />}
                                withCenterAlign
                                spacing="xs"
                            >
                                Done
                            </InlineLayout>
                        )}
                        {currentStatus === 'failed' && (
                            <InlineLayout
                                start={<PiWarningCircle />}
                                withCenterAlign
                                spacing="xs"
                                end={(
                                    <PopupButton
                                        withoutDropdownIcon
                                        styleVariant="action"
                                        label={(
                                            <ColorPreview
                                                value="var(--color-danger)"
                                                compact
                                                rounded
                                            />
                                        )}
                                    >
                                        {errorMessage}
                                    </PopupButton>
                                )}
                            >
                                Failed
                            </InlineLayout>
                        )}
                    </Tag>
                </ListLayout>
            )}
        >
            {null}
        </Container>
    );
}

export default LocalDatasetAsset;

import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    PiCheck,
    PiSpinner,
    PiTimer,
    PiTrash,
    PiWarningCircle,
} from 'react-icons/pi';

import BulkUploadContext from '#base/context/BulkUpload';
import Button from '#components/Button';
import ColorPreview from '#components/ColorSelectInput/ColorPreview';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import PopupButton from '#components/PopupButton';
import Tag from '#components/Tag';
import {
    ProjectAssetInputTypeEnum,
    useCreateProjectAssetMutation,
} from '#generated/types/graphql';
import {
    getErrorMessageAndDescriptionForCombinedError,
    getErrorMessageFromResult,
} from '#utils/error';

import styles from './styles.module.css';

export interface DirectImage {
    clientId: string;
    file: File;
}

interface Props {
    projectId: string;
    value: DirectImage;
    onRemove: (clientId: string) => void;
}

function DirectImageAsset(props: Props) {
    const {
        projectId,
        value,
        onRemove,
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
                    file: value.file,
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
            className={styles.directImageAsset}
            withShadow
            withBackground
            withPadding
            key={value.clientId}
            heading={(
                <span className={styles.fileName}>
                    {value.file.name}
                </span>
            )}
            spacing="sm"
            headingLevel={6}
            headerActions={(
                <Button
                    name={value.clientId}
                    onClick={onRemove}
                    styleVariant="action"
                    colorVariant="danger"
                    spacing="sm"
                >
                    <PiTrash />
                </Button>
            )}
            headerDescription={(
                <ListLayout className={styles.meta}>
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

export default DirectImageAsset;

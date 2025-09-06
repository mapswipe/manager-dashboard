import {
    useCallback,
    useId,
    useState,
} from 'react';
import { PiCloudArrowUp } from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { ulid } from 'ulid';

import BulkUploadContext, { useBulkUploadProvider } from '#base/context/BulkUpload';
import Button from '#components/Button';
import Container from '#components/Container';
import FileInput from '#components/FileInput';
import ListLayout from '#components/ListLayout';
import Modal from '#components/Modal';
import ProgressBar from '#components/ProgressBar';
import TextOutput from '#components/TextOutput';
import { AssetMimetypeEnum } from '#generated/types/graphql';

import DirectImageAsset, { DirectImage } from '../DirectImageAsset';

const imageMimeTypeEnumMap: Record<string, AssetMimetypeEnum> = {
    'image/jpeg': AssetMimetypeEnum.ImageJpeg,
    'image/png': AssetMimetypeEnum.ImagePng,
    'image/gif': AssetMimetypeEnum.ImageGif,
};

interface Props {
    projectId: string;
    onUploadModalClose: () => void;
}

function DirectImagesInput(props: Props) {
    const {
        projectId,
        onUploadModalClose,
    } = props;

    const inputId = useId();

    const [
        selectedImageFiles,
        setSelectedImageFiles,
    ] = useState<DirectImage[] | undefined>();

    const handleUploadImagesCancel = useCallback(() => {
        setSelectedImageFiles(undefined);
        onUploadModalClose();
    }, [onUploadModalClose]);

    const handleUploadImageFileRemove = useCallback((clientId: string) => {
        setSelectedImageFiles((prevSelectedFiles) => {
            const fileIndex = prevSelectedFiles?.findIndex((file) => file.clientId === clientId);

            if (isNotDefined(fileIndex) || fileIndex === -1) {
                return prevSelectedFiles;
            }

            return prevSelectedFiles?.toSpliced(fileIndex, 1);
        });
    }, []);

    const handleImagesDirectorySelect = useCallback((files: File[] | undefined) => {
        const pendingFiles = files?.filter(
            (file) => !!imageMimeTypeEnumMap[file.type],
        ).map((file) => ({
            clientId: ulid(),
            file,
        }));

        setSelectedImageFiles(pendingFiles);
    }, []);

    const {
        value,
        startUpload,
        pauseUpload,
        uploadPending,
    } = useBulkUploadProvider();

    const numAssetsUploaded = Object.values(value.statusMap).filter((status) => status === 'success').length;

    return (
        <Container
            headerDescription="Add images directly from a folder in your file system"
        >
            <FileInput
                inputId={inputId}
                name={undefined}
                value={undefined}
                onChange={handleImagesDirectorySelect}
                selectButtonLabel="Select a folder"
                multiple
                // @ts-expect-error typing not available due non-standard attribute
                webkitdirectory="true"
                disabled={isDefined(selectedImageFiles)}
                withoutStatus
            />
            {isDefined(selectedImageFiles) && (
                <Modal
                    heading="Upload files"
                    headerDescription={(
                        <ListLayout>
                            <TextOutput
                                value={selectedImageFiles.length}
                                valueType="number"
                                description="images selected"
                            />
                            <TextOutput
                                value={numAssetsUploaded}
                                valueType="number"
                                description="assets created"
                            />
                            <ProgressBar
                                value={numAssetsUploaded}
                                total={selectedImageFiles.length}
                            />
                        </ListLayout>
                    )}
                    onClose={handleUploadImagesCancel}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={pauseUpload}
                                disabled={!uploadPending}
                            >
                                Pause
                            </Button>
                            <Button
                                name={undefined}
                                styleVariant="filled"
                                colorVariant="accent"
                                start={<PiCloudArrowUp />}
                                onClick={startUpload}
                                disabled={uploadPending}
                            >
                                Start upload
                            </Button>
                        </>
                    )}
                    size="lg"
                    withHeaderBorder
                    withFooterBorder
                    withWelledContent
                >
                    <ListLayout
                        spacing="sm"
                        layout="grid"
                        numPreferredGridColumns={3}
                    >
                        <BulkUploadContext.Provider value={value}>
                            {selectedImageFiles.map((selectedFile) => (
                                <DirectImageAsset
                                    onRemove={handleUploadImageFileRemove}
                                    key={selectedFile.clientId}
                                    value={selectedFile}
                                    projectId={projectId}
                                />
                            ))}
                        </BulkUploadContext.Provider>
                    </ListLayout>
                </Modal>
            )}
        </Container>
    );
}

export default DirectImagesInput;

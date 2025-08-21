import {
    useCallback,
    useContext,
    useId,
    useState,
} from 'react';
import { IconType } from 'react-icons';
import { FaExternalLinkAlt } from 'react-icons/fa';
import {
    ImClock,
    ImCloudCheck,
    ImSpinner,
    ImWarning,
} from 'react-icons/im';
import {
    IoAdd,
    IoClose,
    IoCloudUpload,
    IoImage,
} from 'react-icons/io5';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormArray,
} from '@togglecorp/toggle-form';
import { type } from 'arktype';
import { ulid } from 'ulid';
import { gql } from 'urql';

import EnumsContext from '#base/context/EnumsContext.ts';
import Button from '#components/Button/index.tsx';
import Container from '#components/Container/index.tsx';
import CustomOptionInput from '#components/domain/CustomOptionInput';
import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema.ts';
import FileInput from '#components/FileInput/index.tsx';
import InlineLayout from '#components/InlineLayout/index.tsx';
import ListLayout from '#components/ListLayout/index.tsx';
import Modal from '#components/Modal/index.tsx';
import NonFieldError from '#components/NonFieldError/index.tsx';
import Pager from '#components/Pager/index.tsx';
import RadioInput from '#components/RadioInput/index.tsx';
import {
    AssetMimetypeEnum,
    ProjectAssetInputTypeEnum,
    useCreateProjectAssetMutation,
    useProjectObjectImageAssetsQuery,
    ValidateImageSourceTypeEnum,
} from '#generated/types/graphql.ts';
import useAlert from '#hooks/useAlert.ts';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    defaultPagePerItemOptions,
    keySelector,
    labelSelector,
    readFileAsText,
} from '#utils/common.ts';
import {
    getErrorMessageAndDescriptionForCombinedError,
    getErrorMessageFromResult,
} from '#utils/error.ts';
import {
    CocoAnnotationType,
    CocoObjectImage,
    CocoType,
} from '#utils/validation.ts';

import { type PartialValidateImageSpecificFields } from './schema.ts';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_OBJECT_IMAGE_ASSETS_QUERY = gql`
query ProjectObjectImageAssets($projectId: ID!, $pagination: OffsetPaginationInput!) {
    projectAssets(
        pagination: $pagination
        filters: {projectId: {exact: $projectId}, inputType: {exact: OBJECT_IMAGE}}
    ) {
        totalCount
        results {
            clientId
            assetTypeSpecifics {
                ... on ObjectImageAssetPropertyType {
                    __typename
                    image {
                        id
                        fileName
                    }
                }
            }
            id
            file {
                url
                name
            }
            externalUrl
            projectId
        }
    }
}
`;

const imageMimeTypeEnumMap: Record<string, AssetMimetypeEnum> = {
    'image/jpeg': AssetMimetypeEnum.ImageJpeg,
    'image/png': AssetMimetypeEnum.ImagePng,
    'image/gif': AssetMimetypeEnum.ImageGif,
};

type AssetUploadStatus = 'pending' | 'uploading' | 'success' | 'failed';

const statusIconMap: Record<AssetUploadStatus, IconType> = {
    pending: ImClock,
    uploading: ImSpinner,
    success: ImCloudCheck,
    failed: ImWarning,
};

type AssetUpload = {
    status: AssetUploadStatus;
    error?: string;
    assetId?: string;
}

type DirectImage = {
    clientId: string;
    file: File;
}

type CocoAnnotation = typeof CocoAnnotationType.infer;
type CocoImage = typeof CocoObjectImage.infer;

type Dataset = {
    clientId: string;
    image: {
        id: CocoImage['id'];
        cocoUrl: CocoImage['coco_url'];
        fileName: CocoImage['file_name'];
        width: CocoImage['width'];
        height: CocoImage['height'];
        dateCaptured: CocoImage['date_captured'];
    };
    annotations: {
        id: CocoAnnotation['id'];
        categoryId: CocoAnnotation['category_id'];
        imageId: CocoAnnotation['image_id'];
        iscrowd: CocoAnnotation['iscrowd'];
        area: CocoAnnotation['area'];
        bbox: CocoAnnotation['bbox'];
    }[] | undefined;
}

interface Props {
    projectId: string;
    value: PartialValidateImageSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialValidateImageSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialValidateImageSpecificFields>) => void;
    disabled?: boolean;
}

function ValidateProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const { ValidateImageSourceTypeEnum: sourceTypeOptions } = useContext(EnumsContext);
    const alert = useAlert();
    const [activeAssetsPage, setActiveAssetsPage] = useState(DEFAULT_PAGE);
    const [assetsPerPage, setAssetsPerPage] = useState(DEFAULT_PAGE_SIZE);

    const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _,
        // { fetching: createProjectAssetPending },
        createProjectAsset,
    ] = useCreateProjectAssetMutation();

    const [{
        data: objectImageAssetsResponse,
    }] = useProjectObjectImageAssetsQuery({
        variables: {
            projectId,
            pagination: {
                offset: (activeAssetsPage - 1) * assetsPerPage,
                limit: assetsPerPage,
            },
        },
    });

    const inputId = useId();
    const [
        selectedImageFiles,
        setSelectedImageFiles,
    ] = useState<DirectImage[] | undefined>();
    const [
        selectedDataset,
        setSelectedDataset,
    ] = useState<Dataset[] | undefined>();

    const [
        uploadAssetMapping,
        setUploadAssetMapping,
    ] = useState<Record<string, AssetUpload>>({});

    const {
        setValue: setCustomOptionValue,
        removeValue: removeCustomOption,
    } = useFormArray(
        'customOptions' as const,
        setFieldValue,
    );

    const addCustomOption = useCallback((newCustomOptionIndex: number) => {
        const newCustomOption: PartialCustomOptionInputFields = {
            clientId: ulid(),
            value: newCustomOptionIndex,
        };

        setFieldValue(
            (oldValue: PartialCustomOptionInputFields[] | undefined) => (
                [...(oldValue ?? []), newCustomOption]
            ),
            'customOptions' as const,
        );
    }, [setFieldValue]);

    const error = getErrorObject(formError);

    const handleUploadImagesCancel = useCallback(() => {
        setSelectedImageFiles(undefined);
    }, []);

    const handleStartImagesUpload = useCallback(() => {
        if (isNotDefined(selectedImageFiles)) {
            return;
        }
        setUploadAssetMapping({});

        async function uploadFileAsset(file: File) {
            const clientId = ulid();
            const imgMimeType = imageMimeTypeEnumMap[file.type];

            if (!imgMimeType) {
                return;
            }

            try {
                const result = await createProjectAsset({
                    data: {
                        clientId,
                        file,
                        mimetype: imgMimeType,
                        inputType: ProjectAssetInputTypeEnum.ObjectImage,
                        project: projectId,
                    },
                });

                setUploadAssetMapping((prevMapping) => {
                    const errorMessage = getErrorMessageFromResult(result);
                    if (isDefined(errorMessage)) {
                        return {
                            ...prevMapping,
                            [clientId]: {
                                status: 'failed',
                                error: errorMessage,
                            } satisfies AssetUpload,
                        };
                    }

                    if (
                        // eslint-disable-next-line no-underscore-dangle
                        result.data?.createProjectAsset.__typename === 'ProjectAssetTypeMutationResponseType'
                        && result.data.createProjectAsset.ok
                        && result.data.createProjectAsset.result
                    ) {
                        return {
                            ...prevMapping,
                            [clientId]: {
                                status: 'success',
                                assetId: result.data.createProjectAsset.result.id,
                            } satisfies AssetUpload,
                        };
                    }

                    return {
                        ...prevMapping,
                        [clientId]: {
                            status: 'failed',
                            error: 'Unexpected response from the server',
                        } satisfies AssetUpload,
                    };
                });
            } catch (combinedError) {
                const { message } = getErrorMessageAndDescriptionForCombinedError(combinedError);

                setUploadAssetMapping((prevMapping) => ({
                    ...prevMapping,
                    [clientId]: {
                        status: 'failed',
                        error: message,
                    } satisfies AssetUpload,
                }));
            }
        }

        selectedImageFiles.forEach(async (imageFile) => {
            await uploadFileAsset(imageFile.file);
        });
    }, [createProjectAsset, projectId, selectedImageFiles]);

    const handleUploadImageFileRemove = useCallback((fileIndex: number) => {
        setSelectedImageFiles((prevSelectedFiles) => prevSelectedFiles?.toSpliced(fileIndex, 1));
    }, []);

    const handleImagesDirectorySelect = useCallback((files: File[] | undefined) => {
        const pendingFiles = files?.filter(
            (file) => !!imageMimeTypeEnumMap[file.type],
        ).map((file) => ({
            clientId: ulid(),
            file,
        }));
        setUploadAssetMapping(
            listToMap(
                pendingFiles ?? [],
                ({ clientId }) => clientId,
                () => ({ status: 'pending' }),
            ),
        );
        setSelectedImageFiles(pendingFiles);
    }, []);

    const handleDatasetFileSelect = useCallback(async (file: File | undefined) => {
        setUploadAssetMapping({});
        if (isDefined(file)) {
            try {
                const fileContentText = await readFileAsText(file);
                const jsonContent = JSON.parse(fileContentText);

                const result = CocoType(jsonContent);

                if (result instanceof type.errors) {
                    setSelectedDataset(undefined);
                    setUploadAssetMapping({});
                    alert.show('Failed to validate the dataset', {
                        variant: 'danger',
                        description: result.summary,
                    });
                    return;
                }

                const annotationsMapping = listToGroupList(
                    result.annotations ?? [],
                    ({ image_id }) => image_id,
                );

                const pendingDatasets = result.images.map((image) => {
                    const {
                        id,
                        coco_url,
                        flickr_url,
                        file_name,
                        width,
                        height,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        date_captured,
                    } = image;

                    const url = coco_url ?? flickr_url;

                    if (isNotDefined(url)) {
                        return undefined;
                    }

                    const annotations = annotationsMapping[id]?.map((annotation) => ({
                        id: annotation.id,
                        categoryId: annotation.category_id,
                        imageId: annotation.image_id,
                        area: annotation.area,
                        bbox: annotation.bbox,
                        iscrowd: annotation.iscrowd,
                    } satisfies NonNullable<Dataset['annotations']>[number]));

                    return {
                        clientId: ulid(),
                        image: {
                            id,
                            cocoUrl: url,
                            fileName: file_name,
                            width,
                            height,
                            dateCaptured: undefined,
                            // FIXME(frozenhelium): check proper type
                            // dateCaptured: date_captured,
                        },
                        annotations,
                    } satisfies Dataset;
                }).filter(isDefined);

                setSelectedDataset(pendingDatasets);
                setUploadAssetMapping(
                    listToMap(
                        pendingDatasets,
                        ({ clientId }) => clientId,
                        () => ({ status: 'pending' }),
                    ),
                );
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                alert.show('Failed to read the file', {
                    variant: 'danger',
                });
                setSelectedDataset(undefined);
                setUploadAssetMapping({});
            }
        }
    }, [alert]);

    const handleUploadDatasetCancel = useCallback(() => {
        setSelectedDataset(undefined);
        setUploadAssetMapping({});
    }, []);

    const handleStartDataseUpload = useCallback(async () => {
        if (isNotDefined(selectedDataset)) {
            return;
        }

        async function uploadDatasetAsset(dataset: Dataset) {
            setUploadAssetMapping((prevMapping) => ({
                ...prevMapping,
                [dataset.clientId]: {
                    status: 'uploading',
                } satisfies AssetUpload,
            }));

            try {
                const result = await createProjectAsset({
                    data: {
                        clientId: dataset.clientId,
                        project: projectId,
                        inputType: ProjectAssetInputTypeEnum.ObjectImage,
                        externalUrl: dataset.image.cocoUrl,
                        assetTypeSpecifics: {
                            objectImage: {
                                image: dataset.image,
                                annotations: dataset.annotations,
                            },
                        },
                    },
                });

                setUploadAssetMapping((prevMapping) => {
                    const errorMessage = getErrorMessageFromResult(result);
                    if (isDefined(errorMessage)) {
                        return {
                            ...prevMapping,
                            [dataset.clientId]: {
                                status: 'failed',
                                error: errorMessage,
                            } satisfies AssetUpload,
                        };
                    }

                    if (
                        // eslint-disable-next-line no-underscore-dangle
                        result.data?.createProjectAsset.__typename === 'ProjectAssetTypeMutationResponseType'
                        && result.data.createProjectAsset.ok
                        && result.data.createProjectAsset.result
                    ) {
                        return {
                            ...prevMapping,
                            [dataset.clientId]: {
                                status: 'success',
                                assetId: result.data.createProjectAsset.result.id,
                            } satisfies AssetUpload,
                        };
                    }

                    return {
                        ...prevMapping,
                        [dataset.clientId]: {
                            status: 'failed',
                            error: 'Unexpected response from the server',
                        } satisfies AssetUpload,
                    };
                });
            } catch (combinedError) {
                const { message } = getErrorMessageAndDescriptionForCombinedError(combinedError);

                setUploadAssetMapping((prevMapping) => ({
                    ...prevMapping,
                    [dataset.clientId]: {
                        status: 'failed',
                        error: message,
                    } satisfies AssetUpload,
                }));
            }
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const dataset of selectedDataset) {
            // eslint-disable-next-line no-await-in-loop
            await uploadDatasetAsset(dataset);
        }
    }, [createProjectAsset, projectId, selectedDataset]);

    const numAssetsUploaded = Object.values(uploadAssetMapping).filter(({ status }) => status === 'success').length;

    return (
        <>
            <Container
                withBackground
                withPadding
                headingLevel={4}
                heading="Custom options"
                spacing="lg"
                headerActions={(
                    <Button
                        name={value?.customOptions?.length ?? 0}
                        onClick={addCustomOption}
                        styleVariant="transparent"
                        start={<IoAdd />}
                        withoutPadding
                    >
                        Add option
                    </Button>
                )}
                headerDescription={(
                    <NonFieldError error={error?.customOptions} />
                )}
                empty={isNotDefined(value?.customOptions) || value.customOptions.length === 0}
            >
                {value?.customOptions?.map((customOption, optionIndex) => (
                    <CustomOptionInput
                        key={customOption.clientId}
                        index={optionIndex}
                        value={customOption}
                        onChange={setCustomOptionValue}
                        error={getErrorObject(
                            getErrorObject(error?.customOptions)?.[customOption.clientId],
                        )}
                        onRemove={removeCustomOption}
                        disabled={disabled}
                    />
                ))}
            </Container>
            <Container
                withBackground
                withPadding
                headingLevel={4}
                heading="Images"
                spacing="lg"
            >
                <RadioInput
                    name="sourceType"
                    label="Source type"
                    options={sourceTypeOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    error={error?.sourceType}
                    value={value?.sourceType}
                    onChange={setFieldValue}
                />
                {value?.sourceType === ValidateImageSourceTypeEnum.DirectImages && (
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
                    </Container>
                )}
                {value?.sourceType === ValidateImageSourceTypeEnum.DatasetFile && (
                    <Container
                        headerDescription="Add images using a dataset file"
                    >
                        <FileInput
                            inputId={inputId}
                            name={undefined}
                            value={undefined}
                            onChange={handleDatasetFileSelect}
                            selectButtonLabel="Select a COCO file"
                            disabled={isDefined(selectedDataset)}
                            withoutStatus
                            accept=".json"
                        />
                    </Container>
                )}
                {isDefined(objectImageAssetsResponse) && (
                    <Container
                        heading="Uploaded images"
                        contentClassName={styles.uploadedImages}
                        headingLevel={6}
                        footerActions={(
                            <Pager
                                pagePerItem={assetsPerPage}
                                onPagePerItemChange={setAssetsPerPage}
                                activePage={activeAssetsPage}
                                onActivePageChange={setActiveAssetsPage}
                                totalItems={objectImageAssetsResponse.projectAssets.totalCount ?? 0}
                                pagePerItemOptions={defaultPagePerItemOptions}
                            />
                        )}
                        empty={objectImageAssetsResponse.projectAssets.totalCount === 0}
                        emptyMessage="No images has been uploaded yet!"
                    >
                        <ListLayout
                            layout="block"
                            spacing="xs"
                        >
                            {objectImageAssetsResponse.projectAssets.results.map((asset) => (
                                <InlineLayout
                                    className={styles.asset}
                                    key={asset.id}
                                    withPadding
                                    spacing="sm"
                                >
                                    <div className={styles.fileName}>
                                        {asset.file?.name ?? asset.externalUrl}
                                    </div>
                                </InlineLayout>
                            ))}
                        </ListLayout>
                    </Container>
                )}
                {isDefined(selectedImageFiles) && (
                    <Modal
                        heading="Upload files"
                        headerDescription={`${selectedImageFiles.length} files selected, ${numAssetsUploaded} files uploaded`}
                        className={styles.selectedFiles}
                        onClose={handleUploadImagesCancel}
                        footerActions={(
                            <>
                                <Button
                                    name={undefined}
                                    onClick={handleUploadImagesCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    name={undefined}
                                    styleVariant="filled"
                                    colorVariant="accent"
                                    start={<IoCloudUpload />}
                                    onClick={handleStartImagesUpload}
                                >
                                    Start upload
                                </Button>
                            </>
                        )}
                    >
                        <ListLayout
                            layout="block"
                            spacing="xs"
                        >
                            {selectedImageFiles.map((selectedFile, selectedFileIndex) => (
                                <InlineLayout
                                    key={selectedFile.clientId}
                                    start={<IoImage />}
                                    end={(
                                        <Button
                                            name={selectedFileIndex}
                                            onClick={handleUploadImageFileRemove}
                                            styleVariant="action"
                                        >
                                            <IoClose />
                                        </Button>
                                    )}
                                    withPadding
                                    spacing="sm"
                                    className={styles.file}
                                >
                                    <div className={styles.fileName}>
                                        {selectedFile.file.webkitRelativePath}
                                    </div>
                                </InlineLayout>
                            ))}
                        </ListLayout>
                    </Modal>
                )}
                {isDefined(selectedDataset) && (
                    <Modal
                        className={styles.uploadDataset}
                        heading="Upload dataset"
                        headerDescription={`${selectedDataset.length} images selected, ${numAssetsUploaded} asset created`}
                        onClose={handleUploadDatasetCancel}
                        footerActions={(
                            <>
                                <Button
                                    name={undefined}
                                    onClick={handleUploadDatasetCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    name={undefined}
                                    styleVariant="filled"
                                    colorVariant="accent"
                                    start={<IoCloudUpload />}
                                    onClick={handleStartDataseUpload}
                                >
                                    Start upload
                                </Button>
                            </>
                        )}
                        size="lg"
                        withHeaderBorder
                        withFooterBorder
                    >
                        <ListLayout
                            spacing="xs"
                            layout="block"
                        >
                            {selectedDataset.map((dataset) => {
                                const uploadAsset = uploadAssetMapping[dataset.clientId];
                                if (isNotDefined(uploadAsset)) {
                                    return null;
                                }

                                const StatusIcon = statusIconMap[uploadAsset.status];

                                return (
                                    <InlineLayout
                                        className={_cs(
                                            styles.dataset,
                                            uploadAsset.status === 'failed' && styles.failed,
                                            uploadAsset.status === 'uploading' && styles.uploading,
                                            uploadAsset.status === 'success' && styles.success,
                                        )}
                                        key={dataset.clientId}
                                        start={<StatusIcon className={styles.statusIcon} />}
                                        end={`${dataset.annotations?.length ?? 0} annotations`}
                                        withPadding
                                    >
                                        <div className={styles.fileName}>
                                            {dataset.image.fileName}
                                        </div>
                                        <div className={styles.url}>
                                            {dataset.image.cocoUrl}
                                            <a
                                                href={dataset.image.cocoUrl}
                                            >
                                                <FaExternalLinkAlt />
                                            </a>
                                        </div>
                                        {uploadAsset.status === 'failed' && (
                                            <div className={styles.errorMessage}>
                                                {uploadAssetMapping[dataset.clientId]?.error}
                                            </div>
                                        )}
                                    </InlineLayout>
                                );
                            })}
                        </ListLayout>
                    </Modal>
                )}
            </Container>
        </>
    );
}

export default ValidateProjectSpecifics;

import {
    useCallback,
    useContext,
    useId,
    useState,
} from 'react';
import {
    IoAdd,
    IoClose,
    IoCloudUpload,
    IoImage,
} from 'react-icons/io5';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
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
    const [selectedImageFiles, setSelectedImageFiles] = useState<File[] | undefined>();
    const [selectedDataset, setSelectedDataset] = useState<typeof CocoType.infer | undefined>();
    const [uploadAssetMapping, setUploadAssetMapping] = useState<Record<string, string>>({});

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
                if (
                    // eslint-disable-next-line no-underscore-dangle
                    result.data?.createProjectAsset.__typename === 'ProjectAssetTypeMutationResponseType'
                    && result.data.createProjectAsset.ok
                    && result.data.createProjectAsset.result
                ) {
                    return {
                        ...prevMapping,
                        [clientId]: result.data.createProjectAsset.result.id,
                    };
                }

                // TODO: show errors

                return prevMapping;
            });
        }

        selectedImageFiles.forEach(async (file) => {
            await uploadFileAsset(file);
        });
    }, [createProjectAsset, projectId, selectedImageFiles]);

    const handleUploadImageFileRemove = useCallback((fileIndex: number) => {
        setSelectedImageFiles((prevSelectedFiles) => prevSelectedFiles?.toSpliced(fileIndex, 1));
    }, []);

    const handleImagesDirectorySelect = useCallback((files: File[] | undefined) => {
        setSelectedImageFiles(files?.filter((file) => !!imageMimeTypeEnumMap[file.type]));
    }, []);

    const handleDatasetFileSelect = useCallback(async (file: File | undefined) => {
        if (isDefined(file)) {
            try {
                const fileContentText = await readFileAsText(file);
                const jsonContent = JSON.parse(fileContentText);

                const result = CocoType(jsonContent);

                if (result instanceof type.errors) {
                    setSelectedDataset(undefined);
                    alert.show('Failed to validate the dataset', {
                        variant: 'danger',
                        description: result.summary,
                    });
                    return;
                }

                setSelectedDataset(result);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                alert.show('Failed to read the file', {
                    variant: 'danger',
                });
                setSelectedDataset(undefined);
            }
        }
    }, [alert]);

    const handleUploadDatasetCancel = useCallback(() => {
        setSelectedDataset(undefined);
    }, []);

    const handleStartDataseUpload = useCallback(async () => {
        if (isNotDefined(selectedDataset)) {
            return;
        }

        setUploadAssetMapping({});
        const annotationsMapping = listToGroupList(
            selectedDataset.annotations ?? [],
            ({ image_id }) => image_id,
        );

        async function uploadObjectImageAsset(objectImage: typeof CocoObjectImage.infer) {
            const clientId = ulid();

            const result = await createProjectAsset({
                data: {
                    clientId,
                    project: projectId,
                    inputType: ProjectAssetInputTypeEnum.ObjectImage,
                    externalUrl: objectImage.coco_url,
                    mimetype: AssetMimetypeEnum.ImageJpeg,
                    assetTypeSpecifics: {
                        objectImage: {
                            image: {
                                id: objectImage.id,
                                cocoUrl: objectImage.coco_url,
                                fileName: objectImage.file_name,
                            },
                            annotations: annotationsMapping[objectImage.id]?.map((annotation) => {
                                const {
                                    id,
                                    category_id,
                                    image_id,
                                    iscrowd,
                                    area,
                                    bbox,
                                    // segmentation,
                                } = annotation;

                                return {
                                    id,
                                    categoryId: category_id ?? 0,
                                    imageId: image_id,
                                    iscrowd,
                                    area,
                                    bbox,
                                    // segmentation,
                                };
                            }),
                        },
                    },
                },
            });

            setUploadAssetMapping((prevMapping) => {
                if (
                    // eslint-disable-next-line no-underscore-dangle
                    result.data?.createProjectAsset.__typename === 'ProjectAssetTypeMutationResponseType'
                    && result.data.createProjectAsset.ok
                    && result.data.createProjectAsset.result
                ) {
                    return {
                        ...prevMapping,
                        [clientId]: result.data.createProjectAsset.result.id,
                    };
                }

                // TODO: show errors

                return prevMapping;
            });
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const objectImage of selectedDataset.images) {
            // eslint-disable-next-line no-await-in-loop
            await uploadObjectImageAsset(objectImage);
        }
    }, [createProjectAsset, projectId, selectedDataset]);

    const numAssetsUploaded = Object.keys(uploadAssetMapping).length;

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
                            value={selectedImageFiles}
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
                                    key={selectedFile.webkitRelativePath}
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
                                        {selectedFile.webkitRelativePath}
                                    </div>
                                </InlineLayout>
                            ))}
                        </ListLayout>
                    </Modal>
                )}
                {isDefined(selectedDataset) && (
                    <Modal
                        heading="Upload dataset"
                        headerDescription={`${selectedDataset.images.length} images selected, ${numAssetsUploaded} files uploaded`}
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
                    >
                        {selectedDataset.images.map((image) => (
                            <div key={image.id}>
                                {image.coco_url}
                            </div>
                        ))}
                    </Modal>
                )}
            </Container>
        </>
    );
}

export default ValidateProjectSpecifics;

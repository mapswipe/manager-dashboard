import {
    useCallback,
    useId,
    useMemo,
    useState,
} from 'react';
import { PiCloudArrowUp } from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import { type } from 'arktype';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import FileInput from '#components/FileInput';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import Modal from '#components/Modal';
import ProgressBar from '#components/ProgressBar';
import SelectInput from '#components/SelectInput';
import TextOutput from '#components/TextOutput';
import BulkUploadContext, { useBulkUploadProvider } from '#contexts/BulkUpload';
import useAlert from '#hooks/useAlert';
import {
    idSelector,
    nameSelector,
    readFileAsText,
    stringifyId,
} from '#utils/common';
import {
    CocoCategoryType,
    CocoType,
} from '#utils/validation';

import LocalDatasetAsset, { LocalDatasetItem } from '../LocalDatasetAsset';

type Category = typeof CocoCategoryType.infer;

interface Props {
    projectId: string;
    onUploadModalClose: () => void;
    disabled?: boolean;
}

function DatasetFileInput(props: Props) {
    const {
        projectId,
        onUploadModalClose,
        disabled,
    } = props;

    const [
        selectedDataset,
        setSelectedDataset,
    ] = useState<LocalDatasetItem[] | undefined>();

    const [categoryOptions, setCategoryOptions] = useState<Category[]>();
    const [selectedCategory, setSelectedCategory] = useState<number>();

    const inputId = useId();
    const alert = useAlert();

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

                setCategoryOptions(result.categories ?? []);
                setSelectedCategory(result.categories?.[0].id);

                const annotationsMapping = listToGroupList(
                    result.annotations ?? [],
                    ({ image_id }) => image_id,
                );

                const datasets = result.images.map((image) => {
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
                        id: stringifyId(annotation.id),
                        categoryId: stringifyId(annotation.category_id),
                        imageId: stringifyId(annotation.image_id),
                        area: annotation.area,
                        bbox: annotation.bbox,
                        iscrowd: annotation.iscrowd,
                    } satisfies NonNullable<LocalDatasetItem['annotations']>[number]));

                    return {
                        clientId: ulid(),
                        image: {
                            id: stringifyId(id),
                            cocoUrl: url,
                            fileName: file_name,
                            width,
                            height,
                            dateCaptured: undefined,
                            // FIXME(frozenhelium): check proper type
                            // dateCaptured: date_captured,
                        },
                        annotations,
                    } satisfies LocalDatasetItem;
                }).filter(isDefined);

                setSelectedDataset(datasets);
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

    const {
        value,
        startUpload,
        pauseUpload,
        uploadPending,
    } = useBulkUploadProvider();

    const handleUploadDatasetCancel = useCallback(() => {
        pauseUpload();
        setSelectedDataset(undefined);
        onUploadModalClose();
    }, [onUploadModalClose, pauseUpload]);

    const numAssetsUploaded = Object.values(value.statusMap).filter((status) => status === 'success').length;

    const filteredDataset = useMemo(() => {
        if (isNotDefined(selectedCategory)) {
            return selectedDataset;
        }

        return selectedDataset?.map((dataset) => {
            const { annotations } = dataset;

            if (isNotDefined(annotations)) {
                return undefined;
            }

            const newAnnotations = annotations.filter(
                ({ categoryId }) => categoryId === String(selectedCategory),
            );

            if (newAnnotations.length === 0) {
                return undefined;
            }

            return {
                ...dataset,
                annotations: newAnnotations,
            };
        }).filter(isDefined);
    }, [selectedCategory, selectedDataset]);

    return (
        <Container headerDescription="Add images using a dataset file">
            <FileInput
                inputId={inputId}
                name={undefined}
                value={undefined}
                onChange={handleDatasetFileSelect}
                selectButtonLabel="Select a COCO file"
                disabled={isDefined(selectedDataset) || disabled}
                withoutStatus
                accept=".json"
            />
            {!disabled && isDefined(filteredDataset) && (
                <Modal
                    heading="Upload dataset"
                    headerDescription={(
                        <InlineLayout
                            end={(
                                <SelectInput
                                    name={undefined}
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    keySelector={idSelector}
                                    labelSelector={nameSelector}
                                />
                            )}
                        >
                            <ListLayout withWrap>
                                <TextOutput
                                    value={filteredDataset.length}
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
                                    total={filteredDataset.length}
                                />
                            </ListLayout>
                        </InlineLayout>
                    )}
                    onClose={handleUploadDatasetCancel}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={pauseUpload}
                                disabled={!uploadPending}
                            >
                                Pause
                            </Button>
                            {numAssetsUploaded === filteredDataset.length && (
                                <Button
                                    name={undefined}
                                    styleVariant="filled"
                                    colorVariant="accent"
                                    onClick={handleUploadDatasetCancel}
                                    disabled={uploadPending}
                                >
                                    Done
                                </Button>
                            )}
                            {numAssetsUploaded !== filteredDataset.length && (
                                <Button
                                    name={undefined}
                                    styleVariant="filled"
                                    colorVariant="accent"
                                    start={<PiCloudArrowUp />}
                                    onClick={startUpload}
                                    disabled={uploadPending}
                                >
                                    Upload
                                </Button>
                            )}
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
                        numPreferredGridColumns={4}
                    >
                        <BulkUploadContext.Provider value={value}>
                            {filteredDataset.map((dataset) => (
                                <LocalDatasetAsset
                                    key={dataset.clientId}
                                    projectId={projectId}
                                    value={dataset}
                                />
                            ))}
                        </BulkUploadContext.Provider>
                    </ListLayout>
                </Modal>
            )}
        </Container>
    );
}

export default DatasetFileInput;

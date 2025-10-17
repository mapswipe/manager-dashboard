import {
    useCallback,
    useContext,
    useState,
} from 'react';
import { IoAdd } from 'react-icons/io5';
import {
    PiArrowSquareOut,
    PiImage,
} from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormArray,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';
import { gql } from 'urql';

import Alert from '#components/Alert/index.tsx';
import Button from '#components/Button/index.tsx';
import Container from '#components/Container/index.tsx';
import CustomOptionInput from '#components/domain/CustomOptionInput';
import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema.ts';
import InlineLayout from '#components/InlineLayout/index.tsx';
import ListLayout from '#components/ListLayout/index.tsx';
import Modal from '#components/Modal/index.tsx';
import NonFieldError from '#components/NonFieldError/index.tsx';
import Pager from '#components/Pager/index.tsx';
import RadioInput from '#components/RadioInput/index.tsx';
import EnumsContext from '#contexts/EnumsContext.ts';
import {
    useProjectObjectImageAssetsQuery,
    useRemoveAllObjectImageAssetsMutation,
    ValidateImageSourceTypeEnum,
} from '#generated/types/graphql.ts';
import useAlert from '#hooks/useAlert.ts';
import useConfirmation from '#hooks/useConfirmation.ts';
import {
    DEFAULT_PAGE,
    defaultPagePerItemOptions,
    keySelector,
    labelSelector,
} from '#utils/common.ts';
import {
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error.ts';
import { OPERATION_INFO_FRAGMENT } from '#utils/query.ts';

import DatasetFileInput from './DatasetFileInput/index.tsx';
import DirectImagesInput from './DirectImagesInput/index.tsx';
import { type PartialValidateImageSpecificFields } from './schema.ts';

import styles from './styles.module.css';

const DIRECT_IMAGES_ENABLED = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_OBJECT_IMAGE_ASSETS_QUERY = gql`
query ProjectObjectImageAssets($projectId: ID!, $withoutMimeType: Boolean, $pagination: OffsetPaginationInput!) {
    projectAssets(
        pagination: $pagination
    filters: {projectId: {exact: $projectId}, inputType: {exact: OBJECT_IMAGE}, mimetype: {isNull: $withoutMimeType}}
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
                ... on AoiGeometryAssetPropertyType {
                    __typename
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const REMOVE_ALL_OBJECT_IMAGE_ASSETS_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation RemoveAllObjectImageAssets($projectId: ID!) {
    deleteProjectAssets(assetInputType: OBJECT_IMAGE, projectId: $projectId) {
        ...on ProjectAssetsDeleteTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                count
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

interface Props {
    projectId: string;
    value: PartialValidateImageSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialValidateImageSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialValidateImageSpecificFields>) => void;
    disabled?: boolean;
    sourceTypeSaved?: boolean;
}

function ValidateProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
        sourceTypeSaved,
    } = props;

    const alert = useAlert();
    const { validateImageSourceTypeOptions: sourceTypeOptions } = useContext(EnumsContext);
    const [activeAssetsPage, setActiveAssetsPage] = useState(DEFAULT_PAGE);
    const [assetsPerPage, setAssetsPerPage] = useState(20);

    const [
        { fetching: removeAllObjectImageAssetsPending },
        removeAllObjectImageAssets,
    ] = useRemoveAllObjectImageAssetsMutation();

    const [
        { data: objectImageAssetsResponse },
        retriggerObjectImagesAssetRequest,
    ] = useProjectObjectImageAssetsQuery({
        pause: isNotDefined(value?.sourceType),
        variables: {
            projectId,
            pagination: {
                offset: (activeAssetsPage - 1) * assetsPerPage,
                limit: assetsPerPage,
            },
            withoutMimeType: value?.sourceType !== ValidateImageSourceTypeEnum.DirectImages,
        },
    });

    const {
        showConfirmation: showRemoveImagesConfimation,
        setShowConfirmationTrue: setShowRemoveImagesConfirmationTrue,
        onConfirmButtonClick: confirmRemoveImages,
        onDenyButtonClick: denyRemoveImages,
    } = useConfirmation(
        async () => {
            const result = await removeAllObjectImageAssets({ projectId });

            if (checkAndAlertGraphQLResultError(result, alert)) {
                return;
            }

            if (isNotDefined(result.data)
                // eslint-disable-next-line no-underscore-dangle
                || result.data.deleteProjectAssets.__typename !== 'ProjectAssetsDeleteTypeMutationResponseType') {
                alert.show(
                    'Failed to remove the images!',
                    {
                        description: 'Unexpected response from the server!',
                        variant: 'danger',
                    },
                );

                return;
            }

            const {
                ok,
                errors,
            } = result.data.deleteProjectAssets;

            if (!ok) {
                const formErrors = transformErrors(errors);
                const errorMessage = isDefined(formErrors)
                    ? Object.values(formErrors).join(', ')
                    : 'Unknown error occured';

                alert.show(
                    'Failed to remove the images!',
                    {
                        description: errorMessage,
                        variant: 'danger',
                        debugMessage: JSON.stringify(errors, null, 2),
                    },
                );
                return;
            }

            retriggerObjectImagesAssetRequest();
            alert.show(
                'Successfully remove the images!',
                { variant: 'success' },
            );
        },
    );

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
    const numUploadedImages = objectImageAssetsResponse?.projectAssets.totalCount ?? 0;

    return (
        <>
            <Container
                headingLevel={4}
                heading="Custom options"
                withWelledContent
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
                <ListLayout layout="grid">
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
                </ListLayout>
            </Container>
            <Container
                headingLevel={4}
                heading="Images"
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
                    disabled={disabled || !DIRECT_IMAGES_ENABLED}
                />
                {value?.sourceType === ValidateImageSourceTypeEnum.DirectImages
                    && DIRECT_IMAGES_ENABLED
                    && (
                        <DirectImagesInput
                            onUploadModalClose={retriggerObjectImagesAssetRequest}
                            projectId={projectId}
                        />
                    )}
                {value?.sourceType === ValidateImageSourceTypeEnum.DatasetFile && (
                    <DatasetFileInput
                        onUploadModalClose={retriggerObjectImagesAssetRequest}
                        projectId={projectId}
                        disabled={numUploadedImages > 0}
                    />
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
                        withWelledContent
                        headerActions={value?.sourceType === ValidateImageSourceTypeEnum.DatasetFile
                            && numUploadedImages > 0 && (
                            <Button
                                name={undefined}
                                colorVariant="danger"
                                onClick={setShowRemoveImagesConfirmationTrue}
                                disabled={removeAllObjectImageAssetsPending}
                            >
                                Remove all
                            </Button>
                        )}
                    >
                        <ListLayout
                            layout="grid"
                            numPreferredGridColumns={3}
                        >
                            {objectImageAssetsResponse.projectAssets.results.map((asset) => {
                                if (isNotDefined(asset.assetTypeSpecifics)) {
                                    return (
                                        <Container
                                            key={asset.id}
                                            withPadding
                                            withBackground
                                            withShadow
                                            spacing="sm"
                                        >
                                            <div className={styles.fileName}>
                                                {asset.file?.name}
                                            </div>
                                        </Container>
                                    );
                                }

                                // eslint-disable-next-line no-underscore-dangle
                                if (asset.assetTypeSpecifics.__typename !== 'ObjectImageAssetPropertyType') {
                                    return null;
                                }

                                return (
                                    <Container
                                        key={asset.id}
                                        withPadding
                                        withBackground
                                        withShadow
                                        spacing="sm"
                                    >
                                        <InlineLayout
                                            start={<PiImage />}
                                            spacing="sm"
                                            end={isDefined(asset.externalUrl) && (
                                                <a
                                                    href={asset.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <PiArrowSquareOut />
                                                </a>
                                            )}
                                        >
                                            <div className={styles.fileName}>
                                                {asset.assetTypeSpecifics.image.fileName}
                                            </div>
                                        </InlineLayout>
                                    </Container>
                                );
                            })}
                        </ListLayout>
                    </Container>
                )}
            </Container>
            {!sourceTypeSaved && (
                <Alert
                    name="save-project-message"
                    fullWidth
                    title="Save project changes!"
                    description="Please note that the uploaded images will only be ready to process after the changes are saved."
                    withoutShadow
                />
            )}
            {showRemoveImagesConfimation && (
                <Modal
                    size="sm"
                    withAutoHeight
                    heading="Confirmation"
                    footerActions={(
                        <ListLayout withWrap>
                            <Button
                                name={undefined}
                                onClick={denyRemoveImages}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                onClick={confirmRemoveImages}
                                colorVariant="danger"
                            >
                                Yes
                            </Button>
                        </ListLayout>
                    )}
                >
                    <div>
                        Area you sure yout want to remove all of the current images?
                    </div>
                    <div>
                        Please note that this action is irreversable!
                    </div>
                </Modal>
            )}
        </>
    );
}

export default ValidateProjectSpecifics;

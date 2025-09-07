import {
    useCallback,
    useContext,
    useState,
} from 'react';
import { IoAdd } from 'react-icons/io5';
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

import Button from '#components/Button/index.tsx';
import Container from '#components/Container/index.tsx';
import CustomOptionInput from '#components/domain/CustomOptionInput';
import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema.ts';
import ListLayout from '#components/ListLayout/index.tsx';
import NonFieldError from '#components/NonFieldError/index.tsx';
import Pager from '#components/Pager/index.tsx';
import RadioInput from '#components/RadioInput/index.tsx';
import EnumsContext from '#contexts/EnumsContext.ts';
import {
    useProjectObjectImageAssetsQuery,
    ValidateImageSourceTypeEnum,
} from '#generated/types/graphql.ts';
import {
    DEFAULT_PAGE,
    defaultPagePerItemOptions,
    keySelector,
    labelSelector,
} from '#utils/common.ts';

import DatasetFileInput from './DatasetFileInput/index.tsx';
import DirectImagesInput from './DirectImagesInput/index.tsx';
import { type PartialValidateImageSpecificFields } from './schema.ts';

import styles from './styles.module.css';

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

    const { validateImageSourceTypeOptions: sourceTypeOptions } = useContext(EnumsContext);
    const [activeAssetsPage, setActiveAssetsPage] = useState(DEFAULT_PAGE);
    const [assetsPerPage, setAssetsPerPage] = useState(20);

    const [
        {
            data: objectImageAssetsResponse,
        },
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
                />
                {value?.sourceType === ValidateImageSourceTypeEnum.DirectImages && (
                    <DirectImagesInput
                        onUploadModalClose={retriggerObjectImagesAssetRequest}
                        projectId={projectId}
                    />
                )}
                {value?.sourceType === ValidateImageSourceTypeEnum.DatasetFile && (
                    <DatasetFileInput
                        onUploadModalClose={retriggerObjectImagesAssetRequest}
                        projectId={projectId}
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
                                        <div className={styles.fileName}>
                                            {asset.assetTypeSpecifics.image.fileName}
                                        </div>
                                    </Container>
                                );
                            })}
                        </ListLayout>
                    </Container>
                )}
            </Container>
        </>
    );
}

export default ValidateProjectSpecifics;

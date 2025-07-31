import {
    useCallback,
    useMemo,
} from 'react';
import {
    IoAdd,
    IoTrashBin,
} from 'react-icons/io5';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    getErrorObject,
    ObjectError,
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import TextInput from '#components/TextInput';
import { TutorialInformationPageBlockTypeEnum } from '#generated/types/graphql';

import { PartialBlockInputFields } from './BlockInput/schema';
import BlockInput from './BlockInput';
import InformationPagePreview from './InformationPagePreview';
import { PartialInformationPageInputFields } from './schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    index: number;
    value: PartialInformationPageInputFields;
    onChange: (
        value: SetValueArg<PartialInformationPageInputFields>,
        index: number,
    ) => void;
    error: ObjectError<PartialInformationPageInputFields> | undefined;
    onRemove: (index: number) => void;
    lookForValue: string | undefined,
    tutorialId: string,
}

function InformationPageInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
        lookForValue,
        tutorialId,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    const {
        setValue: setBlockFieldValue,
        // removeValue: removeBlock,
    } = useFormArray(
        'blocks' as const,
        setFieldValue,
    );

    const blockErrors = useMemo(
        () => getErrorObject(error?.blocks),
        [error?.blocks],
    );

    const removeBlock = useCallback(
        (indexToRemove: number) => {
            setFieldValue(
                (oldValue: PartialBlockInputFields[] | undefined) => {
                    if (
                        isNotDefined(oldValue)
                            || oldValue.length === 0
                            || isNotDefined(oldValue[indexToRemove])
                    ) {
                        return oldValue;
                    }

                    const newValue = oldValue.toSpliced(indexToRemove, 1).map(
                        (item, blockIndex) => ({
                            ...item,
                            blockNumber: blockIndex + 1,
                        }),
                    );

                    return newValue;
                },
                'blocks',
            );
        },
        [setFieldValue],
    );

    const addTextBlock = useCallback(
        (newBlockIndex: number) => {
            const newBlock: PartialBlockInputFields = {
                clientId: ulid(),
                blockNumber: newBlockIndex + 1,
                blockType: TutorialInformationPageBlockTypeEnum.Text,
            };

            setFieldValue(
                (oldValue: PartialBlockInputFields[] | undefined) => (
                    [...(oldValue ?? []), newBlock]
                ),
                'blocks' as const,
            );
        },
        [setFieldValue],
    );

    const addImageBlock = useCallback(
        (newBlockIndex: number) => {
            const newBlock: PartialBlockInputFields = {
                clientId: ulid(),
                blockNumber: newBlockIndex + 1,
                blockType: TutorialInformationPageBlockTypeEnum.Image,
            };

            setFieldValue(
                (oldValue: PartialBlockInputFields[] | undefined) => (
                    [...(oldValue ?? []), newBlock]
                ),
                'blocks' as const,
            );
        },
        [setFieldValue],
    );

    return (
        <Container
            headingLevel={3}
            className={_cs(styles.informationPageInput, className)}
            heading={`Page #${value.pageNumber ?? (index + 1)}`}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="transparent"
                    colorVariant="danger"
                    start={<IoTrashBin />}
                    withoutPadding
                >
                    Remove
                </Button>
            )}
            spacing="lg"
            withPadding
            contentClassName={styles.content}
        >
            <ListLayout
                layout="block"
                spacing="lg"
            >
                <TextInput
                    label="Title"
                    name="title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
                <Container
                    heading="Blocks"
                    headingLevel={5}
                    withHeaderBorder
                    headerActions={(
                        <>
                            <Button
                                name={value.blocks?.length ?? 0}
                                styleVariant="transparent"
                                start={<IoAdd />}
                                withoutPadding
                                onClick={addImageBlock}
                            >
                                Add image block
                            </Button>
                            <Button
                                name={value.blocks?.length ?? 0}
                                onClick={addTextBlock}
                                styleVariant="transparent"
                                start={<IoAdd />}
                                withoutPadding
                            >
                                Add text block
                            </Button>
                        </>
                    )}
                    headerDescription={(
                        <NonFieldError
                            error={error?.blocks}
                        />
                    )}
                    empty={isNotDefined(value.blocks) || value.blocks.length === 0}
                >
                    {value.blocks?.map((block, blockIndex) => (
                        <BlockInput
                            key={block.clientId}
                            index={blockIndex}
                            value={block}
                            onChange={setBlockFieldValue}
                            error={getErrorObject(blockErrors?.[block.clientId])}
                            onRemove={removeBlock}
                            tutorialId={tutorialId}
                        />
                    ))}
                </Container>
            </ListLayout>
            <div className={styles.previewContainer}>
                <InformationPagePreview
                    value={value}
                    lookFor={lookForValue}
                />
            </div>
        </Container>
    );
}

export default InformationPageInput;

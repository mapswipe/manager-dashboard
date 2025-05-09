import {
    useCallback,
    useMemo,
} from 'react';
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
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';

import { PartialBlockInputFields } from './BlockInput/schema';
import BlockInput from './BlockInput';
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
}

function InformationPageInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
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
        removeValue: removeBlock,
    } = useFormArray(
        'blocks' as const,
        setFieldValue,
    );

    const blockErrors = useMemo(
        () => getErrorObject(error?.blocks),
        [error?.blocks],
    );

    const addBlock = useCallback(
        () => {
            const newBlock: PartialBlockInputFields = {
                clientId: ulid(),
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
            className={_cs(styles.informationPageInput, className)}
            heading={`Information page - #${index + 1}`}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                >
                    Remove info page
                </Button>
            )}
            contentClassName={styles.content}
        >
            <div className={styles.formFields}>
                <div className={styles.metaInputs}>
                    <NumberInput
                        label="Page number"
                        name="pageNumber"
                        value={value.pageNumber}
                        onChange={setFieldValue}
                        error={error?.pageNumber}
                    />
                    <TextInput
                        label="Title"
                        name="title"
                        value={value.title}
                        onChange={setFieldValue}
                        error={error?.title}
                    />
                </div>
                <Container
                    className={styles.blocks}
                    heading="Blocks"
                    headingLevel={4}
                    headerActions={(
                        <Button
                            name={undefined}
                            onClick={addBlock}
                            variant="tertiary"
                        >
                            Add new block
                        </Button>
                    )}
                    headerDescription={(
                        <NonFieldError
                            error={error?.blocks}
                        />
                    )}
                    isEmpty={isNotDefined(value.blocks) || value.blocks.length === 0}
                >
                    {value.blocks?.map((block, blockIndex) => (
                        <BlockInput
                            key={block.clientId}
                            index={blockIndex}
                            value={block}
                            onChange={setBlockFieldValue}
                            error={getErrorObject(blockErrors?.[block.clientId])}
                            onRemove={removeBlock}
                        />
                    ))}
                </Container>
            </div>
            <div className={styles.preview}>
                Preview not available!
            </div>
        </Container>
    );
}

export default InformationPageInput;

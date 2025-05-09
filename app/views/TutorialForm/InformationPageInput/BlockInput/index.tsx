import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import EnumsContext from '#base/context/EnumsContext';
import Button from '#components/Button';
import Container from '#components/Container';
import NumberInput from '#components/NumberInput';
import SegmentInput from '#components/SegmentInput';
import TextArea from '#components/TextArea';
import { TutorialInformationPageBlockTypeEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import { PartialBlockInputFields } from './schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    index: number;
    value: PartialBlockInputFields;
    onChange: (
        value: SetValueArg<PartialBlockInputFields>,
        index: number,
    ) => void;
    error: ObjectError<PartialBlockInputFields> | undefined;
    onRemove: (index: number) => void;
}

function BlockInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
    } = props;

    const { TutorialInformationPageBlockTypeEnum: blockTypeOptions } = useContext(EnumsContext);

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    return (
        <Container
            className={_cs(styles.blockInput, className)}
            heading={`Block - #${index + 1}`}
            headingLevel={5}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                >
                    Remove block
                </Button>
            )}
        >
            <div className={styles.metaInputs}>
                <NumberInput
                    label="Block number"
                    name="blockNumber"
                    value={value.blockNumber}
                    onChange={setFieldValue}
                    error={error?.blockNumber}
                />
                <SegmentInput
                    label="Block type"
                    name="blockType"
                    options={blockTypeOptions}
                    value={value.blockType}
                    onChange={setFieldValue}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                />
            </div>
            {value.blockType === TutorialInformationPageBlockTypeEnum.Text && (
                <TextArea
                    label="Text"
                    name="text"
                    value={value.text}
                    onChange={setFieldValue}
                />
            )}
            {value.blockType === TutorialInformationPageBlockTypeEnum.Image && (
                <div>
                    Image upload is not implemented yet!
                </div>
            )}
        </Container>
    );
}

export default BlockInput;

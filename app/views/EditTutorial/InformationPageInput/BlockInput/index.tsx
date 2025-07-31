import { IoTrashBin } from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';
import {
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import TutorialAssetInput from '#components/domain/TutorialAssetInput';
import InlineLayout from '#components/InlineLayout';
import TextArea from '#components/TextArea';
import { TutorialInformationPageBlockTypeEnum } from '#generated/types/graphql';

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
    tutorialId: string;
}

function BlockInput(props: Props) {
    const {
        className,
        index,
        value,
        onChange,
        error,
        onRemove,
        tutorialId,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            clientId: ulid(),
        }),
    );

    return (
        <InlineLayout
            className={_cs(styles.blockInput, className)}
            end={(
                <Button
                    className={styles.removeButton}
                    name={index}
                    onClick={onRemove}
                    styleVariant="transparent"
                    colorVariant="danger"
                    withoutPadding
                >
                    <IoTrashBin />
                </Button>
            )}
        >
            {value.blockType === TutorialInformationPageBlockTypeEnum.Text && (
                <TextArea
                    label={`#${value.blockNumber ?? (index + 1)} Text block`}
                    placeholder="Enter block text"
                    name="text"
                    value={value.text}
                    onChange={setFieldValue}
                    error={error?.text}
                />
            )}
            {value.blockType === TutorialInformationPageBlockTypeEnum.Image && (
                <TutorialAssetInput
                    label={`#${value.blockNumber ?? (index + 1)} Image block`}
                    name="image"
                    tutorialId={tutorialId}
                    value={value.image}
                    onChange={setFieldValue}
                    error={error?.image}
                    inputType="image"
                />
            )}
        </InlineLayout>
    );
}

export default BlockInput;

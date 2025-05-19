import { IoTrashBin } from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';
import {
    ObjectError,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
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
            heading={`Block #${value.blockNumber ?? (index + 1)}`}
            headingLevel={5}
            headerActions={(
                <Button
                    className={styles.removeButton}
                    name={index}
                    onClick={onRemove}
                    variant="action"
                    icons={<IoTrashBin />}
                >
                    Remove
                </Button>
            )}
        >
            {value.blockType === TutorialInformationPageBlockTypeEnum.Text && (
                <TextArea
                    placeholder="Enter block text"
                    name="text"
                    value={value.text}
                    onChange={setFieldValue}
                    error={error?.text}
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

import {
    useMemo,
    useRef,
    useState,
} from 'react';

import Button from '#components/Button';
import Popup from '#components/Popup';
import SelectInput from '#components/SelectInput';
import {
    AllEnumsQuery,
    useAllEnumsQuery,
} from '#generated/types/graphql';

import styles from './styles.module.css';

export type StatusOption = NonNullable<
    NonNullable<AllEnumsQuery['enums']>['ProjectStatusEnum']
>[number];

const keySelector = (item: StatusOption) => item.key;
const labelSelector = (item: StatusOption) => item.label;

interface Props {
    value: string;
    onChange: (newValue: string, name: string) => void;
    name: string;
    options?: string[];
    label: string;
}

function ProjectStatusSelectInput(props: Props) {
    const {
        value,
        name,
        onChange,
        options,
        label,
    } = props;

    const [{
        data: allEnumsResponse,
    }] = useAllEnumsQuery({});

    const allStatusOptions = allEnumsResponse?.enums?.ProjectStatusEnum;

    const filteredStatusOptions = useMemo(() => {
        if (!options) {
            return allStatusOptions;
        }
        return allStatusOptions?.filter((item) => options.includes(item.key));
    }, [options, allStatusOptions]);

    const selectRef = useRef<HTMLDivElement>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [pendingValue, setPendingValue] = useState<string | null>(null);

    const handleStatusChange = (newValue: string, fieldName: string) => {
        if (['ARCHIVED', 'DISCARDED'].includes(newValue)) {
            setPendingValue(newValue);
            setShowPopup(true);
            return;
        }
        onChange(newValue, fieldName);
    };

    const handleConfirm = () => {
        if (pendingValue) {
            onChange(pendingValue, name);
        }
        setPendingValue(null);
        setShowPopup(false);
    };

    const handleCancel = () => {
        setPendingValue(null);
        setShowPopup(false);
    };

    return (
        <div
            className={styles.statusInput}
            ref={selectRef}
        >
            <SelectInput
                label={label}
                name={name}
                value={value}
                onChange={handleStatusChange}
                options={filteredStatusOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
                nonClearable
            />
            {showPopup && (
                <Popup className={styles.popup} parentRef={selectRef}>
                    <div className={styles.popup}>
                        <p>
                            Are you sure you want to change the status to
                            {' '}
                            <strong>
                                &quot;
                                {pendingValue}
                                &quot;
                            </strong>
                            ?
                            <br />
                            After saving, the status cannot be modified. This action is
                            {' '}
                            <strong>irreversible</strong>
                            .
                        </p>
                        <div className={styles.button}>
                            <Button
                                name="cancel"
                                onClick={handleCancel}
                                styleVariant="transparent"
                                withoutPadding
                            >
                                Cancel
                            </Button>
                            <Button
                                name="confirm"
                                onClick={handleConfirm}
                                styleVariant="transparent"
                                withoutPadding
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}
        </div>
    );
}

export default ProjectStatusSelectInput;

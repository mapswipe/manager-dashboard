import {
    useEffect,
    useState,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import SegmentInput from '#components/SegmentInput';
import {
    IconEnum,
    TutorialScenarioPageType,
} from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

type PreviewKey = 'instructions' | 'hint' | 'success';

interface PreviewOption {
    key: PreviewKey;
    label: string;
}

const previewOptions: PreviewOption[] = [
    { key: 'instructions', label: 'Instruction' },
    { key: 'hint', label: 'Hint' },
    { key: 'success', label: 'Success' },
];

export interface PreviewItem {
    icon: IconEnum | undefined,
    title: string | undefined,
    description: string | undefined,
    popupVariant?: 'default' | 'success',
}

interface Props {
    className?: string;
    scenario: PartialForm<TutorialScenarioPageType> | undefined;
    onPreviewChange: (newValue: PreviewItem) => void;
}

function TutorialPreviewScreenSelectInput(props: Props) {
    const {
        className,
        scenario,
        onPreviewChange,
    } = props;

    const [currentPreview, setCurrentPreview] = useState<PreviewKey>('instructions');

    useEffect(() => {
        if (isNotDefined(scenario)) {
            return;
        }

        if (currentPreview === 'instructions') {
            onPreviewChange({
                icon: scenario.instructionsIcon,
                title: scenario.instructionsTitle,
                description: scenario.instructionsDescription,
            });
        } else if (currentPreview === 'hint') {
            onPreviewChange({
                icon: scenario.hintIcon,
                title: scenario.hintTitle,
                description: scenario.hintDescription,
            });
        } else if (currentPreview === 'success') {
            onPreviewChange({
                icon: scenario.successIcon,
                title: scenario.successTitle,
                description: scenario.successDescription,
                popupVariant: 'success',
            });
        }
    }, [scenario, currentPreview, onPreviewChange]);

    return (
        <SegmentInput
            className={className}
            name={undefined}
            value={currentPreview}
            onChange={setCurrentPreview}
            options={previewOptions}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export default TutorialPreviewScreenSelectInput;

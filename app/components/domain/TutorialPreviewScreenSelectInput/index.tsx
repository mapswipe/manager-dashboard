import { useEffect } from 'react';
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

export type PreviewKey = 'instructions' | 'hint' | 'success';

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
    previewKey: PreviewKey;
    setPreviewKey: React.Dispatch<React.SetStateAction<PreviewKey>>;
}

function TutorialPreviewScreenSelectInput(props: Props) {
    const {
        className,
        scenario,
        onPreviewChange,
        previewKey,
        setPreviewKey,
    } = props;

    useEffect(() => {
        if (isNotDefined(scenario)) {
            return;
        }

        if (previewKey === 'instructions') {
            onPreviewChange({
                icon: scenario.instructionsIcon,
                title: scenario.instructionsTitle,
                description: scenario.instructionsDescription,
            });
        } else if (previewKey === 'hint') {
            onPreviewChange({
                icon: scenario.hintIcon,
                title: scenario.hintTitle,
                description: scenario.hintDescription,
            });
        } else if (previewKey === 'success') {
            onPreviewChange({
                icon: scenario.successIcon,
                title: scenario.successTitle,
                description: scenario.successDescription,
                popupVariant: 'success',
            });
        }
    }, [scenario, previewKey, onPreviewChange]);

    return (
        <SegmentInput
            className={className}
            name={undefined}
            value={previewKey}
            onChange={setPreviewKey}
            options={previewOptions}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export default TutorialPreviewScreenSelectInput;

import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import Icon from '#components/domain/Icon';
import TutorialPreviewScreenSelectInput, { PreviewItem } from '#components/domain/TutorialPreviewScreenSelectInput';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import MapillaryImagePreview from '#components/MapillaryImagePreview';
import MobilePreview from '#components/MobilePreview';
import { TutorialScenarioPageCreateInput } from '#generated/types/graphql';

import { PartialCustomOptionInputFields } from '../CustomOptionInput/schema';
import CustomOptionPreview from '../CustomOptionsPreview';

import styles from './styles.module.css';

interface Props {
    className?: string;
    projectInstruction: string | undefined | null;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
    customOptions: PartialCustomOptionInputFields[] | undefined;
}

function StreetScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        projectInstruction,
        customOptions,
    } = props;

    const [preview, setPreview] = useState<PreviewItem | undefined>();
    const imageId = scenario?.tasks?.[0].projectTypeSpecifics?.street?.mapillaryImageId;

    return (
        <ListLayout
            className={_cs(styles.findScenarioPreview, className)}
            layout="block"
        >
            <MobilePreview
                heading={projectInstruction}
                popupIcons={<Icon value={preview?.icon} />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                popupVariant={preview?.popupVariant}
                contentClassName={styles.content}
            >
                <MapillaryImagePreview
                    imageId={imageId}
                    className={styles.streetPreview}
                />
                <CustomOptionPreview
                    value={customOptions}
                />
            </MobilePreview>
            <InlineLayout withCenteredContent>
                <TutorialPreviewScreenSelectInput
                    scenario={scenario}
                    onPreviewChange={setPreview}
                />
            </InlineLayout>
        </ListLayout>
    );
}

export default StreetScenarioPreview;

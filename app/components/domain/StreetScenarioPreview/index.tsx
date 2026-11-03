import { _cs } from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import Icon from '#components/domain/Icon';
import { PreviewItem } from '#components/domain/TutorialPreviewScreenSelectInput';
import ListLayout from '#components/ListLayout';
import MapillaryImagePreview from '#components/MapillaryImagePreview';
import MobilePreview from '#components/MobilePreview';
import PanoramaxImagePreview from '#components/PanoramaxImagePreview';
import {
    StreetImageProviderEnum,
    StreetProjectPropertyType,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';

import { PartialCustomOptionInputFields } from '../CustomOptionInput/schema';
import CustomOptionPreview from '../CustomOptionsPreview';

import styles from './styles.module.css';

interface Props {
    className?: string;
    projectInstruction: string | undefined | null;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
    customOptions: PartialCustomOptionInputFields[] | undefined;
    preview: PreviewItem | undefined;
    provider: StreetProjectPropertyType['provider'] | undefined;
    panoramaxCustom: StreetProjectPropertyType['panoramaxCustom'] | undefined;
}

function StreetScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        projectInstruction,
        customOptions,
        preview,
        provider,
        panoramaxCustom,
    } = props;

    const imageId = scenario?.tasks?.[0].projectTypeSpecifics?.street?.mapillaryImageId;
    const isPanoramaxProvider = [
        StreetImageProviderEnum.Panoramax,
        StreetImageProviderEnum.PanoramaxCustom,
    ].includes(provider as StreetImageProviderEnum);

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
                {provider === StreetImageProviderEnum.Mapillary && (
                    <MapillaryImagePreview
                        imageId={imageId}
                        className={styles.streetPreview}
                    />
                )}
                {isPanoramaxProvider && (
                    <PanoramaxImagePreview
                        imageId={imageId}
                        className={styles.streetPreview}
                        url={panoramaxCustom?.url}
                    />
                )}
                <CustomOptionPreview
                    value={customOptions}
                />
            </MobilePreview>
        </ListLayout>
    );
}

export default StreetScenarioPreview;

import TutorialAssetPreview from '#components/domain/TutorialAssetPreview';
import Heading from '#components/Heading';
import InlineLayout from '#components/InlineLayout';
import MarkdownPreview from '#components/MarkdownPreview';
import MobilePreview from '#components/MobilePreview';
import {
    IconEnum,
    TutorialInformationPageBlockTypeEnum,
} from '#generated/types/graphql';
import { iconMapping } from '#utils/icon';

import { PartialInformationPageInputFields } from '../schema';

import styles from './styles.module.css';

interface Props {
    value: PartialInformationPageInputFields;
    projectInstruction: string | undefined | null;
    // projectType: ProjectTypeEnum | undefined;
}

export default function InformationPagePreview(props: Props) {
    const {
        value,
        projectInstruction,
    } = props;

    const heading = projectInstruction;
    const SwipeLeftIcon = iconMapping[IconEnum.SwipeLeft];

    return (
        <MobilePreview
            className={styles.informationPreview}
            heading={heading}
            contentClassName={styles.content}
        >
            <Heading
                className={styles.heading}
                level={5}
            >
                {value?.title || `{page title ${value.pageNumber}}`}
            </Heading>
            {value?.blocks?.map((page) => {
                if (page.blockType === TutorialInformationPageBlockTypeEnum.Text) {
                    return (
                        <MarkdownPreview
                            key={page.blockNumber}
                            markdown={page.text || '{block}'}
                        />
                    );
                }

                if (page.blockType === TutorialInformationPageBlockTypeEnum.Image) {
                    return (
                        <TutorialAssetPreview
                            key={page.blockNumber}
                            className={styles.imagePreview}
                            rendererClassName={styles.image}
                            assetId={page.image}
                        />
                    );
                }

                return null;
            })}
            <InlineLayout
                className={styles.swipeToContinue}
                end={<SwipeLeftIcon className={styles.swipeIcon} />}
                spacing="sm"
            >
                Swipe to continue
            </InlineLayout>
        </MobilePreview>
    );
}

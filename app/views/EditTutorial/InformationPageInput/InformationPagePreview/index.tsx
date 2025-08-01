import TutorialAssetPreview from '#components/domain/TutorialAssetPreview';
import MarkdownPreview from '#components/MarkdownPreview';
import MobilePreview from '#components/MobilePreview';
import { TutorialInformationPageBlockTypeEnum } from '#generated/types/graphql';

import { PartialInformationPageInputFields } from '../schema';

import styles from './styles.module.css';

interface Props {
    value: PartialInformationPageInputFields;
    lookFor: string | undefined;
}

export default function InformationPagePreview(props: Props) {
    const {
        value,
        lookFor,
    } = props;

    return (
        <MobilePreview
            className={styles.informationPreview}
            heading={lookFor || '{look for}'}
            headerDescription="You are looking for:"
            contentClassName={styles.content}
        >
            {value?.title || `{page title ${value.pageNumber}}`}
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
                            assetId={page.image}
                        />
                    );
                }

                return null;
            })}
        </MobilePreview>
    );
}

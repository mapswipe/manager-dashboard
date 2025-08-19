import {
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import Icon from '#components/domain/Icon';
import MobilePreview from '#components/MobilePreview';

import PreviewSegmentInput, { PreviewItem } from '../PreviewSegmentInput';
import { PartialScenarioPageInputFields } from '../schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    lookFor: string | undefined;
    scenario: PartialScenarioPageInputFields | undefined;
    customOptions: PartialCustomOptionInputFields[] | undefined;
}

function ValidateImageScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        lookFor,
        customOptions,
    } = props;

    const imgRef = useRef<HTMLImageElement>(null);
    const [preview, setPreview] = useState<PreviewItem | undefined>();
    const task = scenario?.tasks?.[0]?.projectTypeSpecifics?.validateImage;
    const [bbox, setBbox] = useState<{
        x: number,
        y: number,
        width: number,
        height: number
    } | undefined>();

    useLayoutEffect(() => {
        if (isNotDefined(imgRef.current)) {
            setBbox(undefined);
            return;
        }

        if (isNotDefined(task?.annotation?.bbox)) {
            setBbox(undefined);
            return;
        }

        const imageWidth = task.width ?? imgRef.current.naturalWidth;
        const imageHeight = task.height ?? imgRef.current.naturalHeight;

        const containerWidth = imgRef.current.clientWidth;
        const containerHeight = imgRef.current.clientHeight;

        const containerAspectRatio = containerWidth / containerHeight;
        const imageAspectRatio = imageWidth / imageHeight;

        const renderedHeight = imageAspectRatio > containerAspectRatio
            ? containerWidth / imageAspectRatio
            : containerHeight;

        const renderedWidth = containerAspectRatio > imageAspectRatio
            ? containerHeight * imageAspectRatio
            : containerWidth;

        const yExcess = containerHeight - renderedHeight;
        const xExcess = containerWidth - renderedWidth;

        const [x1, y1, w, h] = task.annotation.bbox;

        const cx = (x1 / imageWidth) * renderedWidth + xExcess / 2;
        const cy = (y1 / imageHeight) * renderedHeight + yExcess / 2;
        const cw = (w / imageWidth) * renderedWidth;
        const ch = (h / imageHeight) * renderedHeight;

        setBbox({
            x: cx,
            y: cy,
            width: cw,
            height: ch,
        });
    }, [task]);

    return (
        <div className={_cs(styles.validateImageScenarioPreview, className)}>
            <MobilePreview
                heading={`Does the shape outline a ${lookFor}?`}
                popupIcons={<Icon value={preview?.icon} />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                contentClassName={styles.content}
            >
                <div className={styles.imageWrapper}>
                    <img
                        ref={imgRef}
                        className={styles.taskImage}
                        src={task?.url}
                        alt={task?.fileName}
                    />
                    {isDefined(bbox) && (
                        <svg className={styles.bboxSvg}>
                            <rect
                                className={styles.bboxRect}
                                x={bbox.x}
                                y={bbox.y}
                                width={bbox.width}
                                height={bbox.height}
                            />
                        </svg>
                    )}
                </div>
                <CustomOptionPreview
                    value={customOptions}
                />
            </MobilePreview>
            <PreviewSegmentInput
                scenario={scenario}
                onPreviewChange={setPreview}
            />
        </div>
    );
}

export default ValidateImageScenarioPreview;

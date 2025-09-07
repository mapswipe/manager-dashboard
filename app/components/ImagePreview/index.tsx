import { PiImageThin } from 'react-icons/pi';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    src?: string;
    alt: string;
}

function ImagePreview(props: Props) {
    const {
        className,
        src,
        alt,
    } = props;

    return (
        <div
            className={_cs(
                styles.imagePreview,
                className,
            )}
        >
            {isDefined(src) && (
                <img
                    className={styles.image}
                    src={src}
                    alt={alt}
                />
            )}
            {isNotDefined(src) && (
                <div className={styles.fallbackImage}>
                    <PiImageThin className={styles.icon} />
                </div>
            )}
        </div>
    );
}

export default ImagePreview;

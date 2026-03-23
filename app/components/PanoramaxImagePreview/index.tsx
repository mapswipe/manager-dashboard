import '@panoramax/web-viewer/build/index.css';
import '@panoramax/web-viewer';

import { useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    imageId: string | undefined;
    url?: string | undefined | null;
}

const DEFAULT_ENDPOINT = 'https://api.panoramax.xyz/api';

function PanoramaxImagePreview({ className, imageId, url }: Props) {
    const endpoint = useMemo(() => {
        // NOTE: Workaround to use Metacatalog API for MapComplete Panoramax due to CORS issues.
        if (!url) return DEFAULT_ENDPOINT;
        return url.includes('mapcomplete') ? DEFAULT_ENDPOINT : `${url.replace(/\/+$/, '')}/api`;
    }, [url]);

    const PanoramaxPhotoViewer = 'pnx-photo-viewer' as React.ElementType;
    return (
        <div className={_cs(styles.panoramaxImagePreview, className)}>
            {isDefined(imageId) && (
                <PanoramaxPhotoViewer
                    class={styles.viewer}
                    endpoint={endpoint}
                    picture={imageId}
                    widgets={false}
                    url-parameters={false}
                    keyboard-shortcuts={false}
                    psv-options={JSON.stringify({
                        picturesNavigation: 'pic',
                        displayAnnotations: false,
                    })}
                />
            )}
        </div>
    );
}

export default PanoramaxImagePreview;

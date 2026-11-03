import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Message from '#components/Message';

import styles from './styles.module.css';

interface Props {
    className?: string;
    imageId: string | undefined;
    url?: string | undefined | null;
}

const DEFAULT_URL = 'https://api.panoramax.xyz/';
const MAPCOMPLETE_HOSTNAME = 'mapcomplete.org';

function getBaseUrl(url: string | null | undefined) {
    if (!url) {
        return DEFAULT_URL;
    }
    // NOTE: MapComplete pictures are loaded through the public catalog,
    // which also serves them, to avoid cross-origin requests to the instance
    const { hostname } = new URL(url);
    if (hostname === MAPCOMPLETE_HOSTNAME || hostname.endsWith(`.${MAPCOMPLETE_HOSTNAME}`)) {
        return DEFAULT_URL;
    }
    return url;
}

function PanoramaxImagePreview({ className, imageId, url }: Props) {
    // NOTE: The viewer is large, so it is fetched only when a preview is shown.
    // The custom element upgrades in place once its definition loads.
    const [viewerErrored, setViewerErrored] = useState(false);
    useEffect(() => {
        Promise.all([
            import('@panoramax/web-viewer/build/photoviewer.css'),
            import('@panoramax/web-viewer/build/photoviewer.js'),
        ]).catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Error loading the Panoramax viewer:', error);
            setViewerErrored(true);
        });
    }, []);

    const endpoint = useMemo(() => new URL('api', getBaseUrl(url)).href, [url]);

    const PanoramaxPhotoViewer = 'pnx-photo-viewer' as React.ElementType;
    return (
        <div className={_cs(styles.panoramaxImagePreview, className)}>
            {viewerErrored && (
                <Message
                    errored
                    errorMessage="Could not load the Panoramax image viewer"
                />
            )}
            {!viewerErrored && isDefined(imageId) && (
                <PanoramaxPhotoViewer
                    // NOTE: The viewer does not recover from a failed load when its
                    // attributes change, so it is remounted instead
                    key={`${endpoint}-${imageId}`}
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

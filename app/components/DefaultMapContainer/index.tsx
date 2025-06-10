import { MapContainer } from '@togglecorp/re-map';

import styles from './styles.module.css';

function DefaultMapContainer() {
    return (
        <MapContainer
            className={styles.defaultMapContainer}
        />
    );
}

export default DefaultMapContainer;

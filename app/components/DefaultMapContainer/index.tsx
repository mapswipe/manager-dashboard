import { _cs } from '@togglecorp/fujs';
import { MapContainer } from '@togglecorp/re-map';

import styles from './styles.module.css';

interface Props {
    className?: string,
    compact?: boolean;
}

function DefaultMapContainer(props: Props) {
    const {
        className,
        compact = false,
    } = props;

    return (
        <MapContainer
            className={_cs(
                styles.defaultMapContainer,
                compact && styles.compact,
                className,
            )}
        />
    );
}

export default DefaultMapContainer;

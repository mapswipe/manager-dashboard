import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { PiCopy } from 'react-icons/pi';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import EnumsContext from '#contexts/EnumsContext';
import TileServerContext from '#contexts/TileServerContext';
import {
    ProjectVectorTileServerConfig,
    VectorTileServerNameEnum,
} from '#generated/types/graphql';

interface Props {
    label?: React.ReactNode;
    className?: string;
    value: ProjectVectorTileServerConfig;
}

function VectorTileServerOutput(props: Props) {
    const {
        label = 'Tile server',
        className,
        value,
    } = props;

    const { vectorTileServerNameMapping } = useContext(EnumsContext);
    const { vector: vectorTileServers } = useContext(TileServerContext);

    const {
        url,
        credits,
        minZoom,
        maxZoom,
    } = useMemo(() => {
        const vectorTileServerMapping = listToMap(
            vectorTileServers,
            ({ type }) => type,
        );

        const { name } = value;

        if (name === VectorTileServerNameEnum.Custom) {
            return {
                url: value.custom?.url,
                credits: value.custom?.credits,
                minZoom: value.custom?.minZoom,
                maxZoom: value.custom?.maxZoom,
            };
        }

        return {
            url: vectorTileServerMapping[name]?.url,
            credits: vectorTileServerMapping[name]?.credits,
            minZoom: vectorTileServerMapping[name]?.minZoom,
            maxZoom: vectorTileServerMapping[name]?.maxZoom,
        };
    }, [vectorTileServers, value]);

    const handleCopyUrlClick = useCallback((urlToCopy: string) => {
        navigator.clipboard.writeText(urlToCopy);
    }, []);

    return (
        <Container
            className={className}
            heading={label}
            headingLevel={6}
            spacing="sm"
        >
            <TextOutput
                label="Imagery server"
                value={vectorTileServerNameMapping?.[value.name].label}
                description={isDefined(url) && value.name === VectorTileServerNameEnum.Custom && (
                    <Button
                        name={url}
                        styleVariant="action"
                        spacing="sm"
                        title="Copy URL"
                        onClick={handleCopyUrlClick}
                    >
                        <PiCopy />
                    </Button>
                )}
            />
            {/*
            <TextOutput
                label="Url"
                value={url}
            />
            */}
            <TextOutput
                label="Min zoom"
                value={minZoom}
                valueType="number"
            />
            <TextOutput
                label="Max zoom"
                value={maxZoom}
                valueType="number"
            />
            <TextOutput
                label="Credits"
                value={credits}
            />
        </Container>
    );
}

export default VectorTileServerOutput;

import { createContext } from 'react';

import { TileServersQuery } from '#generated/types/graphql';

export const defaultTileServersValue: TileServersQuery['tileServers'] = {
    raster: [],
    vector: [],
};

const TileServerContext = createContext<TileServersQuery['tileServers']>(
    defaultTileServersValue,
);

export default TileServerContext;

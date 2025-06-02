import React, {
    useEffect,
    useState,
} from 'react';
import ReactDOM from 'react-dom';
import {
    gql,
    useQuery,
} from '@apollo/client';
import { isDefined } from '@togglecorp/fujs';

import PreloadMessage from '#base/components/PreloadMessage';
import EnumsContext, { defaultAllEnumsValue } from '#base/context/EnumsContext';
import TileServerContext, { defaultTileServersValue } from '#base/context/TileServerContext';
import UserContext from '#base/context/UserContext';
import {
    AllEnumsQuery,
    AllEnumsQueryVariables,
    MeQuery,
    MeQueryVariables,
    TileServersQuery,
    TileServersQueryVariables,
} from '#generated/types/graphql';

const TILE_SERVERS_QUERY = gql`
query TileServers {
    tileServers {
        raster {
            url
            type
            label
            credits
        }
        vector {
            label
            layers
            maxZoom
            minZoom
            type
            url
            credits
        }
    }
}

`;

const ME_QUERY = gql`
query Me {
    me {
        id
        displayName
    }
}
`;

const ALL_ENUMS_QUERY = gql`
query AllEnums {
    enums {
        ProjectStatusEnum {
            key
            label
        }
        ProjectTypeEnum {
            key
            label
        }
        TileServerNameEnum {
            key
            label
        }
        VectorTileServerNameEnum {
            key
            label
        }
        TutorialInformationPageBlockTypeEnum {
            key
            label
        }
        TutorialScenarioIconEnum {
            key
            label
        }
        ValidateObjectSourceTypeEnum {
            key
            label
        }
        OverlayLayerTypeEnum {
            key
            label
        }
    }
}
`;

interface Props {
    preloadClassName?: string;
    children: React.ReactNode;
}
function Init(props: Props) {
    const {
        preloadClassName,
        children,
    } = props;

    const [csrfReady, setCsrfReady] = React.useState(false);
    const { authenticated, setUser } = React.useContext(UserContext);
    const [ready, setReady] = useState(authenticated);

    useEffect(() => {
        async function healthCheck() {
            try {
                await fetch(
                    `${import.meta.env.APP_GRAPHQL_API_DOMAIN}/health-check/?format=json`,
                    { credentials: 'include' },
                );
            } catch (ex) {
                // eslint-disable-next-line no-console
                console.error('Error getting health check', ex);
            }
            setCsrfReady(true);
        }
        healthCheck();
    }, [setCsrfReady]);

    const {
        loading: meResponseLoading,
        data: meResponseData,
    } = useQuery<MeQuery, MeQueryVariables>(
        ME_QUERY,
        { skip: authenticated || !csrfReady },
    );

    useEffect(() => {
        if (!csrfReady || authenticated || meResponseLoading) {
            return;
        }

        ReactDOM.unstable_batchedUpdates(() => {
            if (isDefined(meResponseData) && isDefined(meResponseData.me)) {
                setUser({
                    id: meResponseData.me.id,
                    displayName: meResponseData.me.displayName,
                });
            } else {
                setUser(undefined);
            }

            setReady(true);
        });
    }, [csrfReady, authenticated, meResponseLoading, meResponseData, setUser]);

    const {
        // loading: allEnumsResponseLoading,
        data: allEnumsResponse,
    } = useQuery<AllEnumsQuery, AllEnumsQueryVariables>(
        ALL_ENUMS_QUERY,
        { skip: !csrfReady },
    );

    const {
        loading: tileServersLoading,
        data: tileServersResponse,
    } = useQuery<TileServersQuery, TileServersQueryVariables>(
        TILE_SERVERS_QUERY,
        { skip: !csrfReady },
    );

    if (!ready || !csrfReady || tileServersLoading) {
        return (
            <PreloadMessage
                className={preloadClassName}
                content="Checking user session..."
            />
        );
    }

    return (
        <TileServerContext.Provider
            value={tileServersResponse?.tileServers ?? defaultTileServersValue}
        >
            <EnumsContext.Provider
                value={allEnumsResponse?.enums ?? defaultAllEnumsValue}
            >
                {children}
            </EnumsContext.Provider>
        </TileServerContext.Provider>
    );
}
export default Init;

import React, {
    useEffect,
    useState,
} from 'react';
import ReactDOM from 'react-dom';
import { isDefined } from '@togglecorp/fujs';
import { type } from 'arktype';
import { gql } from 'urql';

import PreloadMessage from '#base/components/PreloadMessage';
import EnumsContext, { defaultAllEnumsValue } from '#base/context/EnumsContext';
import HealthCheckContext, { HealthCheckData } from '#base/context/HealthCheckContext';
import TileServerContext, { defaultTileServersValue } from '#base/context/TileServerContext';
import UserContext from '#base/context/UserContext';
import {
    useAllEnumsQuery,
    useMeQuery,
    useTileServersQuery,
} from '#generated/types/graphql';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TILE_SERVERS_QUERY = gql`
query TileServers {
    tileServers {
        raster {
            url
            type
            label
            credits
            maxZoom
            minZoom
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ME_QUERY = gql`
query Me {
    me {
        id
        displayName
    }
}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        RasterTileServerNameEnum {
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
        IconEnum {
            key
            label
        }
        ValidateObjectSourceTypeEnum {
            key
            label
        }
        ValidateImageSourceTypeEnum {
            key
            label
        }
        OverlayLayerTypeEnum {
            key
            label
        }
        TutorialStatusEnum {
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

    const { authenticated, setUser } = React.useContext(UserContext);
    const [healthCheckData, setHealthCheckData] = useState<HealthCheckData>();

    const [csrfReady, setCsrfReady] = React.useState(false);
    const [useDetailsReady, setUserDetailsReady] = useState(authenticated);

    useEffect(() => {
        async function healthCheck() {
            try {
                const res = await fetch(
                    `${import.meta.env.APP_GRAPHQL_API_DOMAIN}/health-check/?format=json`,
                    { credentials: 'include' },
                );
                const serverResponse = await res.json();

                const healthData = type.object.as<HealthCheckData>()(serverResponse);

                if (healthData instanceof type.errors) {
                    // eslint-disable-next-line no-console
                    console.error(healthData.summary);
                } else {
                    setHealthCheckData(healthData);
                }
            } catch (ex) {
                // eslint-disable-next-line no-console
                console.error('Error getting health check', ex);
            }

            setCsrfReady(true);
        }
        healthCheck();
    }, [setCsrfReady]);

    const [{
        fetching: meResponseLoading,
        data: meResponseData,
    }] = useMeQuery({
        pause: authenticated || !csrfReady,
    });

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

            setUserDetailsReady(true);
        });
    }, [csrfReady, authenticated, meResponseLoading, meResponseData, setUser]);

    const [{ data: allEnumsResponse }] = useAllEnumsQuery({
        pause: !csrfReady,
    });

    const [{
        fetching: tileServersLoading,
        data: tileServersResponse,
    }] = useTileServersQuery({
        pause: !csrfReady,
    });

    if (!useDetailsReady || !csrfReady || tileServersLoading) {
        return (
            <PreloadMessage
                className={preloadClassName}
                content="Checking user session..."
            />
        );
    }

    return (
        <HealthCheckContext.Provider value={healthCheckData}>
            <TileServerContext.Provider
                value={tileServersResponse?.tileServers ?? defaultTileServersValue}
            >
                <EnumsContext.Provider
                    value={allEnumsResponse?.enums ?? defaultAllEnumsValue}
                >
                    {children}
                </EnumsContext.Provider>
            </TileServerContext.Provider>
        </HealthCheckContext.Provider>
    );
}
export default Init;

import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';
import ReactDOM from 'react-dom';
import {
    Outlet,
    useNavigation,
} from 'react-router';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import { type } from 'arktype';
import { gql } from 'urql';

import Navbar from '#base/components/Navbar';
import PreloadMessage from '#base/components/PreloadMessage';
import EnumsContext, { EnumsContextProps } from '#contexts/EnumsContext';
import HealthCheckContext, { HealthCheckData } from '#contexts/HealthCheckContext';
import TileServerContext, { defaultTileServersValue } from '#contexts/TileServerContext';
import UserContext from '#contexts/UserContext';
import {
    useAllEnumsQuery,
    useMeQuery,
    useTileServersQuery,
} from '#generated/types/graphql';
import { resolveUrl } from '#utils/common';

import styles from './styles.module.css';

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
            disabled
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
        FirebasePushStatusEnum {
            key
            label
        }
        SubGridSizeEnum {
            key
            label
        }
    }
}
`;

function RootLayout() {
    const navigation = useNavigation();

    const { authenticated, setUser } = React.useContext(UserContext);
    const [healthCheckData, setHealthCheckData] = useState<HealthCheckData>();

    const [csrfReady, setCsrfReady] = React.useState(false);
    const [useDetailsReady, setUserDetailsReady] = useState(authenticated);

    const navigationPending = !!navigation.location;

    useEffect(() => {
        async function healthCheck() {
            try {
                const res = await fetch(
                    resolveUrl(import.meta.env.APP_GRAPHQL_API_DOMAIN, 'health-check/?format=json'),
                    {
                        method: 'GET',
                        credentials: 'include',
                    },
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
        pause: !csrfReady,
    });

    useEffect(() => {
        if (!csrfReady || meResponseLoading) {
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
    }, [csrfReady, meResponseLoading, meResponseData, setUser]);

    const [{ data: allEnumsResponse }] = useAllEnumsQuery({
        pause: !csrfReady || !authenticated,
    });

    const [{
        fetching: tileServersLoading,
        data: tileServersResponse,
    }] = useTileServersQuery({
        pause: !csrfReady || !authenticated,
    });

    const enumContextValue = useMemo(() => ({
        validateObjectSourceTypeOptions: allEnumsResponse?.enums.ValidateObjectSourceTypeEnum ?? [],
        validateImageSourceTypeOptions: allEnumsResponse?.enums.ValidateImageSourceTypeEnum ?? [],
        projectStatusOptions: allEnumsResponse?.enums.ProjectStatusEnum ?? [],
        projectTypeOptions: allEnumsResponse?.enums.ProjectTypeEnum ?? [],
        tutorialInformationPageBlockTypeOptions: allEnumsResponse
            ?.enums.TutorialInformationPageBlockTypeEnum ?? [],
        iconOptions: allEnumsResponse?.enums.IconEnum ?? [],
        overlayLayerTypeOptions: allEnumsResponse?.enums.OverlayLayerTypeEnum ?? [],
        tutorialStatusOptions: allEnumsResponse?.enums.TutorialStatusEnum ?? [],
        firebasePushStatusOptions: allEnumsResponse?.enums.FirebasePushStatusEnum ?? [],
        subGridSizeOptions: allEnumsResponse?.enums.SubGridSizeEnum ?? [],
        validateObjectSourceTypeMapping: listToMap(
            allEnumsResponse?.enums.ValidateObjectSourceTypeEnum,
            ({ key }) => key,
        ),
        validateImageSourceTypeMapping: listToMap(
            allEnumsResponse?.enums.ValidateImageSourceTypeEnum,
            ({ key }) => key,
        ),
        projectStatusMapping: listToMap(
            allEnumsResponse?.enums.ProjectStatusEnum,
            ({ key }) => key,
        ),
        projectTypeMapping: listToMap(
            allEnumsResponse?.enums.ProjectTypeEnum,
            ({ key }) => key,
        ),
        tutorialInformationPageBlockTypeMapping: listToMap(
            allEnumsResponse?.enums.TutorialInformationPageBlockTypeEnum,
            ({ key }) => key,
        ),
        iconMapping: listToMap(
            allEnumsResponse?.enums.IconEnum,
            ({ key }) => key,
        ),
        overlayLayerTypeMapping: listToMap(
            allEnumsResponse?.enums.OverlayLayerTypeEnum,
            ({ key }) => key,
        ),
        tutorialStatusMapping: listToMap(
            allEnumsResponse?.enums.TutorialStatusEnum,
            ({ key }) => key,
        ),
        firebasePushStatusMapping: listToMap(
            allEnumsResponse?.enums.FirebasePushStatusEnum,
            ({ key }) => key,
        ),
    } satisfies EnumsContextProps), [allEnumsResponse]);

    return (
        <HealthCheckContext.Provider value={healthCheckData}>
            <TileServerContext.Provider
                value={tileServersResponse?.tileServers ?? defaultTileServersValue}
            >
                <EnumsContext.Provider
                    value={enumContextValue}
                >
                    <div className={styles.rootLayout}>
                        <Navbar />
                        <div className={styles.globalLoading}>
                            {navigationPending && (
                                <div className={styles.loader} />
                            )}
                        </div>
                        {(!useDetailsReady || !csrfReady || tileServersLoading) ? (
                            <PreloadMessage>
                                Checking user session...
                            </PreloadMessage>
                        ) : <Outlet />}
                    </div>
                </EnumsContext.Provider>
            </TileServerContext.Provider>
        </HealthCheckContext.Provider>
    );
}
export default RootLayout;

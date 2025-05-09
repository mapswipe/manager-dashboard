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
import UserContext from '#base/context/UserContext';
import {
    AllEnumsQuery,
    AllEnumsQueryVariables,
    MeQuery,
    MeQueryVariables,
} from '#generated/types/graphql';

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
        TutorialInformationPageBlockTypeEnum {
            key
            label
        }
        TutorialScenarioIconEnum {
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
    const [ready, setReady] = useState(authenticated);

    const {
        loading: meResponseLoading,
        data: meResponseData,
    } = useQuery<MeQuery, MeQueryVariables>(
        ME_QUERY,
        { skip: authenticated },
    );

    const {
        // loading: allEnumsResponseLoading,
        data: allEnumsResponse,
    } = useQuery<AllEnumsQuery, AllEnumsQueryVariables>(
        ALL_ENUMS_QUERY,
    );

    useEffect(() => {
        if (authenticated || meResponseLoading) {
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
    }, [authenticated, meResponseLoading, meResponseData, setUser]);

    if (!ready) {
        return (
            <PreloadMessage
                className={preloadClassName}
                content="Checking user session..."
            />
        );
    }

    return (
        <EnumsContext.Provider
            value={allEnumsResponse?.enums ?? defaultAllEnumsValue}
        >
            {children}
        </EnumsContext.Provider>
    );
}
export default Init;

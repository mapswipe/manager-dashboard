import React, {
    useEffect,
    useState,
} from 'react';
import ReactDOM from 'react-dom';
import {
    gql,
    useQuery,
} from '@apollo/client';

import PreloadMessage from '#base/components/PreloadMessage';
import UserContext from '#base/context/UserContext';
import { MeQuery, MeQueryVariables } from '#generated/types/graphql';

const ME_QUERY = gql`
query Me {
    me {
        id
        displayName
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

    const { setUser } = React.useContext(UserContext);
    const [ready, setReady] = useState(false);

    const {
        loading: meResponseLoading,
        data: meResponseData,
    } = useQuery<MeQuery, MeQueryVariables>(ME_QUERY);

    useEffect(() => {
        if (meResponseLoading) {
            return;
        }

        if (!meResponseData) {
            ReactDOM.unstable_batchedUpdates(() => {
                setUser(undefined);
                setReady(true);
            });
        }
    }, [meResponseLoading, meResponseData, setUser]);

    if (!ready) {
        return (
            <PreloadMessage
                className={preloadClassName}
                content="Checking user session..."
            />
        );
    }

    return children;
}
export default Init;

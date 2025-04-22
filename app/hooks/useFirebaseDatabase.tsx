import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    DataSnapshot,
    onValue,
    Query,
} from 'firebase/database';

function useFirebaseDatabase<T = unknown>({
    query,
    skip = false,
}: {
    query: Query;
    skip?: boolean;
}) {
    const [pending, setPending] = useState(!skip);
    const [data, setData] = useState<Record<string, T>>();

    useEffect(() => {
        if (skip) {
            return undefined;
        }

        setPending(true);
        const handleQueryDone = (snapshot: DataSnapshot) => {
            setPending(false);

            if (!snapshot.exists()) {
                setData(undefined);
                return;
            }

            setData(snapshot.val() as Record<string, T>);
        };

        const handleQueryError = (error: unknown) => {
            // eslint-disable-next-line no-console
            console.error(error);
            setPending(false);
        };

        const unsubscribe = onValue(query, handleQueryDone, handleQueryError);

        return () => {
            setPending(false);
            unsubscribe();
        };
    }, [query, skip]);

    const returnValue = useMemo(() => ({
        data,
        pending,
    }), [data, pending]);

    return returnValue;
}

export default useFirebaseDatabase;

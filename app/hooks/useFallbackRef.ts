import { useRef } from 'react';

function useFallbackRef<T>(ref?: React.Ref<T>) {
    const localRef = useRef<T>(null);

    if (ref && typeof ref !== 'function') {
        return ref as React.MutableRefObject<T | null>;
    }

    return localRef;
}

export default useFallbackRef;

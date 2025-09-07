import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    bound,
    isNotDefined,
} from '@togglecorp/fujs';

type UploadStatus = 'ready' | 'uploading' | 'failed' | 'success';

export interface BulkUploadContextProps {
    uploadTokens: Record<string, boolean>;
    statusMap: Record<string, UploadStatus>;
    updateStatus: (clientId: string, status: UploadStatus) => void;
    register: (clientId: string) => void;
    unregister: (clientId: string) => void;
}

const BulkUploadContext = createContext<BulkUploadContextProps>({
    uploadTokens: {},
    statusMap: {},
    register: () => {
        // eslint-disable-next-line no-console
        console.error('BulkUpload::register called without a provider');
    },
    unregister: () => {
        // eslint-disable-next-line no-console
        console.error('BulkUpload::unregister called without a provider');
    },
    updateStatus: () => {
        // eslint-disable-next-line no-console
        console.error('BulkUpload::updateStatus called without a provider');
    },
});

const MAX_CONCURRENT_UPLOADS = 5;

export function useBulkUploadProvider() {
    const [uploadTokens, setUploadTokens] = useState<Record<string, boolean>>({});
    const [statusMapping, setStatusMapping] = useState<Record<string, UploadStatus>>({});

    const shouldUploadRef = useRef(false);
    const statusMappingRef = useRef<Record<string, UploadStatus>>({});

    const updateUploadTokens = useCallback((newStatusMapping: Record<string, UploadStatus>) => {
        setUploadTokens((oldUploadTokens) => {
            const newUploadTokens = { ...oldUploadTokens };

            Object.keys(newUploadTokens).forEach((uploadKey) => {
                if (
                    isNotDefined(newStatusMapping[uploadKey])
                        || newStatusMapping[uploadKey] === 'failed'
                        || newStatusMapping[uploadKey] === 'success'
                ) {
                    delete newUploadTokens[uploadKey];
                }
            });

            if (!shouldUploadRef.current) {
                return newUploadTokens;
            }

            const remainingSlot = bound(
                MAX_CONCURRENT_UPLOADS - Object.keys(newUploadTokens).length,
                0,
                MAX_CONCURRENT_UPLOADS,
            );

            if (remainingSlot === 0) {
                return oldUploadTokens;
            }

            Object.entries(newStatusMapping).filter(
                ([uploadKey, uploadStatus]) => !newUploadTokens[uploadKey] && uploadStatus === 'ready',
            ).slice(0, remainingSlot).forEach(([uploadKey]) => {
                newUploadTokens[uploadKey] = true;
            });

            return newUploadTokens;
        });
    }, []);

    useEffect(() => {
        updateUploadTokens(statusMapping);
    }, [statusMapping, updateUploadTokens]);

    const register = useCallback((clientId: string) => {
        setStatusMapping((prevStatusMapping) => {
            const newStatusMapping = {
                ...prevStatusMapping,
                [clientId]: 'ready' as const,
            };

            statusMappingRef.current = newStatusMapping;
            return newStatusMapping;
        });
    }, []);

    const unregister = useCallback((clientId: string) => {
        setStatusMapping((prevStatusMapping) => {
            const newStatusMapping = { ...prevStatusMapping };

            delete newStatusMapping[clientId];

            statusMappingRef.current = newStatusMapping;
            return newStatusMapping;
        });
    }, []);

    const updateStatus = useCallback((clientId: string, newStatus: UploadStatus) => {
        setStatusMapping((prevStatusMapping) => {
            const newStatusMapping = {
                ...prevStatusMapping,
                [clientId]: newStatus,
            };

            statusMappingRef.current = newStatusMapping;
            return newStatusMapping;
        });
    }, []);

    const startUpload = useCallback(() => {
        shouldUploadRef.current = true;
        updateUploadTokens(statusMappingRef.current);
    }, [updateUploadTokens]);

    const pauseUpload = useCallback(() => {
        shouldUploadRef.current = false;
    }, []);

    const uploadPending = Object.keys(uploadTokens).length !== 0;

    return useMemo(() => ({
        value: {
            statusMap: statusMapping,
            uploadTokens,
            register,
            unregister,
            updateStatus,
        } satisfies BulkUploadContextProps,
        startUpload,
        pauseUpload,
        uploadPending,
    }), [
        uploadPending,
        startUpload,
        pauseUpload,
        statusMapping,
        uploadTokens,
        register,
        unregister,
        updateStatus,
    ]);
}

export default BulkUploadContext;

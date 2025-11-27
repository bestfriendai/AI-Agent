import React, { useState, useCallback } from 'react';

// Mock implementation for Web to avoid native module errors during export
export const useConversation = (props: any) => {
    const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

    const startSession = useCallback(async (options: any) => {
        console.warn("ElevenLabs conversation is not supported on web.");
    }, [props]);

    const endSession = useCallback(async () => {
        // No-op
    }, [props]);

    return {
        status,
        startSession,
        endSession,
    };
};

export const ElevenLabsProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{ children } </>;
};

import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
    correlationId: string;
    userId?: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Retrieves current execution context from AsyncLocalStorage.
 */
export const getContext = (): RequestContext | undefined => {
    return asyncLocalStorage.getStore();
};

/**
 * Retrieves current correlationId from AsyncLocalStorage.
 */
export const getCorrelationId = (): string | undefined => {
    return asyncLocalStorage.getStore()?.correlationId;
};

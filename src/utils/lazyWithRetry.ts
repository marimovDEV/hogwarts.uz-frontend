import { lazy, ComponentType } from "react";

/**
 * A wrapper around React.lazy that handles "Failed to fetch dynamically imported module" errors.
 * This usually happens when a new version of the app is deployed and the browser tries to load
 * an old chunk that no longer exists on the server.
 */
export function lazyWithRetry(
    componentImport: () => Promise<{ default: ComponentType<any> }>,
    name?: string
) {
    return lazy(async () => {
        const pageHasAlreadyBeenReloaded = window.sessionStorage.getItem(
            `page-reloaded-${name || "generic"}`
        );

        try {
            const component = await componentImport();
            window.sessionStorage.removeItem(`page-reloaded-${name || "generic"}`);
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenReloaded) {
                // First fetch failed, reload the page to get the latest bundle/hashes
                window.sessionStorage.setItem(`page-reloaded-${name || "generic"}`, "true");
                window.location.reload();
                return { default: () => null }; // Return dummy component while reloading
            }

            // If it fails even after reload, throw the error
            console.error(`Failed to load lazy component "${name || "unknown"}":`, error);
            throw error;
        }
    });
}

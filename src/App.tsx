import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useI18n } from "./i18n";
import LoadingScreen from "./screens/LoadingScreen";
import { defineAssets } from "./utils/assets-utility";
import { initializeIndexedDB } from "./utils/indexedDB-utility";
import { importAllInkLabels } from "./utils/storymate-utility";

const Home = lazy(async () => {
    await Promise.all([initializeIndexedDB(), defineAssets(), useI18n(), importAllInkLabels()]);
    return import("./Home");
});

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div role='alert'>
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingScreen />}>
                <Home />
            </Suspense>
        </ErrorBoundary>
    );
}

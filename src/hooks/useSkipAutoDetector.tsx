import { narration } from "@drincs/pixi-vn";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { SKIP_DELAY } from "../constans";
import useAutoInfoStore from "../stores/useAutoInfoStore";
import useSkipStore from "../stores/useSkipStore";
import useStepStore from "../stores/useStepStore";
import useTypewriterStore from "../stores/useTypewriterStore";
import { INTERFACE_DATA_USE_QUEY_KEY } from "../use_query/useQueryInterface";
import useGameProps from "./useGameProps";
import useInterval from "./useInterval";

export default function useSkipAutoDetector() {
    const skipEnabled = useSkipStore(useShallow((state) => state.enabled));
    const autoEnabled = useAutoInfoStore(useShallow((state) => state.enabled));
    const autoTime = useAutoInfoStore(useShallow((state) => state.time));
    const typewriterInProgress = useTypewriterStore(useShallow((state) => state.inProgress));
    const setNextStepLoading = useStepStore(useShallow((state) => state.setLoading));
    const queryClient = useQueryClient();
    const gameProps = useGameProps();

    const nextOnClick = useCallback(async () => {
        setNextStepLoading(true);
        try {
            if (!narration.canGoNext) {
                setNextStepLoading(false);
                return;
            }
            narration
                .goNext(gameProps)
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: [INTERFACE_DATA_USE_QUEY_KEY] });
                    setNextStepLoading(false);
                })
                .catch((e) => {
                    setNextStepLoading(false);
                    console.error(e);
                });
            return;
        } catch (e) {
            setNextStepLoading(false);
            console.error(e);
            return;
        }
    }, [gameProps, queryClient]);

    useInterval(nextOnClick, {
        delay: SKIP_DELAY,
        enabled: skipEnabled,
    });

    useEffect(() => {
        if (skipEnabled) {
            return;
        }
        if (autoEnabled && !typewriterInProgress) {
            if (autoTime) {
                let millisecond = autoTime * 1000;
                // Debouncing
                let timeout = setTimeout(() => {
                    if (autoEnabled && !skipEnabled) {
                        nextOnClick();
                    }
                }, millisecond);

                return () => {
                    clearTimeout(timeout);
                };
            }
        }
    }, [autoTime, autoEnabled, typewriterInProgress, skipEnabled, nextOnClick]);

    return null;
}

import { Grid, Sheet, Stack, Typography, useColorScheme } from "@mui/joy";
import Box from "@mui/joy/Box";
import { RefObject, useCallback, useMemo, useRef } from "react";
import Markdown from "react-markdown";
import { MarkdownTypewriterHooks } from "react-markdown-typewriter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/react/shallow";
import AnimatedDots from "../components/AnimatedDots";
import { useQueryDialogue } from "../hooks/useQueryInterface";
import useInterfaceStore from "../stores/useInterfaceStore";
import useTypewriterStore from "../stores/useTypewriterStore";
import ChoiceMenu from "./ChoiceMenu";
import PreviousDialoguesScreen from "./PreviousDialoguesScreen";

export default function NarrationScreen() {
    const { data: { animatedText, text } = {} } = useQueryDialogue();
    const hidden = useInterfaceStore((state) => state.hidden || (animatedText || text ? false : true));
    const cardVarians = useMemo(
        () =>
            hidden
                ? `motion-opacity-out-0 motion-translate-y-out-[50%]`
                : `motion-opacity-in-0 motion-translate-y-in-[50%]`,
        [hidden]
    );
    const paragraphRef = useRef<HTMLDivElement>(null);

    return (
        <Grid
            container
            direction='column'
            sx={{
                height: "100%",
                width: "100%",
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
            }}
            className={cardVarians}
        >
            <Box
                sx={{
                    position: "absolute",
                    bgcolor: "background.level1",
                    opacity: 0.9,
                    borderRadius: "sm",
                    overflow: "auto",
                    top: 0,
                    bottom: 0,
                    maxWidth: { sm: 650, md: 650, lg: "60%" },
                    padding: 2,
                    width: "100%",
                    pointerEvents: "auto",
                    margin: { xs: 0, sm: 2, md: 3 },
                }}
            />
            <Sheet
                ref={paragraphRef}
                sx={{
                    bgcolor: "transparent",
                    borderRadius: "sm",
                    overflow: "auto",
                    height: "100%",
                    maxWidth: { sm: 650, md: 650, lg: "60%" },
                    padding: 2,
                    width: "100%",
                    pointerEvents: "auto",
                    margin: { xs: 0, sm: 2, md: 3 },
                }}
            >
                <Stack spacing={1}>
                    <PreviousDialoguesScreen />
                    <NarrationScreenText paragraphRef={paragraphRef} />
                    <ChoiceMenu paragraphRef={paragraphRef} />
                </Stack>
            </Sheet>
        </Grid>
    );
}

function NarrationScreenText({ paragraphRef }: { paragraphRef: RefObject<HTMLDivElement | null> }) {
    const typewriterDelay = useTypewriterStore(useShallow((state) => state.delay));
    const startTypewriter = useTypewriterStore(useShallow((state) => state.start));
    const endTypewriter = useTypewriterStore(useShallow((state) => state.end));
    const { data: { animatedText, character, text } = {} } = useQueryDialogue();
    const { mode } = useColorScheme();

    const handleCharacterAnimationComplete = useCallback((ref: { current: HTMLSpanElement | null }) => {
        if (paragraphRef.current && ref.current) {
            let scrollTop = ref.current.offsetTop - paragraphRef.current.clientHeight / 2;
            paragraphRef.current.scrollTo({
                top: scrollTop,
                behavior: "auto",
            });
        }
    }, []);

    return (
        <div>
            <Typography
                fontSize='xl'
                fontWeight='lg'
                sx={{
                    color: character?.color,
                }}
                className={
                    character && character.name
                        ? `motion-opacity-in-0 motion-translate-x-in-[-3%]`
                        : `motion-opacity-out-0`
                }
            >
                {`${character?.name || ""} ${character?.surname || ""}`}
            </Typography>
            <p className={`prose ${mode === "dark" ? "dark:prose-invert" : ""}`} style={{ margin: 0, padding: 0 }}>
                <span>
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: (props) => <span {...props} />,
                        }}
                    >
                        {text}
                    </Markdown>
                </span>
                <span>
                    <span> </span>
                    <MarkdownTypewriterHooks
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        delay={typewriterDelay}
                        motionProps={{
                            onAnimationStart: startTypewriter,
                            onAnimationComplete: (definition: "visible" | "hidden") => {
                                if (definition == "visible") {
                                    endTypewriter();
                                }
                            },
                            onCharacterAnimationComplete: handleCharacterAnimationComplete,
                        }}
                        fallback={<AnimatedDots />}
                    >
                        {animatedText}
                    </MarkdownTypewriterHooks>
                </span>
            </p>
        </div>
    );
}

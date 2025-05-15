import { Grid } from "@mui/joy";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { motion } from "motion/react";
import { RefObject, useCallback, useRef } from "react";
import Markdown from "react-markdown";
import { MarkdownTypewriterHooks } from "react-markdown-typewriter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/react/shallow";
import AnimatedDots from "../components/AnimatedDots";
import useInterfaceStore from "../stores/useInterfaceStore";
import useTypewriterStore from "../stores/useTypewriterStore";
import { useQueryDialogue } from "../use_query/useQueryInterface";
import ChoiceMenu from "./ChoiceMenu";

export default function NarrationScreen() {
    const { data: { text, character, oldText } = {} } = useQueryDialogue();
    const hidden = useInterfaceStore((state) => state.hidden || (text || oldText ? false : true));
    const paragraphRef = useRef<HTMLDivElement>(null);

    return (
        <Grid
            container
            direction='column'
            sx={{
                height: "100%",
                width: "100%",
                position: "absolute",
                padding: { xs: 0, sm: 2, md: 3 },
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "auto",
            }}
        >
            <Sheet
                ref={paragraphRef}
                sx={{
                    bgcolor: "background.level1",
                    opacity: 0.8,
                    borderRadius: "sm",
                    overflow: "auto",
                    height: "100%",
                    maxWidth: { sm: 650, md: 650, lg: "60%" },
                    padding: 2,
                    width: "100%",
                }}
            >
                <NarrationScreenText paragraphRef={paragraphRef} />
            </Sheet>
        </Grid>
    );
}

function NarrationScreenText(props: { paragraphRef: RefObject<HTMLDivElement | null> }) {
    const { paragraphRef } = props;
    const typewriterDelay = useTypewriterStore(useShallow((state) => state.delay));
    const startTypewriter = useTypewriterStore(useShallow((state) => state.start));
    const endTypewriter = useTypewriterStore(useShallow((state) => state.end));
    const { data: { text, character, oldText } = {} } = useQueryDialogue();

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
        <>
            {character && character.name && (
                <Typography
                    fontSize='xl'
                    fontWeight='lg'
                    sx={{
                        color: character.color,
                    }}
                    component={motion.div}
                    initial={"closed"}
                    animate={character.name ? "open" : "closed"}
                    exit={"closed"}
                >
                    {character.name + (character.surname ? " " + character.surname : "")}
                </Typography>
            )}
            <p style={{ margin: 0, padding: 0 }}>
                <span>
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: (props) => <span {...props} />,
                        }}
                    >
                        {oldText}
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
                        {text}
                    </MarkdownTypewriterHooks>
                </span>
            </p>
            <ChoiceMenu />
        </>
    );
}

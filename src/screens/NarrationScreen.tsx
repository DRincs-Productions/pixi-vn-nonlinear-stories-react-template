import { CharacterInterface } from "@drincs/pixi-vn";
import { Grid } from "@mui/joy";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { motion, Variants } from "motion/react";
import { Key, RefObject, useCallback, useRef } from "react";
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
    const { data: { animatedText, text } = {} } = useQueryDialogue();
    const hidden = useInterfaceStore((state) => state.hidden || (animatedText || text ? false : true));
    const cardVarians: Variants = {
        open: {
            opacity: 1,
            y: 0,
        },
        closed: {
            opacity: 0,
            y: 200,
            pointerEvents: "none",
        },
    };
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
                    pointerEvents: "auto",
                }}
                component={motion.div}
                variants={cardVarians}
                initial={"closed"}
                animate={hidden ? "closed" : "open"}
                exit={"closed"}
                transition={{ type: "tween" }}
            >
                <NarrationScreenTextList paragraphRef={paragraphRef} />
                <ChoiceMenu />
            </Sheet>
        </Grid>
    );
}

function NarrationScreenTextList({ paragraphRef }: { paragraphRef: RefObject<HTMLDivElement | null> }) {
    const { data: { animatedText, character, text, history = [] } = {} } = useQueryDialogue();

    return (
        <>
            {history.map((item, index) => {
                const { character, text } = item.dialogue || {};
                return (
                    <NarrationScreenText
                        key={`narrationscreentext-${index}`}
                        animatedText={animatedText}
                        character={character}
                        text={text}
                        paragraphRef={paragraphRef}
                    />
                );
            })}
            <NarrationScreenText
                key={`narrationscreentext-${history.length}`}
                animatedText={animatedText}
                character={character}
                text={text}
                paragraphRef={paragraphRef}
            />
        </>
    );
}

function NarrationScreenText({
    key,
    animatedText,
    character,
    text,
    paragraphRef,
}: {
    key?: Key | null | undefined;
    animatedText?: string;
    character?: CharacterInterface;
    text?: string;
    paragraphRef: RefObject<HTMLDivElement | null>;
}) {
    const typewriterDelay = useTypewriterStore(useShallow((state) => state.delay));
    const startTypewriter = useTypewriterStore(useShallow((state) => state.start));
    const endTypewriter = useTypewriterStore(useShallow((state) => state.end));

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
        <div key={key}>
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

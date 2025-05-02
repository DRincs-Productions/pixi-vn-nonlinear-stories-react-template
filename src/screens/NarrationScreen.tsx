import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { motion, Variants } from "motion/react";
import { useCallback, useRef } from "react";
import Markdown from "react-markdown";
import { MarkdownTypewriter } from "react-markdown-typewriter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import useTypewriterStore from "../stores/useTypewriterStore";
import { useQueryDialogue } from "../use_query/useQueryInterface";
import ChoiceMenu from "./ChoiceMenu";

export default function NarrationScreen() {
    const typewriterDelay = useTypewriterStore((state) => state.delay);
    const startTypewriter = useTypewriterStore((state) => state.start);
    const endTypewriter = useTypewriterStore((state) => state.end);
    const { data: { text, character, oldText } = {} } = useQueryDialogue();
    const cardElementVarians: Variants = {
        open: {
            opacity: 1,
            scale: 1,
            pointerEvents: "auto",
        },
        closed: {
            opacity: 0,
            scale: 0,
            pointerEvents: "none",
        },
    };
    const paragraphRef = useRef<HTMLDivElement>(null);

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
        <Box
            sx={{
                height: "100%",
                width: "100%",
                position: "absolute",
                padding: { xs: 0, sm: 2, md: 3 },
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
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
                }}
            >
                {character && character.name && (
                    <Typography
                        fontSize='xl'
                        fontWeight='lg'
                        sx={{
                            color: character.color,
                        }}
                        component={motion.div}
                        variants={cardElementVarians}
                        initial={"closed"}
                        animate={character.name ? "open" : "closed"}
                        exit={"closed"}
                    >
                        {character.name + (character.surname ? " " + character.surname : "")}
                    </Typography>
                )}
                <p style={{ margin: 0, padding: 0 }}>
                    {
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
                    }
                    {
                        <span>
                            <span> </span>
                            <MarkdownTypewriter
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                delay={typewriterDelay}
                                motionProps={{
                                    onAnimationStart: startTypewriter,
                                    onAnimationComplete: endTypewriter,
                                    onCharacterAnimationComplete: handleCharacterAnimationComplete,
                                }}
                            >
                                {text}
                            </MarkdownTypewriter>
                        </span>
                    }
                </p>
                <ChoiceMenu fullscreen={text || oldText ? false : true} />
            </Sheet>
        </Box>
    );
}

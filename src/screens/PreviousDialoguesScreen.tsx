import Typography from "@mui/joy/Typography";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useQueryDialogue } from "../use_query/useQueryInterface";

export default function PreviousDialoguesScreen() {
    const { data: { history = [] } = {} } = useQueryDialogue();

    return (
        <>
            {history.map(({ character, text }, index) => (
                <div key={`previousdialogue-${index}`}>
                    {character?.name && (
                        <Typography
                            fontSize='xl'
                            fontWeight='lg'
                            sx={{
                                color: character?.color,
                            }}
                        >
                            {`${character.name || ""} ${character.surname || ""}`}
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
                    </p>
                </div>
            ))}
        </>
    );
}

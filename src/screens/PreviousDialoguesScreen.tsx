import CheckIcon from "@mui/icons-material/Check";
import { Chip } from "@mui/joy";
import Typography from "@mui/joy/Typography";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useQueryCurrentLabelHistory } from "../hooks/useQueryInterface";

export default function PreviousDialoguesScreen() {
    const { data: history = [] } = useQueryCurrentLabelHistory();

    return (
        <>
            {history.map(({ character, text, choices, inputValue, color }, index) => (
                <div key={`previousdialogue-${index}`}>
                    {character && (
                        <Typography
                            fontSize='xl'
                            fontWeight='lg'
                            sx={{
                                color: color,
                            }}
                        >
                            {character}
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
                    {choices &&
                        choices.map((choice, index) => {
                            if (choice.hidden) {
                                return null;
                            }
                            if (choice.isResponse) {
                                return (
                                    <Chip key={"choices-success" + index} color='success' endDecorator={<CheckIcon />}>
                                        {choice.text}
                                    </Chip>
                                );
                            }
                            return (
                                <Chip key={"choices" + index} color='primary'>
                                    {choice.text}
                                </Chip>
                            );
                        })}
                    {inputValue && (
                        <Chip key={"choices-success" + index} color='neutral'>
                            {inputValue.toString()}
                        </Chip>
                    )}
                </div>
            ))}
        </>
    );
}

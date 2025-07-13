import { HStack } from "../common/HStack";
import { Text } from "../common/Text";

interface LogItemProps {
    tag: number;
    description: string;
    time: string;
}

interface TagType {
    text: string;
    color: string;
}

export const LogItem = ({ tag, description, time }: LogItemProps) => {
    const tagList: TagType[] = [
        { text: "얽힘", color: "#BA68C8" },
        { text: "협착", color: "#A57C6D" },
        { text: "전도", color: "#2196F3" },
        { text: "비래", color: "#00ACC1" },
        { text: "추락", color: "#FF9800" },
        { text: "낙하", color: "#9569FC" },
        { text: "충돌", color: "#3F51B5" },
        { text: "폭발", color: "#E53935" },
        { text: "동작", color: "#4CAF50" },
        { text: "감전", color: "#FCCE03" },
        { text: "접촉", color: "#009688" },
        { text: "붕괴", color: "#DB6E96" },
    ];

    return (
        <HStack gap={20} padding="20px 6px">
            <Text variant="titleMedium" color={tagList[tag].color}>{tagList[tag].text}</Text>
            <Text variant="bodyMedium" color="onBackground" style={{ flex: 1 }}>{description}</Text>
            <Text variant="bodySmall" color="onSurfaceVariant">{time}</Text>
        </HStack>
    )
}
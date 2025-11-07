interface EditorProps {
    value: string;
    language?: string;
    readOnly?: boolean;
}

interface TableProps {
    Fields: string[];
    Data: Record<string, any>[];
}

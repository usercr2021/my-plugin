import React, {
  useRef,
  useImperativeHandle,
  useEffect,
  forwardRef,
} from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import styles from "./Editor.module.css";


// export const Editor: React.FC<EditorProps> = ({
//   value,
//   language = "json",
//   readOnly = false,
// }) => {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

//   // 初始化 Monaco Editor
//   useEffect(() => {
//     if (!containerRef.current) return;

//     editorRef.current = monaco.editor.create(containerRef.current, {
//       value,
//       language,
//       theme: "default",
//       readOnly,
//       automaticLayout: true,
//     });

//     return () => editorRef.current?.dispose();
//   }, [containerRef]);

//   // ✅ 当父组件 value 变化时，更新 Monaco 内容
//   useEffect(() => {
//     const editor = editorRef.current;
//     if (!editor) return;

//     const currentValue = editor.getValue();
//     if (currentValue !== value) {
//       editor.setValue(value);
//     }
//   }, [value]);

//   // ✅ 同步 readOnly 状态
//   useEffect(() => {
//     editorRef.current?.updateOptions({ readOnly });
//   }, [readOnly]);

//   return (
//     <div
//       ref={containerRef}
//       className={styles.Editor}
//     />
//   );
// };



// ✅ 定义暴露给父组件的接口
export interface EditorRef {
  getValue: () => string;
  setValue: (v: string) => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

// ✅ 定义传入的 Props
interface EditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  ({ value, language = "json", readOnly = false }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    // 初始化 Monaco
    useEffect(() => {
      if (!containerRef.current) return;

      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme: "vs-dark",
        readOnly,
        automaticLayout: true,
      });

      return () => editorRef.current?.dispose();
    }, []);

    // 父组件传入 value 变化时，同步 Monaco
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const currentValue = editor.getValue();
      if (currentValue !== value) {
        editor.setValue(value);
      }
    }, [value]);

    // 同步 readOnly
    useEffect(() => {
      editorRef.current?.updateOptions({ readOnly });
    }, [readOnly]);

    // ✅ 暴露给父组件的操作方法
    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue() ?? "",
      setValue: (v: string) => editorRef.current?.setValue(v),
      getEditor: () => editorRef.current,
    }));

    return <div ref={containerRef} className={styles.Editor} />;
  }
);

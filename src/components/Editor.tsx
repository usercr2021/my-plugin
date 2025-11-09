import React, {
  useRef,
  useImperativeHandle,
  useEffect,
  forwardRef,
} from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import styles from "./Editor.module.css";


import { format } from 'sql-formatter';


// monacoSetup.ts
import "monaco-editor/esm/vs/editor/contrib/codelens/browser/codelens.js";





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

    const formatSQL = () => {
      const code = editorRef?.current?.getValue();
      if (!code) return
      const formatted = format(code, { language: "duckdb" });
      editorRef?.current?.setValue(formatted);
    }

    // 初始化 Monaco
    useEffect(() => {
      if (!containerRef.current) return;

      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme: "vs",
        readOnly,
        automaticLayout: true,
      });

      // 注册快捷键 Ctrl+Shift+F
      editorRef.current.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
        formatSQL
      );

      // 注册右键菜单动作
      editorRef.current.addAction({
        id: "format-sql",
        label: "Format SQL",
        contextMenuGroupId: "navigation", // 菜单分组位置
        contextMenuOrder: 1.5,            // 显示顺序
        run: async (editor) => {
          try {
            formatSQL();
          } catch (e) {
            console.error("SQL format error:", e);
            alert("Format failed: " + e);
          }
        },
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

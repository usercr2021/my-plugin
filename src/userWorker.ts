import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === 'json') {
			return new jsonWorker();
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker();
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker();
		}
		if (label === 'typescript' || label === 'javascript') {
			return new tsWorker();
		}
		return new editorWorker();
	}
};

monaco.languages.registerCompletionItemProvider("sql",
  {
    // @ts-ignore
    provideCompletionItems(model, position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // 基础 SQL 关键字补全
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'GROUP BY', 'ORDER BY', 'HAVING',
        'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'VIEW', 'INDEX',
        'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AS', 'DISTINCT', 'LIMIT',
        'OFFSET', 'VALUES', 'SET', 'NULL', 'NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES',
        'INT', 'VARCHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'BOOLEAN', 'DECIMAL', 'FLOAT',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'ELSE IF', 'BEGIN', 'COMMIT', 'ROLLBACK'
      ];

      // 表名和列名补全（模拟数据库元数据，实际项目可从数据库动态获取）
      const tables = [
        { name: 'users', columns: ['id', 'name', 'age', 'email', 'created_at'] },
        { name: 'orders', columns: ['id', 'user_id', 'product', 'amount', 'order_date'] },
        { name: 'products', columns: ['id', 'name', 'price', 'stock', 'category'] }
      ];

      // 构建补全项
      const suggestions: {
        label: string,
        kind: number,
        insertText: string,
        insertTextRules?: monaco.languages.CompletionItemInsertTextRule,
        documentation: string
      }[] = [];

      // 添加关键字补全
      keywords.forEach(keyword => {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: `SQL 关键字: ${keyword}`,
        });
      });

      // 添加表名补全（检测 FROM 后的表名补全）
      if (textUntilPosition.match(/FROM\s+(\w*)$/i)) {
        tables.forEach(table => {
          suggestions.push({
            label: table.name,
            kind: monaco.languages.CompletionItemKind.Class, // 用 Class 表示表
            insertText: table.name,
            documentation: `表: ${table.name}`,
          });
        });
      }

      // 添加列名补全（检测表名后的列名补全，如 users. 后补全列）
      const tableMatch = textUntilPosition.match(/(\w+)\.\s*(\w*)$/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (table) {
          table.columns.forEach(column => {
            suggestions.push({
              label: column,
              kind: monaco.languages.CompletionItemKind.Field, // 用 Field 表示列
              insertText: column,
              documentation: `列: ${table.name}.${column}`,
            });
          });
        }
      }

      // 函数补全（如 SUM、COUNT 等）
      const functions = ['SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'DATE_FORMAT', 'CONCAT'];
      functions.forEach(func => {
        suggestions.push({
          label: func,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${func}($1)`, // 支持占位符（按 Tab 跳转）
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: `SQL 函数: ${func}()`,
        });
      });

      return { suggestions };
    },
  }
);

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
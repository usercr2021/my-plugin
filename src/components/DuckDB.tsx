import React, { useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';// 引入 DuckDB WebAssembly 库
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import * as arrow from 'apache-arrow';




const DuckDBComponent: React.FC = () => {
    const [query, setQuery] = useState<string>(''); // 用于存储输入的查询
    const [result, setResult] = useState<string>(''); // 用于显示查询结果
    const [loading, setLoading] = useState<boolean>(false); // 加载状态

    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
            mainModule: duckdb_wasm,
            mainWorker: mvp_worker,
        },
        eh: {
            mainModule: duckdb_wasm_eh,
            mainWorker: eh_worker,
        },
    };

    // 初始化 DuckDB WebAssembly 实例
    const initDuckDB = async () => {
        setLoading(true);
        try {
            // Select a bundle based on browser checks
            const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
            // Instantiate the asynchronous version of DuckDB-wasm
            const worker = new Worker(bundle.mainWorker!);
            const logger = new duckdb.ConsoleLogger();
            const db = new duckdb.AsyncDuckDB(logger, worker);
            await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

            // Create a new connection
            const conn = await db.connect();


            // Either materialize the query result
            const result = await conn.query<{ v: arrow.Int }>(`
    SELECT 1 AS col UNION ALL SELECT 2, "Bob", 30
`);

            // 3. 将结果转换为 Arrow 表
            const arrowTable = result.toArray();
            // setResult(`${arrowTable}`)

            setResult(formatQueryResult(arrowTable));
            // Close the statement to release memory
            // await stmt.close();
            // Closing the connection will release statements as well
            await conn.close();


        } catch (error) {
            setResult(`Error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    // 格式化查询结果为 HTML
    const formatQueryResult = (result: any): string => {
        if (!result || result.length === 0) return 'No results';
        return `       
        <table>
            <thead>
                <tr>
                    <th>col</th>
                </tr>
            </thead>
            <tbody>
          ${result.map((row: any) => `
            <tr><td>${row.col}</td></tr>˝
          `).join('')}
            </tbody>
        </table>`;
    };

    return (
        <div>
            <h1>DuckDB SQL Query</h1>
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={6}
                cols={40}
                placeholder="Enter your SQL query here"
            />
            <button onClick={initDuckDB} disabled={loading}>
                {loading ? 'Running...' : 'Run Query'}
            </button>
            <div
                id="result"
                dangerouslySetInnerHTML={{ __html: result }}
                style={{ marginTop: '10px' }}
            />
        </div>
    );
};

export default DuckDBComponent;

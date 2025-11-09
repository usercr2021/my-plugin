import * as duckdb from '@duckdb/duckdb-wasm';// 引入 DuckDB WebAssembly 库
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import * as arrow from 'apache-arrow';

// 全局单例
let dbInstance: duckdb.AsyncDuckDB | null = null;

export async function getDuckDB() {
    if (dbInstance) return dbInstance;

    const path = 'opfs://mydb.duckdb';
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

    try {
        // Select a bundle based on browser checks
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        // Instantiate the asynchronous version of DuckDB-wasm
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        db.open({
            path: path
        })
        await db.instantiate(
            bundle.mainModule, bundle.pthreadWorker
        );

        // await db.registerOPFSFileName(path);
        dbInstance = db;
        // await db.registerOPFSFileName(path);
        // Create a new connection
        //   const conn = await db.connect();
        //   // Either materialize the query result
        //   const result = await conn.query<{ v: arrow.Int }>(`
        //     SELECT * FROM generate_series(1, 100) t(col)
        // `);
        //   // 3. 将结果转换为 Arrow 表
        //   const arrowTable = result.toArray();
        //   // setResult(`${arrowTable}`)
        //   setResult(formatQueryResult(arrowTable));
        //   // Close the statement to release memory
        //   // await stmt.close();
        //   // Closing the connection will release statements as well
        //   await conn.close();
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
    }

    console.log('DuckDB initialized globally');

    return dbInstance;
}



/**
 * 导出数据库文件（下载 .duckdb 文件）
 */
// export async function exportDuckDB(db: duckdb.AsyncDuckDB, filename = 'mydb.duckdb') {
//     const buffer = db.copyFileToBuffer(filename);
//     const blob = new Blob([buffer], { type: 'application/octet-stream' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//     console.log(`✅ 导出成功: ${filename}`);
// }
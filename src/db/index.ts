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
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        dbInstance = db;

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

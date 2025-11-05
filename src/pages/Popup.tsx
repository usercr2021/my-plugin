import { useEffect, useState } from 'react';
import "./Popup.css";
import { getDuckDB } from '../db';
import * as arrow from 'apache-arrow';
import DuckDBComponent from "../components/DuckDB";



export default function () {
  // const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<string>("test");

  useEffect(() => {
    (async () => {
      try {
        console.log('初始化开始');
        const db = await getDuckDB();
        const conn = await db?.connect();
        console.log('连接已建立');

        await conn?.query(` 
          CREATE TABLE requests (
            id INTEGER PRIMARY KEY,
            req_id VARCHAR,
            path VARCHAR,
            log_id VARCHAR,            
            req VARCHAR,
            resp VARCHAR,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            type VARCHAR,
            code_list VARCHAR[],
            extra VARCHAR,
            sqlMap VARCHAR
          );
          `);

        await conn?.query(`
          INSERT INTO requests VALUES (1, '123.32', '/interface/99', '123341231dsdqwqw', '{"xx":"hhax"}', '{"name":"hhax","data":"123"}', '1992-09-20 11:30:00.123456789', '1992-09-20 11:30:00.123456789', 'sql', ['gmv_1d','cnt_1d'], '{"xx":"hhax"}', '{"name":"hhax","data":"123"}');
        `);

        const table = await conn?.query(` 
          SELECT * FROM requests 
          `);
        await conn?.close();
        const rowCount = table?.numRows ?? 0;
        const row: Record<string, any> = {};
        for (let i = 0; i < rowCount; i++) {
          table?.schema.fields.forEach((field, colIdx) => {
            row[field.name] = table.getChildAt(colIdx)?.get(i);
          });
          setRows(JSON.stringify(row));
        }
      } catch (error) {
        setRows(`Error: ${(error as Error).message}`)
      }

    })();
  }, []);

  return <div>{rows}</div>;
}

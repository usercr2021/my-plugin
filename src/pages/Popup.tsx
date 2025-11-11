import { useEffect, useState, useRef } from 'react';
import styles from "./Popup.module.css";
import { getDuckConn } from '../db';
import * as arrow from 'apache-arrow';
import { Editor, EditorRef } from '../components/Editor';
import { DataTable } from '../components/Table';
import Button from '../components/Button';

export default function () {
  // const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [json, setJson] = useState('SELECT * FROM requests ');
  const [errMsg, setErrMsg] = useState('');
  const [selected, setSelected] = useState("");
  const editorRef = useRef<EditorRef>(null);
  const dbInit = useRef(false);


  useEffect(() => {
    if (dbInit.current) return;
    dbInit.current = true;
    (async () => {
      try {
        const conn = await getDuckConn();

        // setRows(JSON.stringify(await conn?.getTableNames('SELECT * FROM test')))
        console.log(rows)
        // conn.getTableNames
        // console.log(tableNames);
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


        // const table = await conn?.query(` 
        //   SELECT * FROM requests 
        //   `);
        // await Promise.all([
        //   conn?.query("SELECT * FROM requests ").then((res) => { console.log(res) }),
        //   conn2?.query("SELECT * FROM requests ").then((res) => { console.log(res) }),
        // ]);

        const table = await conn?.query("SELECT * FROM requests ")
        // conn?.close();

        // conn2?.close();
        // const rowCount = table?.numRows ?? 0;
        // const row: Record<string, any> = {};
        // for (let i = 0; i < rowCount; i++) {
        //   table?.schema.fields.forEach((field, colIdx) => {
        //     row[field.name] = table.getChildAt(colIdx)?.get(i);
        //   });

        // }

        console.log(json)
      } catch (error) {
        console.log(`Error: ${(error as Error).message}`)
        setErrMsg(`Error: ${(error as Error).message}`)
      }

    })();
  }, []);


  // const handleGetValue = () => {
  //   alert("当前编辑器内容:\n" + val);
  // };

  const handleClick = async () => {
    try {
      const conn = await getDuckConn();

      // const table = await conn?.query("SELECT * FROM requests ")


      const sql = editorRef.current?.getValue() ?? "SELECT id FROM requests ";
      console.log(`sql:${sql}`)
      const table = await conn?.query(sql)
      // conn?.close();
      const rowCount = table?.numRows ?? 0;

      const names = table?.schema?.fields?.map(f => f.name);
      if (names) setFields(names);

      for (let i = 0; i < rowCount; i++) {
        const row: Record<string, any> = {};
        table?.schema.fields.forEach((field, colIdx) => {
          row[field.name] = table.getChildAt(colIdx)?.get(i);
        });
        setRows([row]);
      }
    } catch (error) {
      console.log(`Error: ${(error as Error).message}`)
      setErrMsg(`Error: ${(error as Error).message}`)
    }
  };


  return (
    <div >

      <div className={styles.Popup}>
        <button
          onClick={handleClick}
        >
          Run SQL
        </button>
      </div>

      <div className={styles.Err}>
        <DataTable Fields={fields} Data={rows} ></DataTable>
      </div>

      <div className={styles.Popup}>
        <Editor ref={editorRef} value={json} language={'sql'} />
      </div>
    </div>
  );
}


import React from "react";
import styles from "./Table.module.css";


export const DataTable: React.FC<TableProps> = ({
    Fields,
    Data,
}) => {

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr className={styles.tr}>
                        {Fields.map((item, index) => (
                            <th key={index} className={styles.th} >
                                {item}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Data.map((row, rowIndex) => (
                        <tr key={rowIndex} className={styles.emptyRow}>
                            {Fields.map((field) => (
                                <td key={field} className={styles.td}>{row[field]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

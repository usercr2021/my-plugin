import React from "react";


export const DataTable: React.FC<TableProps> = ({
    Fields,
    Data,
}) => {

    return (
        <table>
            <thead>
                <tr>
                    {Fields.map((item, index) => (
                        <th key={index}>{item}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {Data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {Fields.map((field) => (
                            <td key={field}>{row[field]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

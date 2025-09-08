import { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import ExcelJS from 'exceljs';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import styles from './CompoundInterestCalculator.module.css';

const CompoundInterestCalculator = () => {
    const pdfRef = useRef();
    const chartRef = useRef();
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.${styles.exportContainer}`)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleExportMenu = () => setShowExportMenu(!showExportMenu);

    const handleExportPDF = () => {
        if (!pdfRef.current) return;

        const body = document.body;
        const wasDark = body.classList.contains("theme-dark");

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = wasDark ? "#1e1e2f" : "#fff";
        overlay.style.zIndex = 9999;
        document.body.appendChild(overlay);

        body.classList.remove("theme-dark");
        body.classList.add("theme-light");

        const clone = pdfRef.current.cloneNode(true);
        document.body.appendChild(clone);

        const opt = {
            margin: 0.5,
            filename: `interes-compuesto-${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
            .from(clone)
            .set(opt)
            .save()
            .then(() => {
                body.classList.remove("theme-light");
                if (wasDark) body.classList.add("theme-dark");
                document.body.removeChild(clone);
                document.body.removeChild(overlay);
            });
    };

    const handleExportExcel = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Reporte Interés Compuesto');

        const sectionTitleStyle = {
            font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
            alignment: { horizontal: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } },
        };

        let rowIndex = 1;

        // --- Inputs ---
        ws.mergeCells(`A${rowIndex}:B${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Datos de entrada';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        const inputData = [
            ['Capital inicial (€)', capital],
            ['Tasa anual (%)', rate],
            ['Período (años)', years],
            ['Frecuencia de capitalización', frequency === 1 ? 'Anual' : 'Mensual'],
            ['Aporte periódico (€)', periodic],
            ['Inflación estimada (%)', inflation],
        ];

        inputData.forEach(([label, value]) => {
            ws.getCell(`A${rowIndex}`).value = label;
            ws.getCell(`B${rowIndex}`).value = value;
            ws.getCell(`A${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
            ws.getCell(`B${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
            rowIndex++;
        });

        rowIndex++;

        // --- Resultados ---
        ws.mergeCells(`A${rowIndex}:B${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Resultados';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        const resultsData = [
            ['Valor Final (€)', results.finalValue],
            ['Ganancia Neta (€)', results.netGain],
            ['Valor Real (€)', results.realValue],
        ];

        resultsData.forEach(([label, value]) => {
            ws.getCell(`A${rowIndex}`).value = label;
            ws.getCell(`B${rowIndex}`).value = parseFloat(value.toFixed(2));
            ws.getCell(`A${rowIndex}`).alignment = { horizontal: 'left' };
            ws.getCell(`B${rowIndex}`).alignment = { horizontal: 'left' };
            rowIndex++;
        });

        rowIndex++;

        // --- Tabla de evolución ---
        ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Evolución anual';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        const headers = ['Año', 'Balance', 'Intereses', 'Aportes', 'Valor real'];
        headers.forEach((header, i) => {
            const cell = ws.getCell(rowIndex, i + 1);
            cell.value = header;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center' };
        });
        rowIndex++;

        tableData.forEach((row, idx) => {
            const fillColor = idx % 2 === 0 ? 'FFDCE6F1' : 'FFFFFFFF';
            const values = [row.year, row.balance, row.interest, row.periodic, row.realBalance];
            values.forEach((v, i) => {
                const cell = ws.getCell(rowIndex, i + 1);
                cell.value = v;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                cell.alignment = { horizontal: 'center' };
            });
            rowIndex++;
        });

        rowIndex++;

        // --- Gráfico ---
        ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Gráfico de evolución';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        try {
            const chartNode = document.querySelector('.recharts-wrapper');
            if (chartNode) {
                const dataUrl = await toPng(chartNode, { backgroundColor: '#ffffff' });
                const imageId = wb.addImage({
                    base64: dataUrl,
                    extension: 'png',
                });
                ws.addImage(imageId, `A${rowIndex}:E${rowIndex + 15}`);
            }
        } catch (err) {
            console.error('Error generando gráfico:', err);
        }

        // Autoajuste de columnas
        ws.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const length = cell.value ? cell.value.toString().length : 10;
                if (length > maxLength) {
                    maxLength = length;
                }
            });
            column.width = Math.min(maxLength + 2, 30);
        });

        wb.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte-interes-${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    const handleSendEmail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No estás logado. Por favor, inicia sesión.');
                return;
            }

            const tablePayload = tableData.map(row => ({
                year: row.year,
                balance: row.balance,
                interest: row.interest,
                periodic: row.periodic,
                realBalance: row.realBalance,
            }));

            const payload = {
                capital,
                rate,
                years,
                periodic,
                inflation,
                finalValue: results.finalValue,
                netGain: results.netGain,
                realValue: results.realValue,
                tableData: tablePayload,
            };

            if (chartRef.current) {
                try {
                    const dataUrl = await toPng(chartRef.current, {
                        backgroundColor: '#ffffff',
                        skipFonts: true,
                        style: { fontFamily: 'Arial, sans-serif' }
                    });
                    payload.chartDataUrl = dataUrl;
                } catch (err) {
                    console.error('Error generando data URL del gráfico:', err);
                }
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-calculation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                toast.success('Correo enviado correctamente');
            } else {
                toast.error(data.message || 'Error enviando el correo');
            }

        } catch (err) {
            console.error('Error enviando el correo:', err);
            toast.error('Error enviando el correo. Revisa la consola.');
        }
    };

    const [capital, setCapital] = useState(1000);
    const [rate, setRate] = useState(5);
    const [years, setYears] = useState(10);
    const [frequency, setFrequency] = useState(1);
    const [periodic, setPeriodic] = useState('');
    const [inflation, setInflation] = useState('');
    const periodicValue = periodic === '' ? 0 : +periodic;
    const inflationValue = inflation === '' ? 0 : +inflation;

    const [results, setResults] = useState(null);
    const [tableData, setTableData] = useState([]);

    const calculate = () => {
        const r = rate / 100;
        const infl = inflationValue / 100;
        const n = frequency;
        const totalPeriods = years * n;

        let balance = capital;
        const table = [];

        for (let t = 1; t <= totalPeriods; t++) {
            const interest = balance * (r / n);
            balance += interest + (periodicValue / n);
            if (t % n === 0) {
                const yearNumber = t / n;
                const realBalance = balance / Math.pow(1 + infl, yearNumber);

                table.push({
                    year: yearNumber,
                    balance: parseFloat(balance.toFixed(2)),
                    interest: parseFloat((balance - capital - (periodicValue * yearNumber)).toFixed(2)),
                    periodic: parseFloat((periodicValue * yearNumber).toFixed(2)),
                    realBalance: parseFloat(realBalance.toFixed(2)),
                });
            }
        }

        const finalValue = parseFloat(balance.toFixed(2));
        const netGain = parseFloat((finalValue - capital - periodicValue * years).toFixed(2));
        const realValue = parseFloat((finalValue / Math.pow(1 + infl, years)).toFixed(2));

        setResults({ finalValue, netGain, realValue });
        setTableData(table);
    };

    return (
        <div className={styles.container}>
            <div ref={pdfRef}>
                <h2 className={styles.title}>Calculadora de Interés Compuesto</h2>

                <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Capital inicial (€)</label>
                        <input
                            type="number"
                            value={capital}
                            onChange={e => setCapital(+e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tasa anual (%)</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={e => setRate(+e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Período (años)</label>
                        <input
                            type="number"
                            value={years}
                            onChange={e => setYears(+e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Frecuencia de capitalización</label>
                        <select
                            value={frequency}
                            onChange={e => setFrequency(Number(e.target.value))}
                            className={styles.select}
                        >
                            <option value={1}>Anual</option>
                            <option value={12}>Mensual</option>
                        </select>
                        <small className={styles.helperText}>
                            {frequency === 1
                                ? "Los intereses se calculan anualmente"
                                : "Los intereses se calculan mensualmente"}
                        </small>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Aporte periódico (€)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={periodic}
                            onChange={e => setPeriodic(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Inflación estimada (%)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={inflation}
                            onChange={e => setInflation(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>

                <button onClick={calculate} className={styles.calculateButton}>
                    Calcular
                </button>

                {results && (
                    <div style={{ marginTop: "20px" }}>
                        <h3>Resultados</h3>
                        <p>Valor Final: €{results.finalValue.toFixed(2)}</p>
                        <p>Ganancia neta: €{results.netGain.toFixed(2)}</p>
                        <p>Valor real (aj. inflación): €{results.realValue.toFixed(2)}</p>
                    </div>
                )}

                {tableData.length > 0 && (
                    <>
                        <h3>Resumen Anual</h3>
                        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Año</th>
                                    <th>Balance</th>
                                    <th>Intereses</th>
                                    <th>Aportes</th>
                                    <th>Valor real</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map(row => (
                                    <tr key={row.year}>
                                        <td>{row.year}</td>
                                        <td>{row.balance}</td>
                                        <td>{row.interest}</td>
                                        <td>{row.periodic}</td>
                                        <td>{row.realBalance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3>Gráfico</h3>
                        <div ref={chartRef}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={tableData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Balance" />
                                    <Line type="monotone" dataKey="realBalance" stroke="#82ca9d" name="Valor real" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>

            {/* Botones flotantes de scroll */}
            {tableData.length > 0 && (
                <div className={styles.scrollButtonContainer}>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className={styles.scrollButton}
                        title="Ir al inicio"
                    >
                        <i className="bi bi-chevron-up"></i>
                    </button>

                    <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className={styles.scrollButton}
                        title="Ir al final"
                    >
                        <i className="bi bi-chevron-down"></i>
                    </button>
                </div>
            )}

            {/* Botón de exportación con dropdown */}
            {tableData.length > 0 && (
                <div className={styles.exportContainer} style={{ marginTop: '2rem' }}>
                    <button className={styles.exportButton} onClick={toggleExportMenu}>
                        <i className={`bi ${showExportMenu ? 'bi-x' : 'bi-box-arrow-up'}`}></i>
                        {showExportMenu ? 'Cancelar' : 'Exportar'}
                    </button>

                    {showExportMenu && (
                        <div className={styles.exportMenu}>
                            <button onClick={handleExportPDF}>
                                <i className="bi bi-file-earmark-pdf"></i> PDF
                            </button>
                            <button onClick={handleExportExcel}>
                                <i className="bi bi-file-earmark-spreadsheet"></i> Excel
                            </button>
                            <button onClick={handleSendEmail}>
                                <i className="bi bi-envelope"></i> Email
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompoundInterestCalculator;
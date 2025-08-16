import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import styles from './MortgageCalculator.module.css';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import ExcelJS from 'exceljs';
import toast from 'react-hot-toast';
import { FaRegFilePdf, FaRegFileExcel } from 'react-icons/fa6';
import { MdOutlineAttachEmail } from 'react-icons/md';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";


const MortgageCalculator = () => {
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [years, setYears] = useState('');
    const [paymentsPerYear, setPaymentsPerYear] = useState(12);
    const [extraPayment, setExtraPayment] = useState('');
    const [extraPaymentFrequency, setExtraPaymentFrequency] = useState('monthly');

    const [monthlyPayment, setMonthlyPayment] = useState(null);
    const [amortizationTable, setAmortizationTable] = useState([]);
    const [chartDataUrl, setChartDataUrl] = useState('');
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            toPng(chartRef.current, { backgroundColor: '#ffffff' })
                .then((dataUrl) => setChartDataUrl(dataUrl))
                .catch((err) => console.error('Error capturando gráfico:', err));
        }
    }, [amortizationTable]);

    const handleCalculate = async () => {
        const P = parseFloat(principal);
        const r = parseFloat(interestRate) / 100 / paymentsPerYear;
        const n = parseFloat(years) * paymentsPerYear;

        if (isNaN(P) || isNaN(r) || isNaN(n)) return;

        const payment = (P * r) / (1 - Math.pow(1 + r, -n));
        setMonthlyPayment(payment.toFixed(2));

        let balance = P;
        const table = [];

        for (let i = 1; i <= n; i++) {
            const interestPayment = balance * r;
            const principalPayment = payment - interestPayment;
            balance -= principalPayment;

            table.push({
                period: i,
                payment,
                principalPayment,
                interestPayment,
                balance: balance > 0 ? balance : 0,
            });
        }

        setAmortizationTable(table);

        // Generar gráfico para Recharts
        const mortgageData = table.map(row => ({
            month: row.period,
            principal: row.principalPayment,
            interest: row.interestPayment,
            balance: row.balance,
        }));

        // Captura del gráfico como imagen
        setTimeout(async () => {
            if (chartRef.current) {
                try {
                    const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff' });
                    setChartDataUrl(dataUrl);
                } catch (err) {
                    console.error('Error generando data URL del gráfico:', err);
                }
            }
        }, 0);

        return mortgageData; // para usarlo en el render
    };

    //Referencia para exportar a PDF
    const pdfRef = useRef();

    const handleExportPDF = () => {
        if (!pdfRef.current) return;

        const body = document.body;
        const wasDark = body.classList.contains("theme-dark");

        // Overlay que tapa todo
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = wasDark ? "#1e1e2f" : "#fff";
        overlay.style.zIndex = 9999;
        document.body.appendChild(overlay);

        // Forzamos tema light temporal
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");

        const clone = pdfRef.current.cloneNode(true);
        document.body.appendChild(clone);

        html2pdf()
            .set({
                margin: 0.5,
                filename: `reporte-hipoteca-${new Date().toISOString().slice(0, 10)}.pdf`,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            })
            .from(clone)
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
        const ws = wb.addWorksheet('Reporte Hipoteca');

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
            ['Capital del préstamo (€)', Number(principal) || 0],
            ['Tasa de interés anual (%)', Number(interestRate) || 0],
            ['Plazo (años)', Number(years) || 0],
            ['Pagos por año', paymentsPerYear],
            ['Pago extra (€)', Number(extraPayment) || 0],
            ['Frecuencia pago extra', extraPaymentFrequency],
            ['Cuota mensual (€)', monthlyPayment || 0],
        ];

        inputData.forEach(([label, value]) => {
            ws.getCell(`A${rowIndex}`).value = label;
            ws.getCell(`B${rowIndex}`).value = value;
            rowIndex++;
        });

        rowIndex++;

        // --- Resultados ---
        ws.mergeCells(`A${rowIndex}:B${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Resultados';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        const totalPaid = amortizationTable.reduce((acc, r) => acc + (r.payment || 0), 0);
        const totalInterest = amortizationTable.reduce((acc, r) => acc + (r.interestPayment || 0), 0);

        const resultsData = [
            ['Cuota mensual (€)', monthlyPayment || 0],
            ['Total pagado (€)', totalPaid],
            ['Intereses pagados (€)', totalInterest],
        ];

        resultsData.forEach(([label, value]) => {
            ws.getCell(`A${rowIndex}`).value = label;
            const numValue = Number(value);
            ws.getCell(`B${rowIndex}`).value = Number.isFinite(numValue) ? Number(numValue.toFixed(2)) : 0;
            ws.getCell(`A${rowIndex}`).alignment = { horizontal: 'left' };
            ws.getCell(`B${rowIndex}`).alignment = { horizontal: 'left' };
            rowIndex++;
        });

        rowIndex++;

        // --- Tabla de amortización ---
        ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Tabla de amortización';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        const headers = ['Período', 'Saldo pendiente', 'Intereses', 'Capital', 'Cuota'];
        headers.forEach((header, i) => {
            const cell = ws.getCell(rowIndex, i + 1);
            cell.value = header;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center' };
        });
        rowIndex++;

        amortizationTable.forEach((row, idx) => {
            const fillColor = idx % 2 === 0 ? 'FFDCE6F1' : 'FFFFFFFF';
            const values = [
                row.period,
                parseFloat(row.balance) || 0,
                parseFloat(row.interestPayment) || 0,
                parseFloat(row.principalPayment) || 0,
                parseFloat(row.payment) || 0
            ];
            values.forEach((v, i) => {
                const cell = ws.getCell(rowIndex, i + 1);
                cell.value = Number.isFinite(v) ? Number(v.toFixed(2)) : 0;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                cell.alignment = { horizontal: 'center' };
            });

            rowIndex++;
        });

        // --- Gráfico ---
        rowIndex++;
        ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
        ws.getCell(`A${rowIndex}`).value = 'Gráfico';
        ws.getCell(`A${rowIndex}`).style = sectionTitleStyle;
        rowIndex++;

        // Generamos el PNG justo aquí
        if (chartRef.current) {
            try {
                const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff' });
                const imageId = wb.addImage({
                    base64: dataUrl,
                    extension: 'png',
                });
                // Ajustamos la altura para que la imagen no aparezca en blanco
                const startRow = rowIndex;
                const endRow = rowIndex + 14; // 14 filas de alto aprox.
                ws.addImage(imageId, `A${startRow}:E${endRow}`);
                rowIndex = endRow + 1;
            } catch (err) {
                console.error('Error generando PNG para Excel:', err);
            }
        }

        ws.columns.forEach(col => {
            col.width = 18;
        });


        wb.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte-hipoteca-${new Date().toISOString().slice(0, 10)}.xlsx`;
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

            console.log(amortizationTable[0])

            // --- Prepara tabla en el formato esperado por el backend/email ---
            const tablePayload = amortizationTable.map(row => ({
                period: row.period,
                payment: row.payment.toFixed(2),
                principalPayment: row.principalPayment.toFixed(2),
                interestPayment: row.interestPayment.toFixed(2),
                balance: row.balance.toFixed(2)
            }));

            // --- Prepara payload ---
            const payload = {
                principal,               // número
                interestRate,            // número
                years,
                paymentsPerYear,
                extraPayment,
                extraPaymentFrequency,
                monthlyPayment,
                table: tablePayload,     // tabla en formato correcto
            };

            // --- Genera data URL del gráfico si existe ---
            if (chartRef.current) {
                try {
                    const dataUrl = await toPng(chartRef.current, {
                        backgroundColor: '#ffffff',
                        skipFonts: true,
                        style: { fontFamily: 'Arial, sans-serif' }
                    });
                    console.log('PNG size before send:', dataUrl.length);
                    payload.chartDataUrl = dataUrl;
                } catch (err) {
                    console.error('Error generando data URL del gráfico:', err);
                }
            }

            // --- Llamada al backend ---
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-mortgage`, {
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



    return (
        <div className={styles.container}>
            {/* Sección que irá al PDF */}
            <div ref={pdfRef}>

                <h2 className={styles.title}>Calculadora de Hipoteca</h2>

                <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Monto del préstamo (€):</label>
                        <input
                            type="number"
                            value={principal}
                            onChange={e => setPrincipal(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tasa de interés anual (%):</label>
                        <input
                            type="number"
                            value={interestRate}
                            onChange={e => setInterestRate(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Plazo (años):</label>
                        <input
                            type="number"
                            value={years}
                            onChange={e => setYears(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Pagos por año:</label>
                        <input
                            type="number"
                            value={paymentsPerYear}
                            onChange={e => setPaymentsPerYear(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Pago extra (€):</label>
                        <input
                            type="number"
                            value={extraPayment}
                            onChange={e => setExtraPayment(e.target.value)}
                            className={styles.input}
                        />
                        <div className={styles.selectContainer}>
                            <select
                                value={extraPaymentFrequency}
                                onChange={e => setExtraPaymentFrequency(e.target.value)}
                                className={styles.select}
                            >
                                <option value="monthly">Mensual</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button onClick={handleCalculate} className={styles.calculateButton}>
                    Calcular
                </button>

                {monthlyPayment && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Resultados</h3>


                        {amortizationTable.length > 0 && (() => {
                            const totalInterest = amortizationTable.reduce((sum, row) => sum + row.interestPayment, 0);
                            const totalPaid = amortizationTable.reduce((sum, row) => sum + row.payment, 0);
                            const principalPaid = totalPaid - totalInterest;
                            const interestPercent = ((totalInterest / totalPaid) * 100).toFixed(1);
                            const principalPercent = ((principalPaid / totalPaid) * 100).toFixed(1);

                            return (
                                <div style={{ marginTop: "20px" }}>
                                    <p>Pago por período: €{monthlyPayment}</p>
                                    <p>Total intereses: €{totalInterest.toFixed(2)}</p>
                                    <p>Total pagado: €{totalPaid.toFixed(2)}</p>
                                    <p>Distribución: Principal {principalPercent}%, Interés {interestPercent}%</p>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {amortizationTable.length > 0 && (
                    <>
                        <h3>Gráfico</h3>

                        {/* Gráfico */}
                        <div ref={chartRef} className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={amortizationTable.map(row => ({
                                    month: row.period,
                                    principal: row.principalPayment,
                                    interest: row.interestPayment,
                                    balance: row.balance
                                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="principal" stroke="#82ca9d" />
                                    <Line type="monotone" dataKey="interest" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>


                        <h3>Resumen anual</h3>

                        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    <th>Pago</th>
                                    <th>Principal</th>
                                    <th>Interés</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {amortizationTable.map((row, idx) => (
                                    <tr
                                        key={idx}

                                    >
                                        <td>{row.period}</td>
                                        <td>{row.payment.toFixed(2)}</td>
                                        <td>{row.principalPayment.toFixed(2)}</td>
                                        <td>{row.interestPayment.toFixed(2)}</td>
                                        <td>{row.balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </>
                )}
            </div>

            {/* Botones flotantes de scroll */}
            {amortizationTable.length > 0 && (
                <div className={styles.scrollButtonContainer}>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className={styles.scrollButton}
                        title="Ir al inicio"
                    >
                        <FiArrowUp size={22} />
                    </button>

                    <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className={styles.scrollButton}
                        title="Ir al final"
                    >
                        <FiArrowDown size={22} />
                    </button>
                </div>
            )}

            {/* Botones de exportación fuera del PDF */}
            {
                amortizationTable.length > 0 && (
                    <div className={styles.exportButtonsContainer}>
                        <button onClick={handleExportPDF} className={`${styles.exportButton} ${styles.pdfButton}`}>
                            <FaRegFilePdf className={styles.buttonIcon} /> Exportar PDF
                        </button>

                        <button onClick={handleExportExcel} className={`${styles.exportButton} ${styles.excelButton}`}>
                            <FaRegFileExcel className={styles.buttonIcon} /> Exportar Excel
                        </button>

                        <button onClick={handleSendEmail} className={`${styles.exportButton} ${styles.emailButton}`}>
                            <MdOutlineAttachEmail className={styles.buttonIcon} /> Enviar por Email
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default MortgageCalculator;
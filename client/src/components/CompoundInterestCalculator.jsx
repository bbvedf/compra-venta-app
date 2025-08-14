import React, { useState } from "react";
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
    const [capital, setCapital] = useState(1000);
    const [rate, setRate] = useState(5);
    const [years, setYears] = useState(10);
    const [frequency, setFrequency] = useState(1); // 1 = anual
    const [periodic, setPeriodic] = useState(0);
    const [inflation, setInflation] = useState(0);

    const [results, setResults] = useState(null);
    const [tableData, setTableData] = useState([]);

    const calculate = () => {
        const r = rate / 100;           // tasa anual
        const infl = inflation / 100;   // inflación anual
        const n = frequency;            // 1 = anual, 12 = mensual
        const totalPeriods = years * n;

        let balance = capital;
        const table = [];

        for (let t = 1; t <= totalPeriods; t++) {
            const interest = balance * (r / n);
            balance += interest + (periodic / n); // aporte proporcional si mensual
            // Solo agregamos la fila al final de cada año para la tabla
            if (t % n === 0) {
                const yearNumber = t / n;
                const realBalance = balance / Math.pow(1 + infl, yearNumber);

                table.push({
                    year: yearNumber,
                    balance: parseFloat(balance.toFixed(2)),
                    interest: parseFloat((balance - capital - (periodic * yearNumber)).toFixed(2)),
                    periodic: parseFloat((periodic * yearNumber).toFixed(2)),
                    realBalance: parseFloat(realBalance.toFixed(2)),
                });
            }
        }

        const lastRow = table[table.length - 1];

        setResults({
            finalValue: lastRow.balance,
            netGain: lastRow.balance - capital,
            realValue: lastRow.realBalance,
        });

        setTableData(table);
    };



return (
    <div className={styles.container}>
      <h2 className={styles.title}>Calculadora de Interés Compuesto</h2>
      
      <div className={styles.inputGrid}>
        {/* Grupo 1: Capital y Tasa */}
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

        {/* Grupo 2: Años y Frecuencia */}
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

        {/* Grupo 3: Aportes e Inflación */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Aporte periódico (€)</label>
          <input 
            type="number" 
            value={periodic} 
            onChange={e => setPeriodic(+e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Inflación estimada (%)</label>
          <input 
            type="number" 
            value={inflation} 
            onChange={e => setInflation(+e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <button 
        onClick={calculate} 
        className={styles.calculateButton}
      >
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
                </>
            )}
        </div>
    );
};

export default CompoundInterestCalculator;
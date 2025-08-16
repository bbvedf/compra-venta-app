const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendPasswordResetEmail = async (to, resetLink) => {
    const htmlBody = `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente <a href="${resetLink}">enlace</a> para continuar:</p>
        <p>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</p>
    `;

    const mailOptions = {
        from: `"Soporte App" <${process.env.EMAIL_USER}>`,
        to: to,
        /*bcc: process.env.EMAIL_BCC || undefined, */
        subject: 'Restablece tu contraseña',
        html: htmlBody
    };

    return transporter.sendMail(mailOptions);
};

exports.sendNewUserNotificationEmail = async (newUser) => {
    const htmlBody = `
        <h3>Nuevo usuario pendiente de aprobación</h3>
        <p><strong>Nombre de usuario:</strong> ${newUser.username}</p>
        <p><strong>Email:</strong> ${newUser.email}</p>
        <p>Accede al panel de administración para aprobar o rechazar el registro.</p>
    `;

    const mailOptions = {
        from: `"Notificaciones App" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_BCC,
        subject: 'Nuevo usuario registrado',
        html: htmlBody,
    };

    return transporter.sendMail(mailOptions);
};

exports.sendUserApprovedEmail = async (to) => {
    const htmlBody = `
        <p>¡Tu cuenta ha sido aprobada!</p>
        <p>Ya puedes iniciar sesión en la aplicación.</p>
        <p>Gracias por tu paciencia.</p>
    `;

    const mailOptions = {
        from: `"Soporte App" <${process.env.EMAIL_USER}>`,
        to,
        /*bcc: process.env.EMAIL_BCC || undefined, */
        subject: 'Cuenta aprobada',
        html: htmlBody
    };

    return transporter.sendMail(mailOptions);
};

exports.sendUserRejectedEmail = async (to) => {
    const htmlBody = `
        <p>¡Tu cuenta ha sido cancelada!</p>
        <p>Si crees que se trata de algún error, contacta con un administrador por los canales facilitados.</p>
        <p>Disculpa las molestias.</p>
    `;

    const mailOptions = {
        from: `"Soporte App" <${process.env.EMAIL_USER}>`,
        to,
        /*bcc: process.env.EMAIL_BCC || undefined, */
        subject: 'Cuenta CANCELADA',
        html: htmlBody
    };

    return transporter.sendMail(mailOptions);
};

const { toPng } = require('html-to-image'); // si quieres generar la imagen en backend, ojo que depende de DOM
const fs = require('fs');

exports.sendCalculationEmail = async (to, calculationData, chartDataUrl) => {
    const capitalNum = Number(calculationData.capital) || 0;
    const rateNum = Number(calculationData.rate) || 0;
    const yearsNum = Number(calculationData.years) || 0;
    const periodicNum = Number(calculationData.periodic) || 0;
    const inflationNum = Number(calculationData.inflation) || 0;
    const finalValueNum = Number(calculationData.finalValue) || 0;
    const netGainNum = Number(calculationData.netGain) || 0;
    const realValueNum = Number(calculationData.realValue) || 0;
    const tableData = Array.isArray(calculationData.tableData) ? calculationData.tableData : [];

    // Preparamos el adjunto si existe chartDataUrl
    let attachments = [];
    if (chartDataUrl) {
        const base64Data = chartDataUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        console.log('Chart PNG size (bytes):', buffer.length); // <-- chequeo

        attachments.push({
            filename: 'grafico-evolucion.png',
            content: buffer,
            cid: 'chart.png@cid'
        });
    }
    console.log('chartDataUrl length:', chartDataUrl ? chartDataUrl.length : 'no data');


    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Datos de entrada</h2>
            <ul>
                <li>Capital inicial: €${capitalNum}</li>
                <li>Tasa anual: ${rateNum}%</li>
                <li>Período: ${yearsNum} años</li>
                <li>Aporte periódico: €${periodicNum}</li>
                <li>Inflación estimada: ${inflationNum}%</li>
            </ul>

            <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Resultados</h2>
            <ul>
                <li>Valor final: €${finalValueNum.toFixed(2)}</li>
                <li>Ganancia neta: €${netGainNum.toFixed(2)}</li>
                <li>Valor real: €${realValueNum.toFixed(2)}</li>
            </ul>

            <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Evolución anual</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #4F81BD; color: white;">
                        <th>Año</th>
                        <th>Balance</th>
                        <th>Intereses</th>
                        <th>Aportes</th>
                        <th>Valor real</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableData.map((row, idx) => `
                        <tr style="background-color: ${idx % 2 === 0 ? '#DCE6F1' : '#FFFFFF'}; text-align: center;">
                            <td>${Number(row.year) || 0}</td>
                            <td>${Number(row.balance) || 0}</td>
                            <td>${Number(row.interest) || 0}</td>
                            <td>${Number(row.periodic) || 0}</td>
                            <td>${Number(row.realBalance) || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            ${attachments.length ? `
                <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Gráfico de evolución</h2>
                <img src="cid:chart.png@cid" alt="Gráfico de evolución" style="max-width: 100%;"/>
            ` : ''}
        </div>
    `;

    const mailOptions = {
        from: `"Soporte App" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reporte de Interés Compuesto',
        html: htmlBody,
        attachments
    };

    return transporter.sendMail(mailOptions);
};



exports.sendMortgageEmail = async (to, mortgageData) => {
  const {
    principal,
    interestRate,
    years,
    paymentsPerYear,
    extraPayment,
    extraPaymentFrequency,
    monthlyPayment,
    table = [],
    chartDataUrl
  } = mortgageData;

  // Preparamos el adjunto si existe chartDataUrl
  let attachments = [];
  if (chartDataUrl) {
    const base64Data = chartDataUrl.replace(/^data:image\/png;base64,/, '');
    attachments.push({
      filename: 'grafico-amortizacion.png',
      content: Buffer.from(base64Data, 'base64'),
      cid: 'chart.png@cid'
    });
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Datos de entrada</h2>
      <ul>
        <li>Principal: €${Number(principal)}</li>
        <li>Tasa anual: ${Number(interestRate)}%</li>
        <li>Plazo: ${Number(years)} años</li>
        <li>Pagos por año: ${Number(paymentsPerYear)}</li>
        ${extraPayment ? `<li>Pago extra: €${Number(extraPayment)} (${extraPaymentFrequency})</li>` : ''}
        <li>Pago mensual estimado: €${Number(monthlyPayment).toFixed(2)}</li>
      </ul>

      <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Amortización</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #4F81BD; color: white;">
            <th>Período</th>
            <th>Pago</th>
            <th>Principal</th>
            <th>Interés</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${table.map((row, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#DCE6F1' : '#FFFFFF'}; text-align: center;">
              <td>${Number(row.period)}</td>
              <td>${Number(row.payment).toFixed(2)}</td>
              <td>${Number(row.principalPayment).toFixed(2)}</td>
              <td>${Number(row.interestPayment).toFixed(2)}</td>
              <td>${Number(row.balance).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${attachments.length ? `
        <h2 style="background-color: #4F81BD; color: white; padding: 8px;">Gráfico de amortización</h2>
        <img src="cid:chart.png@cid" alt="Gráfico de amortización" style="max-width: 100%;"/>
      ` : ''}
    </div>
  `;

  const mailOptions = {
    from: `"Soporte App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reporte de Amortización de Hipoteca',
    html: htmlBody,
    attachments
  };

  return transporter.sendMail(mailOptions);
};

// server/index.js
const logger = require('./utils/logger');
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);

// Exportar app para tests
module.exports = app;

// Solo levantar servidor si NO estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`Servidor corriendo en https://ryzenpc.mooo.com:${PORT}`));
}







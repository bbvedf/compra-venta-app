// server/debug.js
const logger = require('./utils/logger');
const express = require('express');
logger.info('Versión de Express:', express.version);
logger.info('Router:', express.Router.toString());

// server/utils/userLogger.js
const db = require('../db'); // tu pool de postgres

async function logUserEvent(userId, eventType, details = {}, req = null) {
  const ip = req?.ip || null;
  const ua = req?.headers['user-agent'] || null;

  await db.query(
    `INSERT INTO users_logs (user_id, event_type, ip_address, user_agent, details)
         VALUES ($1, $2, $3, $4, $5)`,
    [userId, eventType, ip, ua, details],
  );
}

module.exports = { logUserEvent };

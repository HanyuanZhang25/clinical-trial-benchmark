const db = require('../database');

function logAuthEvent({ userId = null, eventType, success, ipAddress = null, metadata = null }) {
  db.prepare(`
    INSERT INTO auth_events (user_id, event_type, success, ip_address, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, eventType, success ? 1 : 0, ipAddress, metadata ? JSON.stringify(metadata) : null);
}

function logAudit({ userId = null, action, entityType, entityId = null, metadata = null }) {
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null);
}

module.exports = { logAuthEvent, logAudit };

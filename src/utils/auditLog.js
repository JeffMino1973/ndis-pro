import { base44 } from "@/api/base44Client";

/**
 * Log an audit event. Call this whenever sensitive data is created, updated, deleted, or exported.
 * @param {string} action - 'create' | 'update' | 'delete' | 'view' | 'export'
 * @param {string} entityType - e.g. 'Participant', 'PayslipRecord', 'Incident'
 * @param {string} entityId - the record ID
 * @param {string} entityName - human-readable name (e.g. participant name)
 * @param {string} details - extra context (e.g. which fields changed)
 */
export async function logAudit(action, entityType, entityId = "", entityName = "", details = "") {
  try {
    const user = await base44.auth.me();
    await base44.entities.AuditLog.create({
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      performed_by: user?.email || "unknown",
      performed_by_name: user?.full_name || "Unknown User",
      details,
    });
  } catch (e) {
    // Silently fail — never block the main action
    console.warn("Audit log failed:", e);
  }
}
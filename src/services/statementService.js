/**
 * DocGuard – Witness Statement Service (Phase 2)
 *
 * CRITICAL: Witness statements are IMMUTABLE.
 * - No delete operation exists.
 * - Supplementary statements are separate records linked to originals.
 * - Original statements are preserved permanently.
 */

import { db } from './mockCaseData'
import { hasPermission, PERMISSIONS } from './accessControl'
import { caseService } from './caseService'

export const statementService = {
  /**
   * Get all witness statements for a case.
   */
  getStatements(user, caseId) {
    caseService.getCaseById(user, caseId)
    return db.getStatements(caseId)
  },

  /**
   * Get statements grouped by witness reference.
   */
  getStatementsGrouped(user, caseId) {
    const statements = this.getStatements(user, caseId)
    const grouped = {}
    statements.forEach(st => {
      if (!grouped[st.witnessRef]) grouped[st.witnessRef] = []
      grouped[st.witnessRef].push(st)
    })
    Object.values(grouped).forEach(versions => versions.sort((a, b) => a.version - b.version))
    return grouped
  },

  /**
   * Record a new witness statement.
   */
  addStatement(user, caseId, data) {
    if (!hasPermission(user, PERMISSIONS.ADD_WITNESS_STATEMENT)) {
      throw new Error('Access denied: You do not have permission to record witness statements.')
    }
    caseService.getCaseById(user, caseId)

    const { witnessRef, statementDate, statementText, statementType, classification } = data
    if (!witnessRef?.trim()) throw new Error('Witness reference is required')
    if (!statementDate) throw new Error('Statement date is required')
    if (!statementText?.trim()) throw new Error('Statement text is required')

    return db.addStatement({
      caseId,
      witnessRef: witnessRef.trim().toUpperCase(),
      statementDate,
      statementText: statementText.trim(),
      recordedBy: user.id,
      statementType: statementType || 'WITNESS',
      classification: classification || 'RESTRICTED',
      status: 'ACTIVE',
      version: 1,
      previousStatementId: null,
      changeReason: null,
    })
  },

  /**
   * Add a supplementary statement.
   * The original statement is preserved. A new linked record is created.
   */
  addSupplementaryStatement(user, caseId, originalStatementId, data) {
    if (!hasPermission(user, PERMISSIONS.ADD_WITNESS_STATEMENT)) {
      throw new Error('Access denied: You do not have permission to record statements.')
    }
    caseService.getCaseById(user, caseId)

    const original = db.getStatementById(originalStatementId)
    if (!original) throw new Error('Original statement not found')
    if (original.caseId !== caseId) throw new Error('Statement does not belong to this case')

    const { statementDate, statementText, changeReason } = data
    if (!statementDate) throw new Error('Statement date is required')
    if (!statementText?.trim()) throw new Error('Supplementary statement text is required')
    if (!changeReason?.trim()) throw new Error('Reason for supplementary statement is required')

    return db.addSupplementaryStatement(originalStatementId, {
      statementDate,
      statementText: statementText.trim(),
      recordedBy: user.id,
      classification: original.classification,
      status: 'ACTIVE',
      changeReason: changeReason.trim(),
    })
  },

  // NOTE: deleteStatement() does NOT exist — by design.
  // Witness statements are immutable and must never be permanently removed.
}

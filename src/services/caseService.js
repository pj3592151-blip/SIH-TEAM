/**
 * DocGuard – Case Service (Phase 2)
 * Handles case CRUD operations with RBAC + ABAC enforcement.
 */

import { db } from './mockCaseData'
import { canAccessCase, canCreateCase, canAssignOfficers, canUpdateCaseStatus, hasPermission, PERMISSIONS } from './accessControl'

export const caseService = {
  /**
   * Get all cases the user is authorized to view.
   * ABAC: filtered by assignment + jurisdiction + sensitivity.
   */
  getAccessibleCases(user) {
    if (!user) return []
    const allCases = db.getAllCases()
    return allCases.filter(c => {
      const isAssigned = db.isUserAssigned(user.id, c.id)
      return canAccessCase(user, c, isAssigned)
    })
  },

  /**
   * Get a single case by ID with authorization check.
   */
  getCaseById(user, caseId) {
    if (!user) throw new Error('Authentication required')
    const caseObj = db.getCaseById(caseId)
    if (!caseObj) throw new Error('Case not found')
    const isAssigned = db.isUserAssigned(user.id, caseId)
    if (!canAccessCase(user, caseObj, isAssigned)) {
      throw new Error('Access denied: You do not have authorization to access this case.')
    }
    return caseObj
  },

  /**
   * Create a new case (Level 3+ or explicit permission).
   */
  createCase(user, data) {
    if (!user) throw new Error('Authentication required')
    if (!canCreateCase(user)) {
      throw new Error('Access denied: Insufficient rank/permissions to create cases. Inspector/SHO or above required.')
    }
    const { title, description, caseType, department, policeStation, jurisdiction, priority, sensitivity } = data
    if (!title?.trim()) throw new Error('Case title is required')
    if (!caseType?.trim()) throw new Error('Case type is required')
    if (!jurisdiction?.trim()) throw new Error('Jurisdiction is required')

    const newCase = db.createCase({
      title: title.trim(),
      description: description?.trim() || '',
      caseType: caseType.trim(),
      department: department || user.department,
      policeStation: policeStation || user.policeStation,
      jurisdiction: jurisdiction.trim(),
      status: 'OPEN',
      priority: priority || 'MEDIUM',
      sensitivity: sensitivity || 'INTERNAL',
      createdBy: user.id,
    })

    // Auto-assign the creator
    db.addCaseMember({ caseId: newCase.id, userId: user.id, assignmentRole: 'Case Creator', assignedBy: user.id })

    return newCase
  },

  /**
   * Get case members.
   */
  getCaseMembers(user, caseId) {
    this.getCaseById(user, caseId) // authorization check
    const members = db.getCaseMembers(caseId)
    const allUsers = db.getAllUsers()
    return members.map(m => {
      const memberUser = allUsers.find(u => u.id === m.userId)
      return { ...m, userName: memberUser?.name || m.userId, userRank: memberUser?.rank || '', userDept: memberUser?.department || '' }
    })
  },

  /**
   * Assign an officer to a case.
   */
  assignOfficer(user, caseId, targetUserId, assignmentRole) {
    if (!canAssignOfficers(user)) {
      throw new Error('Access denied: Inspector/SHO or above can assign officers.')
    }
    this.getCaseById(user, caseId) // authorization check
    const targetUser = db.getUserById(targetUserId)
    if (!targetUser) throw new Error('Target user not found')
    const alreadyAssigned = db.isUserAssigned(targetUserId, caseId)
    if (alreadyAssigned) throw new Error('Officer is already assigned to this case.')
    return db.addCaseMember({ caseId, userId: targetUserId, assignmentRole: assignmentRole || 'Assigned Officer', assignedBy: user.id })
  },

  /**
   * Update case status.
   */
  updateCaseStatus(user, caseId, newStatus) {
    if (!canUpdateCaseStatus(user)) {
      throw new Error('Access denied: Insufficient permissions to update case status.')
    }
    this.getCaseById(user, caseId)
    return db.updateCaseStatus(caseId, newStatus, user.id)
  },

  /**
   * Get all users available for assignment.
   */
  getAssignableUsers(user) {
    if (!canAssignOfficers(user)) return []
    return db.getAllUsers().map(u => {
      const { password: _, ...safe } = u
      return safe
    })
  },
}

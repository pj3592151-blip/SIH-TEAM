import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, X, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import { db } from '../../services/mockCaseData'

const ASSIGNMENT_ROLES = [
  'Lead Investigation Officer',
  'Assistant Investigation Officer',
  'Forensic Lead',
  'Legal Advisor',
  'Supervising Officer',
  'Field Officer',
  'Cyber Analyst',
]

export function AssignOfficersModal({ open, onClose, caseId, onAssigned }) {
  const { user } = useAuth()
  const [assignableUsers, setAssignableUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [assignmentRole, setAssignmentRole] = useState(ASSIGNMENT_ROLES[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setError('')
      try {
        const users = caseService.getAssignableUsers(user)
        const currentMembers = db.getCaseMembers(caseId)
        const assignedIds = currentMembers.filter(m => m.status === 'ACTIVE').map(m => m.userId)
        const unassigned = users.filter(u => !assignedIds.includes(u.id))
        setAssignableUsers(unassigned)
        if (unassigned.length > 0) {
          setSelectedUserId(unassigned[0].id)
        }
      } catch (err) {
        setError(err.message)
      }
    }
  }, [open, caseId, user])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedUserId) {
      setError('Please select an officer to assign.')
      return
    }

    setLoading(true)
    setError('')
    try {
      caseService.assignOfficer(user, caseId, selectedUserId, assignmentRole)
      onAssigned()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ maxWidth: 480 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Assign Officer to Case</h3>
          </div>
          <button className="button-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '16px 20px' }}>
            {error && (
              <div className="alert-box error" style={{ marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="field-label">Select Officer *</label>
              {assignableUsers.length === 0 ? (
                <p style={{ fontSize: 12, color: '#64748b' }}>All available officers are already assigned to this case.</p>
              ) : (
                <select
                  className="field-input"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  required
                >
                  {assignableUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.rank} ({u.policeStation || u.department})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="field-label">Assignment Role *</label>
              <select
                className="field-input"
                value={assignmentRole}
                onChange={e => setAssignmentRole(e.target.value)}
                required
              >
                {ASSIGNMENT_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <Shield size={13} style={{ verticalAlign: 'middle', marginRight: 5, color: '#2563eb' }} />
              Assigned officers gain permission to view this case and log investigation updates/evidence based on their individual rank privileges.
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={loading || assignableUsers.length === 0}
            >
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

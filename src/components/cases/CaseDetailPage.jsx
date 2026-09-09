import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, FileText, Shield, Users, Activity,
  PlusCircle, AlertCircle, UserPlus, RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import { db } from '../../services/mockCaseData'
import { hasPermission, canAssignOfficers, canUpdateCaseStatus, PERMISSIONS } from '../../services/accessControl'
import { StatusBadge, PriorityBadge, SensitivityBadge } from '../shared/StatusBadge'
import { UpdatesTab } from './UpdatesTab'
import { EvidenceTab } from './EvidenceTab'
import { StatementsTab } from './StatementsTab'
import { FactsTab } from './FactsTab'
import { DocumentsTab } from './DocumentsTab'
import { InvestigationHistory } from './InvestigationHistory'
import { AssignOfficersModal } from './AssignOfficersModal'

const TABS = [
  { id: 'updates', label: 'Investigation Updates', icon: Activity },
  { id: 'evidence', label: 'Evidence', icon: Shield },
  { id: 'statements', label: 'Witness Statements', icon: FileText },
  { id: 'facts', label: 'Case Facts', icon: AlertCircle },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'history', label: 'Investigation History', icon: Activity },
]

const CASE_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CHARGE_SHEET_FILED', label: 'Charge Sheet Filed' },
  { value: 'COURT_PROCEEDING', label: 'Court Proceeding' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export function CaseDetailPage({ caseId, onBack, notify }) {
  const { user } = useAuth()
  const [caseObj, setCaseObj] = useState(null)
  const [members, setMembers] = useState([])
  const [activeTab, setActiveTab] = useState('updates')
  const [error, setError] = useState('')
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)

  const reload = useCallback(() => {
    try {
      const c = caseService.getCaseById(user, caseId)
      setCaseObj(c)
      const m = caseService.getCaseMembers(user, caseId)
      setMembers(m)
    } catch (err) {
      setError(err.message)
    }
  }, [user, caseId])

  useEffect(() => { reload() }, [reload])

  if (error) {
    return (
      <div className="page narrow-page">
        <button className="back-button" onClick={onBack}><ChevronLeft size={16} /> Back to Cases</button>
        <div className="empty-state">
          <span className="round-icon" style={{ background: '#ffecec', color: '#c93636', width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: '50%', margin: '0 auto 14px' }}>
            <AlertCircle size={28} />
          </span>
          <h2>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!caseObj) {
    return <div className="page"><div className="skeleton" style={{ height: 200, borderRadius: 10 }} /></div>
  }

  const canAssign = canAssignOfficers(user)
  const canStatus = canUpdateCaseStatus(user)

  const handleStatusChange = (e) => {
    try {
      caseService.updateCaseStatus(user, caseId, e.target.value)
      reload()
      notify?.('success', 'Status Updated', `Case status changed to ${e.target.value.replace(/_/g, ' ')}.`)
    } catch (err) {
      notify?.('error', 'Update Failed', err.message)
    }
  }

  return (
    <div className="page">
      <button className="back-button" onClick={onBack}>
        <ChevronLeft size={16} /> Back to Cases
      </button>

      {/* Case Header */}
      <motion.div
        className="case-detail-header panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="case-detail-top">
          <div>
            <p className="case-number-large">{caseObj.caseNumber}</p>
            <h1 className="case-detail-title">{caseObj.title}</h1>
            <p className="case-detail-desc">{caseObj.description}</p>

            <div className="case-badge-row" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={caseObj.status} />
              <PriorityBadge priority={caseObj.priority} />
              <SensitivityBadge sensitivity={caseObj.sensitivity} />
            </div>
          </div>

          <div className="case-detail-actions">
            {canStatus && (
              <div className="status-change-wrap">
                <label style={{ fontSize: 11, color: '#6a7b95', display: 'block', marginBottom: 4 }}>Change Status</label>
                <select
                  className="field-input"
                  value={caseObj.status}
                  onChange={handleStatusChange}
                  style={{ fontSize: 12, padding: '6px 10px', minWidth: 180 }}
                >
                  {CASE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
            {canAssign && (
              <button
                className="button secondary"
                onClick={() => setAssignModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: canStatus ? 8 : 0 }}
              >
                <UserPlus size={15} /> Assign Officer
              </button>
            )}
          </div>
        </div>

        {/* Case Metadata */}
        <div className="case-meta-grid">
          {[
            ['Case Type', caseObj.caseType],
            ['Department', caseObj.department],
            ['Station / Unit', caseObj.policeStation],
            ['Jurisdiction', caseObj.jurisdiction],
            ['Created', new Date(caseObj.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
            ['Last Updated', new Date(caseObj.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
          ].map(([k, v]) => (
            <div key={k} className="case-meta-item">
              <span className="case-meta-label">{k}</span>
              <span className="case-meta-value">{v || '—'}</span>
            </div>
          ))}
        </div>

        {/* Assigned Officers */}
        {members.length > 0 && (
          <div className="assigned-officers-row">
            <span style={{ fontSize: 12, color: '#6a7b95', fontWeight: 600 }}>
              <Users size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Assigned Officers:
            </span>
            {members.filter(m => m.status === 'ACTIVE').map(m => (
              <div key={m.id} className="officer-chip">
                <span className="avatar small-avatar" style={{ width: 24, height: 24, fontSize: 9 }}>
                  {m.userName.split(' ').map(x => x[0]).join('').slice(0, 2)}
                </span>
                <span style={{ fontSize: 11 }}>
                  <strong>{m.userName}</strong>
                  <span style={{ color: '#8a97ab' }}> · {m.assignmentRole}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="case-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`case-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'updates' && <UpdatesTab caseId={caseId} notify={notify} />}
          {activeTab === 'evidence' && <EvidenceTab caseId={caseId} notify={notify} />}
          {activeTab === 'statements' && <StatementsTab caseId={caseId} notify={notify} />}
          {activeTab === 'facts' && <FactsTab caseId={caseId} notify={notify} />}
          {activeTab === 'documents' && <DocumentsTab caseId={caseId} notify={notify} />}
          {activeTab === 'history' && <InvestigationHistory caseId={caseId} />}
        </motion.div>
      </AnimatePresence>

      {/* Assign Officers Modal */}
      <AssignOfficersModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        caseId={caseId}
        onAssigned={() => { reload(); notify?.('success', 'Officer Assigned', 'The officer has been added to this case.') }}
      />
    </div>
  )
}

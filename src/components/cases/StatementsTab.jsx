import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertCircle, CheckCircle2, History, ChevronDown, ChevronUp, Shield, FileText, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/mockCaseData'
import { statementService } from '../../services/statementService'
import { hasPermission, PERMISSIONS } from '../../services/accessControl'
import { ImmutableBadge, VersionBadge, SensitivityBadge } from '../shared/StatusBadge'

function StatementCard({ statement, allStatements, onAddSupplementary, canAdd }) {
  const [showHistory, setShowHistory] = useState(false)
  const [addingSupp, setAddingSupp] = useState(false)
  const [suppForm, setSuppForm] = useState({ statementDate: new Date().toISOString().slice(0, 10), statementText: '', changeReason: '' })

  const history = db.getStatementHistory(statement.witnessRef, statement.caseId)
  const hasHistory = history.length > 1
  const isLatest = statement.version === Math.max(...history.map(h => h.version))

  const handleSupplementary = (e) => {
    e.preventDefault()
    onAddSupplementary(statement.id, suppForm)
    setAddingSupp(false)
    setSuppForm({ statementDate: new Date().toISOString().slice(0, 10), statementText: '', changeReason: '' })
  }

  const recordedByUser = db.getUserById(statement.recordedBy)
  const dateStr = new Date(statement.recordedAt || statement.statementDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <motion.div
      className="immutable-card"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="immutable-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="case-id-badge" style={{ fontSize: 11, fontWeight: 700 }}>
            {statement.witnessRef}
          </span>
          <VersionBadge version={statement.version} />
          {statement.statementType === 'SUPPLEMENTARY' && (
            <span style={{ fontSize: 10, color: '#31558a', background: '#eef4ff', border: '1px solid #c9dcfa', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
              Supplementary Statement
            </span>
          )}
          <ImmutableBadge />
          {statement.classification && (
            <SensitivityBadge sensitivity={statement.classification} />
          )}
        </div>
        <div style={{ fontSize: 11, color: '#8a97ab' }}>
          Recorded by: {recordedByUser?.name || statement.recordedBy} · {recordedByUser?.rank || ''} · {dateStr}
        </div>
      </div>

      <div style={{ margin: '8px 0', fontSize: 12, color: '#4a5b78' }}>
        <strong>Statement Date:</strong> {new Date(statement.statementDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>

      <div className="statement-text-container" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', margin: '8px 0' }}>
        <p className="immutable-text" style={{ whiteSpace: 'pre-wrap', margin: 0, fontStyle: 'italic', color: '#1e293b' }}>
          "{statement.statementText}"
        </p>
      </div>

      {statement.changeReason && (
        <div className="immutable-reason" style={{ marginTop: 8 }}>
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <span><strong>Reason for Supplementary Statement:</strong> {statement.changeReason}</span>
        </div>
      )}

      <div className="immutable-card-footer">
        {hasHistory && (
          <button
            className="text-link-btn-sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={13} />
            {showHistory ? 'Hide History' : `Statement Chain (${history.length} statement${history.length !== 1 ? 's' : ''})`}
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}

        {isLatest && canAdd && !addingSupp && (
          <button
            className="button secondary btn-sm"
            onClick={() => setAddingSupp(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={13} /> Record Supplementary Statement
          </button>
        )}
      </div>

      {/* History Chain */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="version-history"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="version-history-title"><History size={13} /> Complete Statement Chain for {statement.witnessRef}</p>
            {history.map((h, i) => (
              <div key={h.id} className={`version-item ${h.id === statement.id ? 'version-latest' : ''}`} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: i < history.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <VersionBadge version={h.version} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>
                      {h.statementType === 'SUPPLEMENTARY' ? 'Supplementary' : 'Original Statement'}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    {new Date(h.recordedAt || h.statementDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', margin: '4px 0' }}>"{h.statementText}"</p>
                {h.changeReason && (
                  <p style={{ fontSize: 11, color: '#b45309', margin: '2px 0' }}>Reason: {h.changeReason}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplementary Statement Form */}
      <AnimatePresence>
        {addingSupp && (
          <motion.form
            onSubmit={handleSupplementary}
            className="correction-form panel"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ marginTop: 12, background: '#fdfdfe', border: '1px solid #cbd5e1' }}
          >
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Record Supplementary Statement for {statement.witnessRef}
            </h4>
            <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 10px' }}>
              The original statement will remain permanently unchanged in the case file. This creates a new linked record.
            </p>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="field-label" style={{ fontSize: 11 }}>Statement Date *</label>
              <input
                type="date"
                className="field-input"
                value={suppForm.statementDate}
                onChange={e => setSuppForm(f => ({ ...f, statementDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="field-label" style={{ fontSize: 11 }}>Supplementary Statement Details *</label>
              <textarea
                className="field-input"
                rows={4}
                placeholder="Enter additional or updated witness testimony..."
                value={suppForm.statementText}
                onChange={e => setSuppForm(f => ({ ...f, statementText: e.target.value }))}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="field-label" style={{ fontSize: 11 }}>Reason for Supplementary Statement *</label>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Witness recalled additional details regarding timeline..."
                value={suppForm.changeReason}
                onChange={e => setSuppForm(f => ({ ...f, changeReason: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary btn-sm"
                onClick={() => setAddingSupp(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button primary btn-sm"
              >
                Save Supplementary Record
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function StatementsTab({ caseId, notify }) {
  const { user } = useAuth()
  const [statements, setStatements] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    witnessRef: '',
    statementDate: new Date().toISOString().slice(0, 10),
    statementType: 'WITNESS',
    classification: 'RESTRICTED',
    statementText: '',
  })

  const canAdd = hasPermission(user, PERMISSIONS.ADD_WITNESS_STATEMENT)

  const reload = () => {
    try {
      const data = statementService.getStatements(user, caseId)
      setStatements(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { reload() }, [caseId, user])

  const handleAddStatement = (e) => {
    e.preventDefault()
    try {
      statementService.addStatement(user, caseId, formData)
      reload()
      setShowAddForm(false)
      setFormData({
        witnessRef: '',
        statementDate: new Date().toISOString().slice(0, 10),
        statementType: 'WITNESS',
        classification: 'RESTRICTED',
        statementText: '',
      })
      notify?.('success', 'Statement Recorded', 'Witness statement has been permanently recorded.')
    } catch (err) {
      notify?.('error', 'Error Recording Statement', err.message)
    }
  }

  const handleAddSupplementary = (statementId, data) => {
    try {
      statementService.addSupplementaryStatement(user, caseId, statementId, data)
      reload()
      notify?.('success', 'Supplementary Statement Added', 'New version recorded and linked to original.')
    } catch (err) {
      notify?.('error', 'Error Adding Supplementary Statement', err.message)
    }
  }

  // Get distinct latest statements per witnessRef
  const latestStatements = []
  const seenRefs = new Set()
  const sortedDesc = [...statements].sort((a, b) => b.version - a.version)
  sortedDesc.forEach(st => {
    if (!seenRefs.has(st.witnessRef)) {
      seenRefs.add(st.witnessRef)
      latestStatements.push(st)
    }
  })

  return (
    <div className="case-tab-content">
      {/* Immutability Banner */}
      <div className="immutable-banner">
        <div className="immutable-banner-icon">
          <Shield size={18} />
        </div>
        <div>
          <h4 className="immutable-banner-title">Witness Statements are Permanently Sealed & Immutable</h4>
          <p className="immutable-banner-desc">
            To preserve the integrity of legal records, witness statements cannot be modified or deleted. Any new testimony or corrections must be entered as supplementary statements linked to the original record.
          </p>
        </div>
      </div>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a2332' }}>
            Witness Statements ({statements.length})
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6a7b95' }}>
            {seenRefs.size} distinct witness record{seenRefs.size !== 1 ? 's' : ''} in case archive
          </p>
        </div>

        {canAdd && (
          <button
            className="button primary"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Plus size={16} /> Record Witness Statement
          </button>
        )}
      </div>

      {/* Add Statement Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleAddStatement}
            className="panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ marginBottom: 18, border: '1px solid #cbd5e1' }}
          >
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1a2332' }}>
              Record New Witness Statement
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label className="field-label">Witness Reference / Code *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. WIT-001 or WIT-SHARMA-01"
                  value={formData.witnessRef}
                  onChange={e => setFormData(f => ({ ...f, witnessRef: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">Date of Statement *</label>
                <input
                  type="date"
                  className="field-input"
                  value={formData.statementDate}
                  onChange={e => setFormData(f => ({ ...f, statementDate: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">Statement Type</label>
                <select
                  className="field-input"
                  value={formData.statementType}
                  onChange={e => setFormData(f => ({ ...f, statementType: e.target.value }))}
                >
                  <option value="WITNESS">Witness Statement</option>
                  <option value="COMPLAINANT">Complainant Statement</option>
                  <option value="EXPERT">Expert / Technical Opinion</option>
                  <option value="SUSPECT">Suspect / Interrogation Note</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Classification</label>
                <select
                  className="field-input"
                  value={formData.classification}
                  onChange={e => setFormData(f => ({ ...f, classification: e.target.value }))}
                >
                  <option value="INTERNAL">Internal</option>
                  <option value="RESTRICTED">Restricted</option>
                  <option value="CONFIDENTIAL">Confidential</option>
                  <option value="SECRET">Secret</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="field-label">Statement Narrative *</label>
              <textarea
                className="field-input"
                rows={5}
                placeholder="Transcribe or record the statement word-for-word as provided by the witness..."
                value={formData.statementText}
                onChange={e => setFormData(f => ({ ...f, statementText: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button primary"
              >
                Permanently Record Statement
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Statements List */}
      {latestStatements.length === 0 ? (
        <div className="empty-state">
          <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ margin: '0 0 6px', color: '#475569' }}>No Witness Statements</h4>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            No witness statements have been entered for this case yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {latestStatements.map(st => (
            <StatementCard
              key={st.id}
              statement={st}
              allStatements={statements}
              onAddSupplementary={handleAddSupplementary}
              canAdd={canAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}

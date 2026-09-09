import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertCircle, CheckCircle2, History, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/mockCaseData'
import { evidenceService } from '../../services/evidenceService'
import { hasPermission, PERMISSIONS } from '../../services/accessControl'
import { ImmutableBadge, VersionBadge, EvidenceTypeBadge } from '../shared/StatusBadge'

const EVIDENCE_TYPES = ['DIGITAL', 'PHYSICAL', 'DOCUMENTARY', 'VIDEO', 'IMAGE', 'AUDIO', 'FORENSIC', 'OTHER']
const CLASSIFICATIONS = ['INTERNAL', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET', 'HIGHLY_SENSITIVE']

function EvidenceCard({ evidenceNumber, versions, allEvidence, onAddCorrection, canAdd }) {
  const [showHistory, setShowHistory] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [correctionForm, setCorrectionForm] = useState({ description: '', source: '', changeReason: '' })

  const latest = versions[0] // versions sorted desc
  const addedByUser = db.getUserById(latest.submittedBy)
  const dateStr = new Date(latest.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const handleCorrection = (e) => {
    e.preventDefault()
    onAddCorrection(latest.id, correctionForm)
    setCorrecting(false)
    setCorrectionForm({ description: '', source: '', changeReason: '' })
  }

  return (
    <motion.div className="immutable-card" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
      <div className="immutable-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#1e3357' }}>{evidenceNumber}</span>
          <VersionBadge version={latest.version} />
          <EvidenceTypeBadge type={latest.evidenceType} />
          <ImmutableBadge />
        </div>
        <div style={{ fontSize: 11, color: '#8a97ab' }}>
          {addedByUser?.name || latest.submittedBy} · {dateStr}
        </div>
      </div>

      <p className="immutable-text">{latest.description}</p>

      <div className="evidence-meta-row">
        {latest.source && <span><strong>Source:</strong> {latest.source}</span>}
        {latest.location && <span><strong>Location:</strong> {latest.location}</span>}
        {latest.collectionDate && <span><strong>Collected:</strong> {latest.collectionDate}</span>}
        <span><strong>Classification:</strong> {latest.classification}</span>
      </div>

      {latest.changeReason && (
        <div className="immutable-reason">
          <AlertCircle size={12} /> Reason: {latest.changeReason}
        </div>
      )}

      <div className="immutable-card-footer">
        {versions.length > 1 && (
          <button className="text-link-btn-sm" onClick={() => setShowHistory(!showHistory)}>
            <History size={13} />
            {showHistory ? 'Hide History' : `Version History (${versions.length})`}
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}

        {canAdd && !correcting && (
          <button className="button secondary btn-sm" onClick={() => setCorrecting(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={13} /> Add Correction
          </button>
        )}
      </div>

      {/* Version History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div className="version-history" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <p className="version-history-title"><History size={13} /> Evidence Version History</p>
            {[...versions].reverse().map((v, i) => (
              <div key={v.id} className={`version-item ${i === versions.length - 1 ? 'version-latest' : ''}`}>
                <VersionBadge version={v.version} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 3px', fontSize: 12, color: '#1e3357' }}>{v.description}</p>
                  {v.changeReason && <p style={{ margin: 0, fontSize: 11, color: '#8a97ab' }}>Change: {v.changeReason}</p>}
                  <p style={{ margin: '3px 0 0', fontSize: 10, color: '#aab8cd' }}>
                    {db.getUserById(v.submittedBy)?.name || v.submittedBy} · {new Date(v.submittedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Correction Form */}
      <AnimatePresence>
        {correcting && (
          <motion.form onSubmit={handleCorrection} className="correction-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="correction-form-header">
              <AlertCircle size={14} style={{ color: '#df7d28' }} />
              <strong>Add Evidence Correction</strong>
              <small>Original evidence record is preserved permanently (V{latest.version}).</small>
            </div>
            <div style={{ background: '#f7f9fc', border: '1px solid #e5eaf1', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#8a97ab' }}>Current description (read-only):</p>
              <p style={{ margin: '5px 0 0', fontSize: 12, color: '#3a4f6e', fontStyle: 'italic' }}>{latest.description}</p>
            </div>
            <div className="form-group-p2">
              <label className="field-label">Updated Description <span className="req">*</span></label>
              <textarea className="field-input field-textarea" rows={3} placeholder="Enter corrected description..." value={correctionForm.description} onChange={e => setCorrectionForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <div className="form-group-p2">
              <label className="field-label">Source / Reference</label>
              <input type="text" className="field-input" placeholder="Updated source" value={correctionForm.source} onChange={e => setCorrectionForm(p => ({ ...p, source: e.target.value }))} />
            </div>
            <div className="form-group-p2">
              <label className="field-label">Reason for Correction <span className="req">*</span></label>
              <input type="text" className="field-input" placeholder="Why is this correction being made?" value={correctionForm.changeReason} onChange={e => setCorrectionForm(p => ({ ...p, changeReason: e.target.value }))} required />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="button secondary btn-sm" onClick={() => setCorrecting(false)}>Cancel</button>
              <button type="submit" className="button primary btn-sm"><CheckCircle2 size={14} /> Submit Correction</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function EvidenceTab({ caseId, notify }) {
  const { user } = useAuth()
  const [grouped, setGrouped] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ evidenceType: 'PHYSICAL', description: '', source: '', collectedBy: '', collectionDate: '', location: '', classification: 'INTERNAL' })
  const [error, setError] = useState('')

  const canAdd = hasPermission(user, PERMISSIONS.ADD_EVIDENCE)

  const reload = () => {
    try {
      setGrouped(evidenceService.getEvidenceWithHistory(user, caseId))
    } catch (err) { setError(err.message) }
  }

  useEffect(() => { reload() }, [caseId, user])

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    try {
      evidenceService.addEvidence(user, caseId, { ...form, collectedBy: form.collectedBy || user.id })
      setForm({ evidenceType: 'PHYSICAL', description: '', source: '', collectedBy: '', collectionDate: '', location: '', classification: 'INTERNAL' })
      setShowAddForm(false)
      reload()
      notify?.('success', 'Evidence Added', 'Evidence record permanently stored.')
    } catch (err) { setError(err.message) }
  }

  const handleCorrection = (parentId, data) => {
    setError('')
    try {
      evidenceService.addEvidenceCorrection(user, caseId, parentId, data)
      reload()
      notify?.('success', 'Correction Added', 'New version created. Original preserved.')
    } catch (err) { setError(err.message) }
  }

  const evidenceGroups = Object.entries(grouped)

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <div>
          <h3 className="tab-title">Evidence</h3>
          <p className="tab-subtitle">Evidence records are immutable. Corrections create new versions — originals preserved.</p>
        </div>
        {canAdd && (
          <button className="button primary btn-sm" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Plus size={15} /> Add Evidence
          </button>
        )}
      </div>

      {error && <div className="tab-error"><AlertCircle size={16} /> {error}</div>}

      <AnimatePresence>
        {showAddForm && (
          <motion.form onSubmit={handleAdd} className="add-record-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <h4 className="add-form-title"><Plus size={15} /> New Evidence Record</h4>
            <div className="create-case-grid">
              <div className="form-group-p2">
                <label className="field-label">Evidence Type <span className="req">*</span></label>
                <select className="field-input" value={form.evidenceType} onChange={e => setForm(p => ({ ...p, evidenceType: e.target.value }))}>
                  {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group-p2">
                <label className="field-label">Classification</label>
                <select className="field-input" value={form.classification} onChange={e => setForm(p => ({ ...p, classification: e.target.value }))}>
                  {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group-p2 span-2">
                <label className="field-label">Description <span className="req">*</span></label>
                <textarea className="field-input field-textarea" rows={3} placeholder="Describe the evidence..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="form-group-p2">
                <label className="field-label">Source</label>
                <input type="text" className="field-input" placeholder="Where was evidence obtained?" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
              </div>
              <div className="form-group-p2">
                <label className="field-label">Collection Date <span className="req">*</span></label>
                <input type="date" className="field-input" value={form.collectionDate} onChange={e => setForm(p => ({ ...p, collectionDate: e.target.value }))} required />
              </div>
              <div className="form-group-p2 span-2">
                <label className="field-label">Location of Collection</label>
                <input type="text" className="field-input" placeholder="Where was evidence collected?" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="button" className="button secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="button primary btn-sm"><CheckCircle2 size={14} /> Add Evidence</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {evidenceGroups.length === 0 ? (
        <div className="tab-empty">
          <Shield size={32} style={{ color: '#b0c4de', margin: '0 auto 12px' }} />
          <p>No evidence recorded yet.</p>
        </div>
      ) : (
        <div className="records-list">
          {evidenceGroups.map(([evNum, versions]) => (
            <EvidenceCard
              key={evNum}
              evidenceNumber={evNum}
              versions={versions}
              allEvidence={Object.values(grouped).flat()}
              onAddCorrection={handleCorrection}
              canAdd={canAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}

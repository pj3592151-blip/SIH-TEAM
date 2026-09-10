import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertCircle, CheckCircle2, History, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/mockCaseData'
import { factService } from '../../services/factService'
import { hasPermission, PERMISSIONS } from '../../services/accessControl'
import { ImmutableBadge, VersionBadge } from '../shared/StatusBadge'

function FactCard({ fact, allFacts, onAddCorrection, canAdd }) {
  const [showHistory, setShowHistory] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [correctionForm, setCorrectionForm] = useState({ factText: '', source: '', confidence: 'REPORTED', changeReason: '' })

  const history = db.getFactHistory(fact.id)
  const hasHistory = history.length > 1
  const isLatest = !allFacts.some(f => f.parentFactId === fact.id)

  const handleCorrection = (e) => {
    e.preventDefault()
    onAddCorrection(fact.id, correctionForm)
    setCorrecting(false)
    setCorrectionForm({ factText: '', source: '', confidence: 'REPORTED', changeReason: '' })
  }

  const addedByUser = db.getUserById(fact.createdBy)
  const dateStr = new Date(fact.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      className="immutable-card"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="immutable-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <VersionBadge version={fact.version} />
          {fact.parentFactId && (
            <span style={{ fontSize: 10, color: '#8a97ab', background: '#f7f9fc', border: '1px solid #e5eaf1', padding: '2px 7px', borderRadius: 99 }}>
              Corrects earlier fact
            </span>
          )}
          <ImmutableBadge />
          <span style={{ fontSize: 10, color: '#5c6d8b', padding: '2px 8px', borderRadius: 99, background: '#f0f6ff', border: '1px solid #dde8f8' }}>
            {fact.confidence}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#8a97ab' }}>
          {addedByUser?.name || fact.createdBy} · {addedByUser?.rank || ''} · {dateStr}
        </div>
      </div>

      <p className="immutable-text">{fact.factText}</p>

      {fact.source && (
        <p className="immutable-source">Source: {fact.source}</p>
      )}

      {fact.changeReason && (
        <div className="immutable-reason">
          <AlertCircle size={12} />
          Reason: {fact.changeReason}
        </div>
      )}

      <div className="immutable-card-footer">
        {hasHistory && (
          <button
            className="text-link-btn-sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={13} />
            {showHistory ? 'Hide History' : `View History (${history.length} version${history.length !== 1 ? 's' : ''})`}
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}

        {isLatest && canAdd && !correcting && (
          <button
            className="button secondary btn-sm"
            onClick={() => setCorrecting(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={13} /> Add Correction / New Information
          </button>
        )}
      </div>

      {/* Fact Version History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="version-history"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="version-history-title"><History size={13} /> Version History</p>
            {history.map((h, i) => (
              <div key={h.id} className={`version-item ${i === history.length - 1 ? 'version-latest' : ''}`}>
                <VersionBadge version={h.version} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#1e3357' }}>{h.factText}</p>
                  {h.changeReason && <p style={{ margin: 0, fontSize: 11, color: '#8a97ab' }}>Change: {h.changeReason}</p>}
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: '#aab8cd' }}>
                    {db.getUserById(h.createdBy)?.name || h.createdBy} · {new Date(h.createdAt).toLocaleString('en-IN')}
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
          <motion.form
            onSubmit={handleCorrection}
            className="correction-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="correction-form-header">
              <AlertCircle size={14} style={{ color: '#df7d28' }} />
              <strong>Add Correction / New Information</strong>
              <small>The original fact above is preserved permanently.</small>
            </div>

            <div style={{ background: '#f7f9fc', border: '1px solid #e5eaf1', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#8a97ab' }}>Original Fact (read-only):</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#3a4f6e', fontStyle: 'italic' }}>{fact.factText}</p>
            </div>

            <div className="form-group-p2">
              <label className="field-label">New Information <span className="req">*</span></label>
              <textarea
                className="field-input field-textarea"
                rows={3}
                placeholder="Enter updated or corrected information..."
                value={correctionForm.factText}
                onChange={e => setCorrectionForm(p => ({ ...p, factText: e.target.value }))}
                required
              />
            </div>

            <div className="form-group-p2">
              <label className="field-label">Source / Reference</label>
              <input
                type="text"
                className="field-input"
                placeholder="Source of new information"
                value={correctionForm.source}
                onChange={e => setCorrectionForm(p => ({ ...p, source: e.target.value }))}
              />
            </div>

            <div className="form-group-p2">
              <label className="field-label">Confidence Status</label>
              <select className="field-input" value={correctionForm.confidence} onChange={e => setCorrectionForm(p => ({ ...p, confidence: e.target.value }))}>
                <option value="REPORTED">Reported</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CONTRADICTED">Contradicted</option>
              </select>
            </div>

            <div className="form-group-p2">
              <label className="field-label">Reason for Correction <span className="req">*</span></label>
              <input
                type="text"
                className="field-input"
                placeholder="Why is this correction being added?"
                value={correctionForm.changeReason}
                onChange={e => setCorrectionForm(p => ({ ...p, changeReason: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="button secondary btn-sm" onClick={() => setCorrecting(false)}>Cancel</button>
              <button type="submit" className="button primary btn-sm">
                <CheckCircle2 size={14} /> Submit Correction
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FactsTab({ caseId, notify }) {
  const { user } = useAuth()
  const [facts, setFacts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ factText: '', source: '', confidence: 'REPORTED' })
  const [error, setError] = useState('')

  const canAdd = hasPermission(user, PERMISSIONS.ADD_CASE_FACT)

  const reload = () => {
    try {
      setFacts(factService.getFacts(user, caseId))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { reload() }, [caseId, user])

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    try {
      factService.addFact(user, caseId, form)
      setForm({ factText: '', source: '', confidence: 'REPORTED' })
      setShowAddForm(false)
      reload()
      notify?.('success', 'Fact Added', 'Investigation fact recorded permanently.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCorrection = (parentId, data) => {
    setError('')
    try {
      factService.addFactCorrection(user, caseId, parentId, data)
      reload()
      notify?.('success', 'Correction Added', 'New version created. Original fact preserved.')
    } catch (err) {
      setError(err.message)
    }
  }

  // Show only "root" facts or latest version per chain (all visible for immutability)
  // We show ALL facts since they're all part of the immutable record
  const rootFacts = facts.filter(f => f.parentFactId === null)
  const childFacts = facts.filter(f => f.parentFactId !== null)

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <div>
          <h3 className="tab-title">Case Facts</h3>
          <p className="tab-subtitle">
            All facts are permanently preserved. Corrections create new linked records — originals remain.
          </p>
        </div>
        {canAdd && (
          <button
            className="button primary btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Plus size={15} /> Add New Fact
          </button>
        )}
      </div>

      {error && (
        <div className="tab-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Add Fact Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleAdd}
            className="add-record-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="add-form-title">
              <Plus size={15} /> New Investigation Fact
            </h4>
            <div className="form-group-p2">
              <label className="field-label">Fact <span className="req">*</span></label>
              <textarea
                className="field-input field-textarea"
                rows={3}
                placeholder="Describe the established fact clearly..."
                value={form.factText}
                onChange={e => setForm(p => ({ ...p, factText: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group-p2">
                <label className="field-label">Source / Reference</label>
                <input type="text" className="field-input" placeholder="Source of this fact" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
              </div>
              <div className="form-group-p2">
                <label className="field-label">Confidence Status</label>
                <select className="field-input" value={form.confidence} onChange={e => setForm(p => ({ ...p, confidence: e.target.value }))}>
                  <option value="REPORTED">Reported</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="CONFIRMED">Confirmed</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="button secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="button primary btn-sm"><CheckCircle2 size={14} /> Add Fact</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {facts.length === 0 ? (
        <div className="tab-empty">
          <ShieldAlert size={32} style={{ color: '#b0c4de', margin: '0 auto 12px' }} />
          <p>No case facts recorded yet.</p>
          {canAdd && <p>Add the first investigation fact above.</p>}
        </div>
      ) : (
        <div className="records-list">
          {facts.map(fact => (
            <FactCard
              key={fact.id}
              fact={fact}
              allFacts={facts}
              onAddCorrection={handleCorrection}
              canAdd={canAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, FolderKanban, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import { canCreateCase } from '../../services/accessControl'

const CASE_TYPES = [
  'Criminal Investigation', 'Financial Crime', 'Cyber Crime', 'Narcotics',
  'Fraud & Forgery', 'Organized Crime', 'Terrorism', 'Property Offence',
  'Witness Statement Review', 'Compliance Matter', 'Digital Evidence',
  'Missing Person', 'Surveillance', 'Other'
]

export function CreateCasePage({ onBack, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    caseType: '',
    department: user?.department || '',
    policeStation: user?.policeStation || '',
    jurisdiction: user?.jurisdiction || '',
    priority: 'MEDIUM',
    sensitivity: 'INTERNAL',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!canCreateCase(user)) {
    return (
      <div className="page narrow-page">
        <div className="empty-state">
          <span className="round-icon" style={{ background: '#ffecec', color: '#c93636', width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: '50%', margin: '0 auto 14px' }}>
            <AlertCircle size={28} />
          </span>
          <h2>Access Denied</h2>
          <p>You do not have permission to create cases. Inspector / SHO or above required.</p>
          <button className="button secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
            <ChevronLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    )
  }

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const newCase = caseService.createCase(user, form)
      onCreated?.(newCase)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="page narrow-page">
      <button className="back-button" onClick={onBack}>
        <ChevronLeft size={16} /> Back to Cases
      </button>

      <section className="page-title">
        <div>
          <p className="eyebrow">CASE MANAGEMENT</p>
          <h1>Create New Case</h1>
          <span style={{ color: '#5c6d8b', fontSize: 15 }}>Open a new investigation case in the secure record system.</span>
        </div>
      </section>

      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: 28, maxWidth: 720 }}
      >
        {error && (
          <div className="auth-alert error" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', background: '#fff3f3', border: '1px solid #ffb8b8', borderRadius: 8, padding: '12px 16px', color: '#c93636', fontSize: 13 }}>
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="create-case-grid">
            {/* Case Title */}
            <div className="form-group-p2 span-2">
              <label className="field-label">Case Title <span className="req">*</span></label>
              <input
                type="text"
                className="field-input"
                placeholder="Enter a descriptive case title"
                value={form.title}
                onChange={set('title')}
                required
              />
            </div>

            {/* Case Type */}
            <div className="form-group-p2">
              <label className="field-label">Case Type <span className="req">*</span></label>
              <select className="field-input" value={form.caseType} onChange={set('caseType')} required>
                <option value="">Select case type</option>
                {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group-p2">
              <label className="field-label">Priority</label>
              <select className="field-input" value={form.priority} onChange={set('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Sensitivity */}
            <div className="form-group-p2">
              <label className="field-label">Sensitivity Level</label>
              <select className="field-input" value={form.sensitivity} onChange={set('sensitivity')}>
                <option value="INTERNAL">Internal</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="SECRET">Secret</option>
                <option value="HIGHLY_SENSITIVE">Highly Sensitive</option>
              </select>
            </div>

            {/* Department */}
            <div className="form-group-p2">
              <label className="field-label">Department</label>
              <input
                type="text"
                className="field-input"
                placeholder="Department name"
                value={form.department}
                onChange={set('department')}
              />
            </div>

            {/* Police Station */}
            <div className="form-group-p2">
              <label className="field-label">Police Station / Unit</label>
              <input
                type="text"
                className="field-input"
                placeholder="Police station or unit"
                value={form.policeStation}
                onChange={set('policeStation')}
              />
            </div>

            {/* Jurisdiction */}
            <div className="form-group-p2">
              <label className="field-label">Jurisdiction <span className="req">*</span></label>
              <input
                type="text"
                className="field-input"
                placeholder="e.g., Delhi, Mumbai North, etc."
                value={form.jurisdiction}
                onChange={set('jurisdiction')}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group-p2 span-2">
              <label className="field-label">Description</label>
              <textarea
                className="field-input field-textarea"
                rows={4}
                placeholder="Brief description of the investigation..."
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" className="button secondary" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Creating Case...' : (
                <><FolderKanban size={16} /> Create Case</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

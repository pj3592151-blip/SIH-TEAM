import React from 'react'
import { Lock, ShieldAlert } from 'lucide-react'

const STATUS_STYLES = {
  OPEN:                 { bg: '#e8f8f1', color: '#068960', label: 'Open' },
  UNDER_INVESTIGATION:  { bg: '#e9f2ff', color: '#0570e8', label: 'Under Investigation' },
  PENDING:              { bg: '#fff8df', color: '#a57908', label: 'Pending' },
  CHARGE_SHEET_FILED:   { bg: '#ffeef8', color: '#b0217d', label: 'Charge Sheet Filed' },
  COURT_PROCEEDING:     { bg: '#eeecff', color: '#5040d9', label: 'Court Proceeding' },
  CLOSED:               { bg: '#f1f3f6', color: '#68778e', label: 'Closed' },
  ARCHIVED:             { bg: '#f1f3f6', color: '#8a97ab', label: 'Archived' },
  // Legacy
  Active:               { bg: '#e8f8f1', color: '#068960', label: 'Active' },
  Closed:               { bg: '#f1f3f6', color: '#68778e', label: 'Closed' },
}

const PRIORITY_STYLES = {
  LOW:      { bg: '#eaf2ff', color: '#3774b9', label: 'Low' },
  MEDIUM:   { bg: '#fff8df', color: '#a57908', label: 'Medium' },
  HIGH:     { bg: '#fff0e5', color: '#ce6d24', label: 'High' },
  CRITICAL: { bg: '#ffecec', color: '#c93636', label: 'Critical' },
  // Legacy
  Low:      { bg: '#eaf2ff', color: '#3774b9', label: 'Low' },
  Medium:   { bg: '#fff8df', color: '#a57908', label: 'Medium' },
  High:     { bg: '#fff0e5', color: '#ce6d24', label: 'High' },
}

const SENSITIVITY_STYLES = {
  INTERNAL:         { bg: '#e8f5ff', color: '#2878eb', label: 'Internal' },
  RESTRICTED:       { bg: '#fff8df', color: '#a57908', label: 'Restricted' },
  CONFIDENTIAL:     { bg: '#fff0e5', color: '#ce6d24', label: 'Confidential' },
  SECRET:           { bg: '#ffecec', color: '#c93636', label: 'Secret', icon: true },
  HIGHLY_SENSITIVE: { bg: '#1a1a2e', color: '#ff4444', label: 'Highly Sensitive', icon: true },
}

const VERSION_COLORS = ['#2878eb', '#08aa77', '#df7d28', '#7c3aed', '#c93636']

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#f1f3f6', color: '#68778e', label: status }
  return (
    <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap', display: 'inline-block' }}>
      {s.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || { bg: '#f1f3f6', color: '#68778e', label: priority }
  return (
    <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: p.bg, color: p.color, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>
      {p.label} Priority
    </span>
  )
}

export function SensitivityBadge({ sensitivity }) {
  const s = SENSITIVITY_STYLES[sensitivity] || { bg: '#e8f5ff', color: '#2878eb', label: sensitivity }
  return (
    <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      {s.icon && <Lock size={9} />}
      {s.label}
    </span>
  )
}

export function VersionBadge({ version }) {
  const color = VERSION_COLORS[(version - 1) % VERSION_COLORS.length]
  return (
    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33`, display: 'inline-block' }}>
      V{version}
    </span>
  )
}

export function ImmutableBadge() {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: '#e8f8f1', color: '#068960', border: '1px solid #b3e8d0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <ShieldAlert size={10} />
      Preserved
    </span>
  )
}

export function RecordStatusBadge({ status }) {
  const styles = {
    ACTIVE:     { bg: '#e8f8f1', color: '#068960', label: 'Active' },
    SUPERSEDED: { bg: '#fff8df', color: '#a57908', label: 'Superseded' },
    INVALID:    { bg: '#ffecec', color: '#c93636', label: 'Invalidated' },
    REVOKED:    { bg: '#ffecec', color: '#c93636', label: 'Revoked' },
    ARCHIVED:   { bg: '#f1f3f6', color: '#68778e', label: 'Archived' },
  }
  const s = styles[status] || { bg: '#f1f3f6', color: '#68778e', label: status || 'Active' }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.color}33`, display: 'inline-block' }}>
      {s.label}
    </span>
  )
}

export function IntegrityBadge({ verified }) {
  if (verified) {
    return (
      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#e8f8f1', color: '#068960', border: '1px solid #b3e8d0', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        ✓ SHA-256 Verified
      </span>
    )
  }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#ffecec', color: '#c93636', border: '1px solid #f8b4b4', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      ⚠ Hash Mismatch
    </span>
  )
}

export function EvidenceTypeBadge({ type }) {
  const styles = {
    DIGITAL:     { bg: '#e9f2ff', color: '#0570e8' },
    PHYSICAL:    { bg: '#e0f8ef', color: '#02a778' },
    DOCUMENTARY: { bg: '#eeecff', color: '#5040d9' },
    VIDEO:       { bg: '#fff0df', color: '#e97921' },
    IMAGE:       { bg: '#ffeef8', color: '#b0217d' },
    AUDIO:       { bg: '#f1f8ff', color: '#3278b5' },
    FORENSIC:    { bg: '#fff8df', color: '#a57908' },
    OTHER:       { bg: '#f1f3f6', color: '#68778e' },
  }
  const s = styles[type] || styles.OTHER
  return (
    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color }}>
      {type}
    </span>
  )
}


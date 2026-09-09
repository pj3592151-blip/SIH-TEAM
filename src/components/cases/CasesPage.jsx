import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Filter, ChevronDown, FolderKanban,
  FileText, Clock3, MoreHorizontal, ShieldCheck, Users, Eye
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import { db } from '../../services/mockCaseData'
import { canCreateCase, hasPermission, PERMISSIONS } from '../../services/accessControl'
import { StatusBadge, PriorityBadge, SensitivityBadge } from '../shared/StatusBadge'

function CaseCard({ caseObj, onClick, currentUser }) {
  const members = db.getCaseMembers(caseObj.id)
  const activeMembers = members.filter(m => m.status === 'ACTIVE')
  const allUsers = db.getAllUsers()

  return (
    <motion.article
      className="case-card case-card-p2"
      whileHover={{ y: -3, boxShadow: '0 14px 30px rgba(26,47,78,.12)' }}
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(caseObj.id)}
    >
      <div className="case-top">
        <PriorityBadge priority={caseObj.priority} />
        <SensitivityBadge sensitivity={caseObj.sensitivity} />
      </div>

      <p className="case-number">{caseObj.caseNumber}</p>
      <h2 className="case-title">{caseObj.title}</h2>
      <p className="case-desc">{caseObj.description?.slice(0, 90)}{caseObj.description?.length > 90 ? '...' : ''}</p>

      <div style={{ marginBottom: 10 }}>
        <StatusBadge status={caseObj.status} />
      </div>

      <div className="case-metrics">
        <span><FileText size={13} /> {caseObj.caseType}</span>
        <span><Users size={13} /> {activeMembers.length} officer{activeMembers.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ fontSize: 11, color: '#6a7b95', display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, paddingTop: 10, borderTop: '1px solid #ebeff5' }}>
        <Clock3 size={12} />
        {new Date(caseObj.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        <span style={{ marginLeft: 'auto' }}>
          <span style={{ color: '#3774b9', fontWeight: 600 }}>{caseObj.jurisdiction}</span>
        </span>
      </div>

      <button
        className="case-open-btn"
        onClick={(e) => { e.stopPropagation(); onClick(caseObj.id) }}
        style={{ marginTop: 12, width: '100%', height: 34, borderRadius: 7, border: '1px solid #dce5f0', background: '#f7f9fc', color: '#183156', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
      >
        <Eye size={14} /> Open Case
      </button>
    </motion.article>
  )
}

const FILTER_OPTIONS = ['All', 'Open', 'Under Investigation', 'Pending', 'Closed', 'High Priority', 'Critical', 'My Cases']
const STATUS_MAP = {
  'All': null,
  'Open': 'OPEN',
  'Under Investigation': 'UNDER_INVESTIGATION',
  'Pending': 'PENDING',
  'Closed': 'CLOSED',
  'High Priority': null,
  'Critical': null,
  'My Cases': null,
}

export function CasesPage({ onOpenCase, onCreateCase }) {
  const { user } = useAuth()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const allAccessibleCases = useMemo(() => {
    try {
      return caseService.getAccessibleCases(user)
    } catch { return [] }
  }, [user])

  const filteredCases = useMemo(() => {
    let result = allAccessibleCases

    // Apply filter
    if (filter === 'High Priority') result = result.filter(c => c.priority === 'HIGH')
    else if (filter === 'Critical') result = result.filter(c => c.priority === 'CRITICAL')
    else if (filter === 'My Cases') result = result.filter(c => db.isUserAssigned(user?.id, c.id))
    else if (STATUS_MAP[filter]) result = result.filter(c => c.status === STATUS_MAP[filter])

    // Apply search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(c =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.caseType.toLowerCase().includes(q)
      )
    }

    return result
  }, [allAccessibleCases, filter, search, user])

  const canCreate = canCreateCase(user)

  return (
    <div className="page">
      {/* Page Header */}
      <section className="page-title">
        <div>
          <p className="eyebrow">CASE MANAGEMENT</p>
          <h1>Investigation Cases</h1>
          <span style={{ color: '#5c6d8b', fontSize: 15 }}>
            Manage, track, and investigate cases with full record integrity.
          </span>
        </div>
        {canCreate && (
          <button
            className="button primary"
            onClick={onCreateCase}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={17} /> Create Case
          </button>
        )}
      </section>

      {/* Access Level Notice */}
      {user && (
        <div className="access-level-bar">
          <ShieldCheck size={15} />
          <span>
            Viewing as: <strong>{user.name}</strong>
            <span className="access-sep">·</span>
            <strong>{user.rank}</strong>
            <span className="access-sep">·</span>
            {user.department}
            <span className="access-sep">·</span>
            <span className="access-jurisdiction">{user.jurisdiction}</span>
          </span>
          <span className="access-count">{allAccessibleCases.length} authorized case{allAccessibleCases.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Search */}
      <section className="filter-bar" style={{ marginBottom: 14 }}>
        <label style={{ flex: 1, maxWidth: 420 }}>
          <Search size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by case number, title, or keyword..."
          />
        </label>
      </section>

      {/* Filter Chips */}
      <div className="filter-chips" style={{ marginBottom: 22 }}>
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            className={filter === f ? 'selected' : ''}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <section className="empty-state">
          <span className="round-icon blue"><FolderKanban size={28} /></span>
          <h2>{search ? 'No matching cases found' : 'No cases available'}</h2>
          <p>
            {search
              ? 'Try a different search term or clear the filter.'
              : canCreate
                ? 'Create the first case to begin investigations.'
                : 'You will see cases here once they are assigned to you.'}
          </p>
          {canCreate && !search && (
            <button className="button primary" onClick={onCreateCase}>
              <Plus size={16} /> Create Case
            </button>
          )}
        </section>
      ) : (
        <div className="case-grid case-grid-p2">
          {filteredCases.map(c => (
            <CaseCard
              key={c.id}
              caseObj={c}
              onClick={onOpenCase}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  )
}

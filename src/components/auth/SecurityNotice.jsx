import React from 'react'
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'

export function SecurityNotice() {
  return (
    <div className="login-security-notice" role="contentinfo">
      <div className="security-notice-header">
        <ShieldCheck className="security-shield-icon" size={20} />
        <div>
          <strong>Secure Authentication</strong>
          <p>Access is protected by multi-factor authentication and monitored activity.</p>
        </div>
      </div>
      <div className="security-badges">
        <span className="sec-pill"><Lock size={12} /> Encrypted Session</span>
        <span className="sec-pill"><CheckCircle2 size={12} /> Biometric Verified</span>
      </div>
      <small className="security-legal-warning">
        Authorized Legal & Investigative Personnel Only. All activities are recorded for audit compliance.
      </small>
    </div>
  )
}

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, User, ArrowRight, AlertCircle, CheckCircle2,
  KeyRound, ChevronDown, Briefcase, Menu, X, Scale, FileLock2, Fingerprint, Mail, Search, Award, Shield, Lock, Smartphone
} from 'lucide-react'
import { PasswordInput } from './PasswordInput'
import { FaceAuthentication } from './FaceAuthentication'
import { SecurityNotice } from './SecurityNotice'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { RANKS, getRankAccessLevel, getAccessLevelLabel, getActionTier, ACTION_TIERS, ACCESS_LEVELS } from '../../services/accessControl'

const PUBLIC_LINKS = []

const RANK_GROUPS = [
  {
    category: 'Field & Investigation Ranks',
    description: 'Assigned case investigation & record entry',
    items: [
      { title: RANKS.CONSTABLE, level: ACCESS_LEVELS.FIELD_OFFICER, desc: 'Field officer & evidence collection' },
      { title: RANKS.HEAD_CONSTABLE, level: ACCESS_LEVELS.FIELD_OFFICER, desc: 'Senior field officer' },
      { title: RANKS.ASI, level: ACCESS_LEVELS.INVESTIGATION_OFFICER, desc: 'Assistant Sub-Inspector' },
      { title: RANKS.SI, level: ACCESS_LEVELS.INVESTIGATION_OFFICER, desc: 'Sub-Inspector / Lead Investigator' },
    ]
  },
  {
    category: 'Station & District Supervision (Case Creation & Management)',
    description: 'Higher authority — Can open new cases, update status & assign officers',
    items: [
      { title: RANKS.INSPECTOR, level: ACCESS_LEVELS.STATION_SUPERVISOR, desc: 'Inspector / Station Supervisor' },
      { title: RANKS.SHO, level: ACCESS_LEVELS.STATION_SUPERVISOR, desc: 'Station House Officer' },
      { title: RANKS.ACP, level: ACCESS_LEVELS.DISTRICT_SUPERVISOR, desc: 'Assistant Commissioner of Police' },
      { title: RANKS.DSP, level: ACCESS_LEVELS.DISTRICT_SUPERVISOR, desc: 'Deputy Superintendent of Police' },
      { title: RANKS.DCP, level: ACCESS_LEVELS.DISTRICT_SUPERVISOR, desc: 'Deputy Commissioner of Police' },
      { title: RANKS.SP, level: ACCESS_LEVELS.DISTRICT_SUPERVISOR, desc: 'Superintendent of Police / District Command' },
    ]
  },
  {
    category: 'Senior Command & Specialized Legal Roles',
    description: 'Command & Legal Oversight',
    items: [
      { title: RANKS.SSP, level: ACCESS_LEVELS.SENIOR_COMMAND, desc: 'Senior Superintendent of Police' },
      { title: RANKS.DIG, level: ACCESS_LEVELS.SENIOR_COMMAND, desc: 'Deputy Inspector General' },
      { title: RANKS.IG, level: ACCESS_LEVELS.SENIOR_COMMAND, desc: 'Inspector General' },
      { title: RANKS.ADG, level: ACCESS_LEVELS.STATE_COMMAND, desc: 'Additional Director General' },
      { title: RANKS.DGP, level: ACCESS_LEVELS.STATE_COMMAND, desc: 'Director General of Police' },
      { title: RANKS.LEGAL_OFFICER, level: ACCESS_LEVELS.STATION_SUPERVISOR, desc: 'Legal Officer / Prosecutor' },
      { title: RANKS.FORENSIC_OFFICER, level: ACCESS_LEVELS.INVESTIGATION_OFFICER, desc: 'Forensic Lab Expert' },
      { title: RANKS.CYBER_CELL_OFFICER, level: ACCESS_LEVELS.INVESTIGATION_OFFICER, desc: 'Cyber Crime Specialist' },
      { title: RANKS.SYSTEM_ADMINISTRATOR, level: ACCESS_LEVELS.DISTRICT_SUPERVISOR, desc: 'System IT Administrator' },
    ]
  }
]

export function LoginPage() {
  const { login } = useAuth()
  const [publicView, setPublicView] = useState('signin')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Form states
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [faceVerification, setFaceVerification] = useState(null)
  const [rankModalOpen, setRankModalOpen] = useState(false)
  const [rankSearchQuery, setRankSearchQuery] = useState('')

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [forgotModalOpen, setForgotModalOpen] = useState(false)

  const [signUpName, setSignUpName] = useState('')
  const [signUpId, setSignUpId] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirm, setSignUpConfirm] = useState('')
  const [signUpSubmitted, setSignUpSubmitted] = useState(false)
  const [signupStep, setSignupStep] = useState('details')
  const [mobileNumber, setMobileNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpHint, setOtpHint] = useState('')

  const goToView = (view) => {
    setPublicView(view)
    setMobileNavOpen(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  // Populate demo credentials for easy reviewer evaluation
  const populateDemo = () => {
    const demo = authService.getDemoCredentials()
    setUserId(demo.userId)
    setPassword(demo.password)
    setSelectedPosition(RANKS.SI)
    setErrorMessage('')
  }

  const PhoneIcon = () => <Smartphone className="input-icon left-icon" size={18} aria-hidden="true" />

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // 1. Validation checks
    if (!userId.trim()) {
      setErrorMessage('Please enter your User ID.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    if (!selectedPosition) {
      setErrorMessage('Please select your official Position / Rank.')
      return
    }

    // 2. Strict 2FA Enforcement: Face Verification required before main dashboard entry
    if (!faceVerification || !faceVerification.verified) {
      setErrorMessage('Face authentication required. Please scan your face to complete identity verification.')
      return
    }

    setIsSubmitting(true)

    try {
      setSuccessMessage('Verifying credentials & official rank...')
      // Phase 2 + Phase 3: complete login with strict rank verification
      await login(userId, password, faceVerification, selectedPosition)
    } catch (err) {
      setIsSubmitting(false)
      setErrorMessage(err.message || 'Authentication failed. Please check credentials and biometric verification.')
    }
  }

  const handleSignUp = (e) => {
    e?.preventDefault()
    setErrorMessage('')

    if (signupStep === 'details') {
      if (!signUpName.trim() || !signUpId.trim() || !signUpPassword || !signUpConfirm) {
        setErrorMessage('Please complete all required fields.')
        return
      }
      if (signUpPassword !== signUpConfirm) {
        setErrorMessage('Passwords do not match.')
        return
      }
      if (signUpPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters.')
        return
      }

      setSignupStep('mobile')
      setSuccessMessage('Account details saved. Now verify your mobile number to continue.')
      return
    }

    if (signupStep === 'mobile') {
      if (!mobileNumber.trim()) {
        setErrorMessage('Please enter your mobile number.')
        return
      }

      const basicPhone = mobileNumber.replace(/\D/g, '')
      if (basicPhone.length < 10) {
        setErrorMessage('Enter a valid mobile number with at least 10 digits.')
        return
      }

      const demoOtp = String(Math.floor(100000 + Math.random() * 900000))
      setOtpHint(`Demo OTP: ${demoOtp} (frontend-only demo)`)
      setOtpSent(true)
      setOtpCode('')
      setSignupStep('otp')
      setSuccessMessage('OTP sent to your mobile number. Demo mode is enabled, so any valid OTP format will be accepted here.')
      return
    }

    if (signupStep === 'otp') {
      if (!otpCode.trim()) {
        setErrorMessage('Please enter the OTP received on your mobile number.')
        return
      }

      setSignUpSubmitted(true)
      setSuccessMessage('Mobile verification complete. Access request submitted. A nodal officer will verify your identity before credentials are issued.')
      setSignupStep('submitted')
      return
    }
  }

  const resetSignupFlow = () => {
    setSignupStep('details')
    setSignUpSubmitted(false)
    setOtpSent(false)
    setOtpCode('')
    setMobileNumber('')
    setOtpHint('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const selectedRankLevel = selectedPosition ? getRankAccessLevel(selectedPosition) : null
  const selectedRankLabel = selectedRankLevel ? getAccessLevelLabel(selectedRankLevel) : null
  const selectedActionTier = selectedPosition ? getActionTier(selectedPosition) : null

  return (
    <div className="login-root">
      <div className="login-backdrop-glow" />
      <div className="login-backdrop-grid" />

      <header className="public-nav">
        <button type="button" className="public-nav-brand" onClick={() => goToView('home')}>
          <span className="public-nav-mark"><ShieldCheck size={18} /></span>
          <span>DocGuard</span>
        </button>

        {PUBLIC_LINKS.length > 0 && (
          <nav className={`public-nav-links ${mobileNavOpen ? 'open' : ''}`} aria-label="Primary">
            {PUBLIC_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                className={publicView === link.id ? 'active' : ''}
                onClick={() => goToView(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        <div className="public-nav-actions">
          <button
            type="button"
            className={`public-nav-ghost ${publicView === 'signin' ? 'active' : ''}`}
            onClick={() => goToView('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`public-nav-cta ${publicView === 'signup' ? 'active' : ''}`}
            onClick={() => goToView('signup')}
          >
            Sign up
          </button>
          <button
            type="button"
            className="public-nav-menu"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="public-nav-drawer">
          {PUBLIC_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              className={publicView === link.id ? 'active' : ''}
              onClick={() => goToView(link.id)}
            >
              {link.label}
            </button>
          ))}
          <button type="button" onClick={() => goToView('signin')}>Sign in</button>
          <button type="button" onClick={() => goToView('signup')}>Sign up</button>
        </div>
      )}

      {publicView === 'home' && (
        <PublicPanel title="Welcome" subtitle="">
          <div className="public-contact-card">
            <Mail size={18} />
            <div>
              <strong>Nodal IT Cell</strong>
              <code>sec-officer@docguard.gov.in</code>
            </div>
          </div>
        </PublicPanel>
      )}

      <main className="login-shell" role="main">
  <div className="login-inner">
        {publicView === 'signup' && (
          <>
            <div className="login-headings">
              <h2>Request Access</h2>
              <p>Create an account request. Credentials are issued after identity verification.</p>
            </div>
            <motion.div
              className="login-card signup-card"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {errorMessage && (
                <div className="auth-alert error" role="alert">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}
              {signUpSubmitted && successMessage && (
                <div className="auth-alert success" role="status">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              )}

              {!signUpSubmitted && (
                <form onSubmit={handleSignUp} className="login-form" noValidate>
                  {signupStep === 'details' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="signup-name">Full name <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <User className="input-icon left-icon" size={18} aria-hidden="true" />
                          <input id="signup-name" className="auth-input" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} placeholder="Enter your full name" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="signup-id">Requested User ID <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <User className="input-icon left-icon" size={18} aria-hidden="true" />
                          <input id="signup-id" className="auth-input" value={signUpId} onChange={(e) => setSignUpId(e.target.value)} placeholder="e.g. officer.id" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="signup-password">Password <span className="req">*</span></label>
                        <PasswordInput id="signup-password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="signup-confirm">Confirm password <span className="req">*</span></label>
                        <PasswordInput id="signup-confirm" value={signUpConfirm} onChange={(e) => setSignUpConfirm(e.target.value)} />
                      </div>
                      <button type="submit" className="button primary login-submit-btn">
                        Continue to mobile verification
                        <ArrowRight size={17} />
                      </button>
                    </>
                  )}

                  {signupStep === 'mobile' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="signup-mobile">Mobile number <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <PhoneIcon />
                          <input
                            id="signup-mobile"
                            className="auth-input"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="Enter your mobile number"
                            autoComplete="tel"
                          />
                        </div>
                      </div>

                      <div className="auth-alert success" role="status" style={{ marginBottom: 12 }}>
                        <CheckCircle2 size={18} />
                        <span>Demo mode enabled. Any valid phone format will proceed to OTP verification.</span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button type="button" className="button secondary" onClick={() => setSignupStep('details')}>
                          Back
                        </button>
                        <button type="submit" className="button primary login-submit-btn" style={{ flex: 1 }}>
                          Verify mobile
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </>
                  )}

                  {signupStep === 'otp' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="signup-otp">Enter OTP <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <KeyRound className="input-icon left-icon" size={18} aria-hidden="true" />
                          <input
                            id="signup-otp"
                            className="auth-input"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Enter OTP sent to your mobile"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                          />
                        </div>
                      </div>

                      {otpHint && (
                        <div className="auth-alert success" role="status" style={{ marginBottom: 12 }}>
                          <CheckCircle2 size={18} />
                          <span>{otpHint}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button type="button" className="button secondary" onClick={() => setSignupStep('mobile')}>
                          Back
                        </button>
                        <button type="submit" className="button primary login-submit-btn" style={{ flex: 1 }}>
                          Confirm OTP & submit
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </>
                  )}

                  {signupStep === 'submitted' && (
                    <div className="auth-alert success" role="status">
                      <CheckCircle2 size={18} />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <p className="signup-switch">
                    Already have an account?{' '}
                    <button type="button" className="text-link-btn" onClick={() => {
                      resetSignupFlow()
                      goToView('signin')
                    }}>Sign in</button>
                  </p>
                </form>
              )}

              {signUpSubmitted && successMessage && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      resetSignupFlow()
                      goToView('signin')
                    }}
                  >
                    Go to sign in
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {publicView === 'signin' && (
          <>
            <motion.div
              className="login-brand"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="brand-mark-login">
                <ShieldCheck size={28} />
              </div>
              <h1>DocGuard</h1>
              <p className="brand-tagline">Secure · Legal · Trusted</p>
            </motion.div>

            <div className="login-headings">
              <h2>Secure Access</h2>
              <p>Authenticate to access secure legal and investigation records.</p>
            </div>

            {/* Main Authentication Card */}
            <motion.div
              className="login-card"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Quick Demo Pre-fill Banner */}
              <div className="demo-credentials-banner">
                <div>
                  <span className="demo-badge">Demo Mode</span>
                  <small>Testing officer: <code>pranshu.jain</code> | <code>Pranshu@123</code></small>
                </div>
                <button
                  type="button"
                  className="fill-demo-btn"
                  onClick={populateDemo}
                  title="Click to automatically fill demo officer credentials"
                >
                  Fill Demo ID
                </button>
              </div>

              {/* Feedback Messages */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    className="auth-alert error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    role="alert"
                  >
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    className="auth-alert success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    role="status"
                  >
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} noValidate className="login-form">
                <div className="login-grid-landscape">
                  {/* COLUMN 1: FACTOR 1 CREDENTIALS & ACCESS ACTION */}
                  <div className="login-col-credentials">
                    <div className="auth-form-section">
                      <div className="section-header">
                        <span className="factor-pill">Factor 1</span>
                        <h4>Officer Credentials</h4>
                      </div>

                      {/* User ID Field */}
                      <div className="form-group">
                        <label htmlFor="user-id-input">
                          User ID <span className="req">*</span>
                        </label>
                        <div className="auth-input-wrapper">
                          <User className="input-icon left-icon" size={18} aria-hidden="true" />
                          <input
                            id="user-id-input"
                            type="text"
                            value={userId}
                            onChange={(e) => {
                              setUserId(e.target.value)
                              if (errorMessage) setErrorMessage('')
                            }}
                            placeholder="Enter your User ID"
                            className="auth-input"
                            autoComplete="username"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="form-group">
                        <div className="label-with-action">
                          <label htmlFor="password-input">
                            Password <span className="req">*</span>
                          </label>
                          <button
                            type="button"
                            className="text-link-btn"
                            onClick={() => setForgotModalOpen(true)}
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <PasswordInput
                          id="password-input"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (errorMessage) setErrorMessage('')
                          }}
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* ATTRACTIVE POSITION / RANK SELECTOR FEATURE */}
                      <div className="form-group">
                        <label>
                          Official Position / Rank <span className="req">*</span>
                        </label>

                        <div
                          className={`attractive-rank-trigger ${selectedPosition ? 'selected' : ''}`}
                          onClick={() => setRankModalOpen(true)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="rank-badge-icon">
                              <Award size={20} color="#2563eb" />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              {selectedPosition ? (
                                <>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                    {selectedPosition}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <span>Level {selectedRankLevel} · {selectedRankLabel}</span>
                                    <span style={{
                                      padding: '1px 6px',
                                      borderRadius: 4,
                                      fontWeight: 700,
                                      fontSize: 10,
                                      background: selectedActionTier === ACTION_TIERS.HIGHER_AUTHORITY ? '#e0e7ff' : selectedActionTier === ACTION_TIERS.CREATE ? '#dcfce7' : '#f1f5f9',
                                      color: selectedActionTier === ACTION_TIERS.HIGHER_AUTHORITY ? '#3730a3' : selectedActionTier === ACTION_TIERS.CREATE ? '#166534' : '#475569',
                                    }}>
                                      ⚡ {selectedActionTier}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                                    Select Your Official Rank / Position ▼
                                  </div>
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                    Strict Security: Selected rank must match your registered record
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronDown size={18} color="#64748b" />
                        </div>

                        <small className="position-security-note" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, color: '#64748b' }}>
                          <ShieldCheck size={12} color="#2563eb" />
                          Strict Enforcement: Selection is verified against DB. Selecting the wrong rank will block authentication.
                        </small>
                      </div>
                    </div>

                    {/* Submission CTA */}
                    <button
                      type="submit"
                      className={`button primary login-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Authenticating Identity...</>
                      ) : (
                        <>
                          Sign In to Secure Workspace
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>

                    {/* Security Information Notice */}
                    <SecurityNotice />
                  </div>

                  {/* COLUMN 2: FACTOR 2 BIOMETRIC FACE AUTHENTICATION */}
                  <div className="login-col-biometrics">
                    <div className="auth-form-section biometrics-section">
                      <div className="section-header">
                        <span className="factor-pill">Factor 2</span>
                        <h4>Biometric Verification</h4>
                      </div>

                      <FaceAuthentication
                        userId={userId}
                        verificationResult={faceVerification}
                        onVerificationComplete={(result) => {
                          setFaceVerification(result)
                          if (result?.verified) {
                            setErrorMessage('')
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}

        <footer className="login-footer">
          <p>
            SIH Problem Statement 26190 · Secure Digital Document Management System for Legal &amp; Investigation Documents
          </p>
          <em>Justice backed by integrity.</em>
        </footer>
      </div> {/* close login-inner */}
    </main>

      {/* ATTRACTIVE RANK SELECTION MODAL — RENDERED VIA PORTAL TO BODY FOR ABSOLUTE OPAQUE OVERLAY & TOP Z-INDEX */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {rankModalOpen && (
            <div
              className="rank-modal-backdrop-portal"
              onClick={() => setRankModalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: '#0a1426',
                zIndex: 999999,
                display: 'grid',
                placeItems: 'center',
                padding: 20,
              }}
            >
              <motion.div
                className="rank-modal-content-portal"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                style={{
                  maxWidth: 640,
                  width: '100%',
                  background: '#ffffff',
                  opacity: 1,
                  zIndex: 1000000,
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                  color: '#0f172a',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Award size={20} color="#2563eb" /> Select Official Position / Rank
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                      Select your official designated position for security verification
                    </p>
                  </div>
                  <button className="button-close" onClick={() => setRankModalOpen(false)}>×</button>
                </div>

                {/* Opaque Search Filter */}
                <div style={{ padding: '12px 20px 0', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', opacity: 1, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', gap: 8 }}>
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search position or rank (e.g. Sub-Inspector, Inspector, SP, Legal Officer)..."
                      value={rankSearchQuery}
                      onChange={e => setRankSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, color: '#0f172a' }}
                    />
                    {rankSearchQuery && (
                      <button type="button" onClick={() => setRankSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="modal-body" style={{ padding: 20, maxHeight: 420, overflowY: 'auto', background: '#ffffff', opacity: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {RANK_GROUPS.map(group => {
                      const filteredItems = group.items.filter(item =>
                        item.title.toLowerCase().includes(rankSearchQuery.toLowerCase()) ||
                        item.desc.toLowerCase().includes(rankSearchQuery.toLowerCase())
                      )

                      if (filteredItems.length === 0) return null

                      return (
                        <div key={group.category}>
                          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 10 }}>
                            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                              {group.category}
                            </h4>
                            <span style={{ fontSize: 11, color: '#64748b' }}>{group.description}</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                            {filteredItems.map(item => {
                              const isSelected = selectedPosition === item.title
                              const canCreate = item.level >= ACCESS_LEVELS.STATION_SUPERVISOR || item.title === RANKS.LEGAL_OFFICER

                              return (
                                <motion.div
                                  key={item.title}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => {
                                    setSelectedPosition(item.title)
                                    if (errorMessage) setErrorMessage('')
                                    setRankModalOpen(false)
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                    background: isSelected ? '#eff6ff' : '#ffffff',
                                    opacity: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justify: 'space-between',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                                        {item.title}
                                      </span>
                                      {isSelected && <CheckCircle2 size={16} color="#2563eb" />}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                                      {item.desc}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
                                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#334155', fontWeight: 600 }}>
                                      Level {item.level} · {getAccessLevelLabel(item.level)}
                                    </span>
                                     {(() => {
                                       const tier = getActionTier(item.title)
                                       const isHigher = tier === ACTION_TIERS.HIGHER_AUTHORITY
                                       const isCreate = tier === ACTION_TIERS.CREATE
                                       return (
                                         <span style={{
                                           padding: '1px 6px',
                                           borderRadius: 4,
                                           fontWeight: 700,
                                           fontSize: 10,
                                           background: isHigher ? '#e0e7ff' : isCreate ? '#dcfce7' : '#f1f5f9',
                                           color: isHigher ? '#3730a3' : isCreate ? '#166534' : '#475569',
                                         }}>
                                           ⚡ {tier}
                                         </span>
                                       )
                                     })()}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Selected: <strong>{selectedPosition || 'None'}</strong>
                  </span>
                  <button className="button primary" style={{ opacity: 1, zIndex: 1 }} onClick={() => setRankModalOpen(false)}>Done</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal auth-dialog"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-modal-title"
            >
              <div className="modal-icon blue">
                <KeyRound size={24} />
              </div>
              <h2 id="forgot-modal-title">Credential Recovery Protocol</h2>
              <p>
                In accordance with Secure Investigation Guidelines, password resets must be issued
                through the <strong>Department Security Administrator</strong> or the <strong>Nodal IT Cell</strong>.
              </p>
              <div className="modal-instruction-box">
                <small>Contact your designated System Nodal Officer with your Service ID:</small>
                <code>sec-officer@docguard.gov.in</code>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button primary"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PublicPanel({ title, subtitle, children }) {
  return (
    <motion.section
      className="public-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </motion.section>
  )
}

function PublicFeature({ icon: Icon, title, text }) {
  return (
    <article className="public-feature">
      <span><Icon size={18} /></span>
      <b>{title}</b>
      <small>{text}</small>
    </article>
  )
}

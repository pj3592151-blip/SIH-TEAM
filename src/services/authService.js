/**
 * DocGuard - Authentication Service
 * Phase 1: Two-Factor Authentication (Credentials + Biometric Face Verification)
 * Phase 2: Extended with rank/role/permissions for RBAC + ABAC
 *
 * CRITICAL SECURITY RULE:
 *   The position selected on the login page is NEVER used for authorization.
 *   Real rank and permissions come from the authenticated database record (mockUsers).
 *
 * Implements clean abstraction for authentication logic.
 * Supports mock development data while providing integration points for backend APIs.
 */

import { mockUsers } from './mockCaseData'
import { verifySelectedPosition } from './accessControl'

const STORAGE_KEY = 'docguard_auth_session'

// Credential lookup table (passwords only — full profile loaded from mockUsers)
const MOCK_CREDENTIALS = [
  { id: 'demo.investigator', password: 'Demo@12345' },
  { id: 'pranshu.kumar', password: 'Pranshu@123' },
  { id: 'a.singh', password: 'Legal@123' },
  { id: 'r.mehta', password: 'Forensic@123' },
  { id: 'sp.sharma', password: 'District@123' },
  { id: 'constable.test', password: 'Constable@123' },
]

export const authService = {
  /**
   * Validate User ID and Password without exposing which field failed.
   * Returns full sanitized user profile from mockUsers (Phase 2 extended data).
   */
  async validateCredentials(userId, password) {
    // Simulate brief network latency
    await new Promise(resolve => setTimeout(resolve, 350))

    if (!userId || !password) {
      throw new Error('Please enter both User ID and password.')
    }

    const trimmedId = userId.trim().toLowerCase()

    // Step 1: Verify credentials
    const cred = MOCK_CREDENTIALS.find(
      u => u.id.toLowerCase() === trimmedId && u.password === password
    )

    if (!cred) {
      // Intentionally generic security error message
      throw new Error('Invalid User ID or password.')
    }

    // Step 2: Load full user profile from Phase 2 data store (ABAC data)
    const fullUser = mockUsers.find(u => u.id.toLowerCase() === trimmedId)
    if (!fullUser) {
      throw new Error('User profile not found. Contact system administrator.')
    }

    // Return public user data without password
    const { password: _, ...safeUser } = fullUser
    return safeUser
  },

  /**
   * Complete 2FA login requiring BOTH valid credentials AND face verification.
   * Phase 2: Accepts selectedPosition for context (NOT for authorization).
   *
   * SECURITY: selectedPosition is verified against DB rank.
   * The database rank ALWAYS takes precedence for all access decisions.
   */
  async completeLogin({ userId, password, faceVerification, selectedPosition }) {
    // 1. Validate credentials and get full user profile
    const safeUser = await this.validateCredentials(userId, password)

    // 2. Validate face verification factor
    if (!faceVerification || !faceVerification.verified) {
      throw new Error('Face authentication required. Please complete face scan.')
    }

    // 3. SECURITY CHECK: Verify selected position against authenticated DB rank.
    // If the selected position does NOT match the user's actual registered rank, BLOCK login!
    const positionVerification = verifySelectedPosition(safeUser, selectedPosition)
    if (!positionVerification.verified) {
      throw new Error(
        positionVerification.error ||
        `Position Verification Failed: Selected position "${selectedPosition}" does not match your officially registered rank "${safeUser.rank}". Access Denied.`
      )
    }

    // 4. Construct authenticated session object
    const session = {
      isAuthenticated: true,
      user: safeUser, // Full user profile with permissions from DB
      authenticationMethod: {
        password: true,
        face: true,
      },
      faceBiometricToken: faceVerification.biometricToken || 'mock_bio_token_' + Date.now(),
      loginTime: new Date().toISOString(),
      selectedPosition: selectedPosition || safeUser.rank,
      positionVerification,
      permissions: safeUser.permissions || [],
      accessLevel: safeUser.accessLevel,
      rank: safeUser.rank, // Authoritative rank from DB
    }

    this.setStoredSession(session)
    return session
  },

  /**
   * Retrieve active session from storage
   */
  getStoredSession() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
      if (!data) return null
      const parsed = JSON.parse(data)
      if (parsed && parsed.isAuthenticated && parsed.user) {
        return parsed
      }
    } catch {
      // Ignore parse errors and return null
    }
    return null
  },

  /**
   * Save session to storage
   */
  setStoredSession(session) {
    try {
      const serialized = JSON.stringify(session)
      sessionStorage.setItem(STORAGE_KEY, serialized)
      localStorage.setItem(STORAGE_KEY, serialized)
    } catch {
      // Storage unavailable or disabled
    }
  },

  /**
   * Terminate session and remove credentials from storage
   */
  clearSession() {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage unavailable
    }
  },

  /**
   * Get default mock credentials for display / demo hint
   */
  getDemoCredentials() {
    return {
      userId: 'demo.investigator',
      password: 'Demo@12345',
      officer: 'Pranshu Kumar (SI – Investigation Officer)',
    }
  },
}

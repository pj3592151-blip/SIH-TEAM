import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Reusable modal wrapper matching DocGuard design language.
 */
export function Modal({ open, onClose, title, children, size = 'md', icon: Icon, iconClass = 'blue' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className={`modal modal-${size}`}
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{ textAlign: 'left', maxWidth: size === 'lg' ? 700 : size === 'xl' ? 900 : 480 }}
          >
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {Icon && (
                  <div className={`modal-icon ${iconClass}`} style={{ margin: 0, flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                )}
                <h2 style={{ margin: 0, fontSize: 17, textAlign: 'left' }}>{title}</h2>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

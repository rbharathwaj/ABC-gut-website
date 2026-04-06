import { useState, useRef } from 'react'
import styles from './TooltipHeading.module.css'

export default function TooltipHeading({ as: Tag = 'h2', title, definition, gutlyPrompt, onAskGutly, className }) {
  const [visible, setVisible] = useState(false)
  const hideTimer = useRef(null)

  function show() {
    clearTimeout(hideTimer.current)
    setVisible(true)
  }

  function hide() {
    // Small delay so user can move mouse into the tooltip without it closing
    hideTimer.current = setTimeout(() => setVisible(false), 120)
  }

  function handleAskGutly() {
    setVisible(false)
    onAskGutly?.(gutlyPrompt)
  }

  return (
    <div className={styles.wrapper} onMouseEnter={show} onMouseLeave={hide}>
      <Tag className={`${styles.heading} ${className || ''}`}>
        {title}
        <span className={styles.hintIcon} title="Hover for definition">?</span>
      </Tag>

      {visible && (
        <div className={styles.tooltip} onMouseEnter={show} onMouseLeave={hide}>
          <div className={styles.tooltipTitle}>{title}</div>
          <p className={styles.tooltipDef}>{definition}</p>
          {gutlyPrompt && onAskGutly && (
            <button className={styles.askBtn} onClick={handleAskGutly}>
              <span className={styles.askDot} />
              Ask Gutly about this
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

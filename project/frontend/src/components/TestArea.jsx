import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function TestArea({
  charStates,
  currentIndex,
  input,
  onInputChange,
  onRestart,
  progress,
  status,
}) {
  const inputRef = useRef(null)
  const [hasStarted, setHasStarted] = useState(false)

  // Reset local state if it restarts (status goes back to idle or progress resets)
  useEffect(() => {
    if (status === 'idle' && input === '') {
      setHasStarted(false)
    }
  }, [status, input])

  useEffect(() => {
    if (hasStarted) {
      inputRef.current?.focus()
    }
  }, [hasStarted])

  const progressColor =
    status === 'finished'
      ? 'bg-[linear-gradient(90deg,var(--ok),var(--accent))]'
      : 'bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]'

  return (
    <section className="glass-card rounded-3xl p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Typing Zone</p>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-white/30 px-3 py-1 text-xs text-[var(--text-primary)] transition hover:bg-white/20"
        >
          Restart Test
        </button>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className={`h-full ${progressColor}`}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        />
      </div>

      <div className="relative w-full">
        {!hasStarted && status === 'idle' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setHasStarted(true)
                setTimeout(() => inputRef.current?.focus(), 0)
              }}
              className="rounded-full bg-[var(--accent)] px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-[var(--accent-2)]"
            >
              Start Test
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => hasStarted && inputRef.current?.focus()}
          className="relative w-full rounded-2xl border border-white/20 bg-black/10 px-4 py-5 text-left"
        >
          <div className="font-mono text-sm leading-8 tracking-wide sm:text-lg">
            {charStates.map((item, index) => {
              let className = 'text-[var(--text-muted)]'

              if (item.state === 'correct') className = 'text-[var(--ok)]'
              if (item.state === 'incorrect') className = 'bg-[var(--danger)]/20 text-[var(--danger)]'

              return (
                <span key={`${item.char}-${index}`} className={className}>
                  {item.char}
                  {index === currentIndex && status !== 'finished' ? (
                    <span className="typing-cursor" aria-hidden="true" />
                  ) : null}
                </span>
              )
            })}
          </div>
        </button>
      </div>

      <textarea
        ref={inputRef}
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        className="sr-only"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={!hasStarted}
      />

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Start typing immediately. Backspace is supported, and pressing restart generates a new prompt.
      </p>
    </section>
  )
}

import { useEffect, useRef } from 'react'

export default function TestArea({ charStates, input, onType, currentIndex, progress, onRestart }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Typing Test</p>
        <button type="button" onClick={onRestart} className="chip">
          Restart
        </button>
      </div>

      <div className="mb-4 h-2 rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button type="button" onClick={() => inputRef.current?.focus()} className="w-full rounded-xl border border-white/25 bg-black/10 px-4 py-5 text-left">
        <div className="font-mono text-sm leading-8 sm:text-lg">
          {charStates.map((item, index) => {
            const className =
              item.state === 'correct'
                ? 'text-[var(--ok)]'
                : item.state === 'wrong'
                  ? 'bg-[var(--danger)]/20 text-[var(--danger)]'
                  : 'text-[var(--text-muted)]'

            return (
              <span key={`${index}-${item.char}`} className={className}>
                {item.char}
                {index === currentIndex ? <span className="typing-cursor" aria-hidden="true" /> : null}
              </span>
            )
          })}
        </div>
      </button>

      <textarea
        ref={inputRef}
        value={input}
        onChange={(event) => onType(event.target.value)}
        className="sr-only"
        spellCheck={false}
      />
    </section>
  )
}

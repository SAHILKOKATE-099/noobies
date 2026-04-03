export default function ModeSelector({
  modeType,
  modeValue,
  setModeType,
  setModeValue,
  activeMode,
  setActiveMode,
}) {
  const options = modeType === 'time' ? [30, 60, 120] : modeType === 'words' ? [25, 50, 100] : []

  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveMode('practice')}
          className={`chip ${activeMode === 'practice' ? 'chip-active' : ''}`}
        >
          Practice
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('multiplayer')}
          className={`chip ${activeMode === 'multiplayer' ? 'chip-active' : ''}`}
        >
          Multiplayer
        </button>
      </div>

      {activeMode === 'practice' ? (
        <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setModeType('time')
            setModeValue(60)
          }}
          className={`chip ${modeType === 'time' ? 'chip-active' : ''}`}
        >
          Time
        </button>
        <button
          type="button"
          onClick={() => {
            setModeType('words')
            setModeValue(50)
          }}
          className={`chip ${modeType === 'words' ? 'chip-active' : ''}`}
        >
          Words
        </button>
        <button
          type="button"
          onClick={() => {
            setModeType('paragraph')
            setModeValue(1)
          }}
          className={`chip ${modeType === 'paragraph' ? 'chip-active' : ''}`}
        >
          Paragraph
        </button>
        </div>
      ) : null}

      {activeMode === 'practice' ? (
        options.length ? (
          <div className="flex flex-wrap gap-2">
            {options.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setModeValue(value)}
                className={`chip ${modeValue === value ? 'chip-active' : ''}`}
              >
                {modeType === 'time' ? `${value}s` : `${value} words`}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Complete the full paragraph to finish this test.</p>
        )
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          Race with 5 players. Winner gets 1 point on the global race leaderboard.
        </p>
      )}
    </section>
  )
}

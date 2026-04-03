import { motion } from 'framer-motion'
import { TIME_OPTIONS, WORD_OPTIONS } from '../utils/constants'

const buttonStyle =
  'rounded-full border px-3 py-1.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow'

const activeStyle =
  'border-transparent bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(34,197,94,0.25)]'

const inactiveStyle =
  'border-white/30 bg-white/20 text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]'

export default function ModeSelector({
  mode,
  onChangeModeType,
  onChangeModeValue,
  customText,
  onCustomTextChange,
  onApplyCustomText,
}) {
  const options = mode.type === 'time' ? TIME_OPTIONS : WORD_OPTIONS

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${buttonStyle} ${mode.type === 'time' ? activeStyle : inactiveStyle}`}
          onClick={() => onChangeModeType('time')}
        >
          Time Mode
        </button>
        <button
          type="button"
          className={`${buttonStyle} ${mode.type === 'words' ? activeStyle : inactiveStyle}`}
          onClick={() => onChangeModeType('words')}
        >
          Word Mode
        </button>

        {options.map((value) => {
          const label = mode.type === 'time' ? `${value}s` : `${value} words`

          return (
            <button
              key={value}
              type="button"
              className={`${buttonStyle} ${mode.value === value ? activeStyle : inactiveStyle}`}
              onClick={() => onChangeModeValue(value)}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={customText}
          onChange={(event) => onCustomTextChange(event.target.value)}
          className="w-full rounded-xl border border-white/35 bg-white/20 px-4 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          placeholder="Paste custom text and press apply"
        />
        <button
          type="button"
          onClick={onApplyCustomText}
          className="rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
        >
          Apply Text
        </button>
      </div>
    </motion.section>
  )
}

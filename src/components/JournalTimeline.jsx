const ENTRY_LABELS = {
  duel: 'Duel Replay',
  finale: 'Closing Poster',
  journal: 'Time Capsule',
  keepsake: 'Prize Pocket',
  prompt: 'Conversation Slip',
  ritual: 'Shared Ritual',
}

const VIBE_LABELS = {
  playful: 'Playful',
  spicy: 'Spicy',
  tender: 'Tender',
}

function toDateValue(value) {
  if (!value) {
    return null
  }

  if (typeof value.toDate === 'function') {
    return value.toDate()
  }

  const resolved = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(resolved.getTime())) {
    return null
  }

  return resolved
}

function formatDate(value, options) {
  const date = toDateValue(value)
  if (!date) {
    return null
  }

  return date.toLocaleDateString(undefined, options)
}

function formatSavedDate(value) {
  return (
    formatDate(value, {
      day: 'numeric',
      month: 'short',
    }) || 'Saved tonight'
  )
}

function formatOpenAt(openAt) {
  const formatted = formatDate(openAt, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return formatted ? `Sealed until ${formatted}` : null
}

function splitSpeakerLine(line) {
  const dividerIndex = line.indexOf(':')
  if (dividerIndex <= 0) {
    return null
  }

  return {
    speaker: line.slice(0, dividerIndex).trim(),
    text: line.slice(dividerIndex + 1).trim(),
  }
}

function getResponseRows(entry) {
  const lines = (entry.text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length) {
    return lines.map((line, index) => {
      const parsed = splitSpeakerLine(line)
      if (parsed) {
        return parsed
      }

      return {
        speaker: index === 0 ? 'Saved line' : `Saved line ${index + 1}`,
        text: line,
      }
    })
  }

  const payloadEntries = Array.isArray(entry.payload?.entries) ? entry.payload.entries : []
  return payloadEntries.map((item, index) => ({
    speaker: index === 0 ? 'First pass' : `Pass ${index + 1}`,
    text: item.text,
  }))
}

function getDuelRows(entry) {
  const labels = (entry.text || '')
    .split('\n')
    .map((line) => splitSpeakerLine(line.trim()))
    .filter(Boolean)
  const results = Object.values(entry.payload?.results || {})

  return results.map((result, index) => {
    const label = labels[index]
    const metrics = []

    if (typeof result.time === 'number' && result.time < 90) {
      metrics.push(`${result.time.toFixed(2)}s`)
    }

    if (typeof result.score === 'number') {
      metrics.push(`${result.score} pts`)
    }

    if (typeof result.value === 'number') {
      metrics.push(`Match ${result.value}`)
    }

    return {
      highlight:
        label?.text ||
        result.highlight ||
        (result.skipped ? 'Skipped the replay.' : result.won ? 'Landed it clean.' : 'Locked a close finish.'),
      label: label?.speaker || `Player ${index + 1}`,
      metrics,
      skipped: Boolean(result.skipped),
      won: Boolean(result.won),
    }
  })
}

function getEntrySticker(entry) {
  return ENTRY_LABELS[entry.type] || 'Saved Beat'
}

function getEntryDate(entry) {
  return formatSavedDate(entry.createdAt)
}

function JournalEmptyState() {
  return (
    <div className="journal-card journal-empty scrapbook-empty">
      <strong>Your scrapbook is still blank.</strong>
      <p>The first page appears as soon as a prompt, duel, or keepsake is worth saving.</p>
    </div>
  )
}

function EntryMeta({ entry }) {
  const openAt = formatOpenAt(entry.openAt || entry.payload?.openAt)

  return (
    <div className="scrapbook-meta">
      <div>
        <span className="scrapbook-sticker">{getEntrySticker(entry)}</span>
        <span className="scrapbook-date">{getEntryDate(entry)}</span>
      </div>
      <span className="scrapbook-vibe">{VIBE_LABELS[entry.vibe] || 'Tender'}</span>
      {openAt && <span className="scrapbook-seal">{openAt}</span>}
    </div>
  )
}

function ActivityEntryCard({ entry }) {
  const responses = getResponseRows(entry)

  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
      </div>
      {entry.payload?.prompt && (
        <div className="scrapbook-prompt">
          <span>Prompt</span>
          <p>{entry.payload.prompt}</p>
        </div>
      )}
      <div className="scrapbook-response-grid">
        {responses.map((response, index) => (
          <div key={`${response.speaker}-${index}`} className="scrapbook-response-card">
            <span>{response.speaker}</span>
            <p>{response.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function DuelEntryCard({ entry }) {
  const duelRows = getDuelRows(entry)
  const imageDataUrl = entry.payload?.imageDataUrl || null

  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
      </div>
      <div className="scrapbook-duel-banner">
        <span>Shared hearts</span>
        <strong>+{entry.payload?.heartBonus || 0}</strong>
      </div>
      {imageDataUrl && <img alt={entry.title} className="scrapbook-image" src={imageDataUrl} />}
      <div className="scrapbook-duel-grid">
        {duelRows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className={`scrapbook-duel-card${row.won ? ' winner' : ''}${row.skipped ? ' skipped' : ''}`}
          >
            <span>{row.label}</span>
            <p>{row.highlight}</p>
            {row.metrics.length > 0 && <strong>{row.metrics.join('  |  ')}</strong>}
          </div>
        ))}
      </div>
    </>
  )
}

function KeepsakeEntryCard({ entry }) {
  return (
    <div className="scrapbook-keepsake-ticket">
      <div className="scrapbook-headline">
        <strong>{entry.payload?.label || entry.title}</strong>
        <p>{entry.payload?.blurb || entry.text || entry.summary}</p>
      </div>
      <div className="scrapbook-ticket-row">
        <div>
          <span>Cost</span>
          <strong>{entry.payload?.cost || 0} hearts</strong>
        </div>
        <div>
          <span>Saved as</span>
          <strong>{entry.summary}</strong>
        </div>
      </div>
    </div>
  )
}

function FinaleEntryCard({ entry }) {
  const keepsakeLabels = Array.isArray(entry.payload?.keepsakeLabels) ? entry.payload.keepsakeLabels : []

  return (
    <>
      <div className="scrapbook-finale-hero">
        <span>{entry.payload?.tierLabel || 'Scrapbook headliner'}</span>
        <strong>{entry.payload?.headline || entry.title}</strong>
        <p>{entry.payload?.coda || entry.summary}</p>
      </div>
      <div className="scrapbook-stats-grid">
        <div>
          <span>Hearts</span>
          <strong>{entry.payload?.hearts || 0}</strong>
        </div>
        <div>
          <span>Moments</span>
          <strong>{entry.payload?.journalCount || 0}</strong>
        </div>
        <div>
          <span>Keepsakes</span>
          <strong>{entry.payload?.keepsakeCount || 0}</strong>
        </div>
      </div>
      <div className="scrapbook-ticket-row finale-row">
        <div>
          <span>Closing beat</span>
          <strong>{entry.payload?.duelOutcomeLabel || 'Night sealed'}</strong>
        </div>
        <div>
          <span>Lead vibe</span>
          <strong>{VIBE_LABELS[entry.payload?.dominantVibe] || VIBE_LABELS[entry.vibe] || 'Tender'}</strong>
        </div>
      </div>
      {keepsakeLabels.length > 0 && (
        <div className="scrapbook-tag-row">
          {keepsakeLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
    </>
  )
}

function DefaultEntryCard({ entry }) {
  return (
    <div className="scrapbook-headline">
      <strong>{entry.title}</strong>
      <p>{entry.text || entry.summary}</p>
    </div>
  )
}

function ScrapbookEntry({ entry, index }) {
  let body = <DefaultEntryCard entry={entry} />

  if (entry.type === 'duel') {
    body = <DuelEntryCard entry={entry} />
  } else if (entry.type === 'keepsake') {
    body = <KeepsakeEntryCard entry={entry} />
  } else if (entry.type === 'finale') {
    body = <FinaleEntryCard entry={entry} />
  } else if (entry.type === 'prompt' || entry.type === 'ritual' || entry.type === 'journal') {
    body = <ActivityEntryCard entry={entry} />
  }

  return (
    <article
      className={`journal-card scrapbook-entry entry-${entry.type} vibe-${entry.vibe || 'tender'} angle-${index % 3}`}
    >
      <EntryMeta entry={entry} />
      {body}
    </article>
  )
}

export function JournalTimeline({ entries }) {
  if (!entries.length) {
    return <JournalEmptyState />
  }

  return (
    <div className="journal-timeline scrapbook-flow">
      {entries.map((entry, index) => (
        <ScrapbookEntry entry={entry} index={index} key={entry.id} />
      ))}
    </div>
  )
}

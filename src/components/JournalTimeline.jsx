const ENTRY_LABELS = {
  bluff: 'Bidding Receipt',
  canvas: 'Merged Canvas',
  duel: 'Duel Replay',
  finale: 'Closing Poster',
  harmonic: 'Resonance Lock',
  journal: 'Time Capsule',
  keepsake: 'Prize Pocket',
  maze: 'Shared Route',
  match: 'Matched Instincts',
  prediction: 'Prediction Reveal',
  photo: 'Photo Flashback',
  prompt: 'Conversation Slip',
  ritual: 'Shared Ritual',
  tempo: 'Rhythm Replay',
  vault: 'The Vault',
  'vibe-sync': 'Marker Reveal',
  word: 'Letterpress Page',
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

function ChoiceRevealCard({ entry }) {
  const matched = Boolean(entry.payload?.matched)
  const revealLabel = entry.type === 'prediction'
    ? matched
      ? 'Called it'
      : 'Surprise reveal'
    : matched
      ? 'Mind meld'
      : 'Different instincts'
  const answers = entry.type === 'prediction'
    ? [
        {
          label: 'Prediction',
          text: entry.payload?.prediction?.label,
        },
        {
          label: 'Actual answer',
          text: entry.payload?.actual?.label,
        },
      ]
    : (entry.payload?.answers || []).map((answer, index) => ({
        label: index === 0 ? 'First answer' : 'Second answer',
        text: answer.label,
      }))

  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
      </div>
      <div className={`scrapbook-match-banner${matched ? ' matched' : ''}`}>
        <span>{revealLabel}</span>
        <strong>+{entry.payload?.heartBonus || 0} hearts</strong>
      </div>
      <div className="scrapbook-prompt">
        <span>Prompt</span>
        <p>{entry.payload?.prompt}</p>
      </div>
      <div className="scrapbook-response-grid">
        {answers.map((answer, index) => (
          <div className="scrapbook-response-card" key={`${answer.label}-${index}`}>
            <span>{answer.label}</span>
            <p>{answer.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function VaultEntryCard({ entry, revealed }) {
  if (!revealed) {
    return (
      <div className="scrapbook-vault-sealed">
        <div className="vault-seal-mark" aria-hidden="true">ALL</div>
        <span>Sealed for this night’s finale</span>
        <strong>Two notes are waiting inside.</strong>
        <p>The words stay hidden until both players reach the closing poster.</p>
      </div>
    )
  }

  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title} — Opened</strong>
        <p>The finale broke the seal. Keep these somewhere close.</p>
      </div>
      <div className="scrapbook-prompt">
        <span>What you sealed</span>
        <p>{entry.payload?.prompt}</p>
      </div>
      <div className="scrapbook-response-grid">
        {getResponseRows(entry).map((response, index) => (
          <div className="scrapbook-response-card" key={`${response.speaker}-${index}`}>
            <span>{response.speaker}</span>
            <p>{response.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function WaveTwoResultCard({ entry }) {
  const responses = getResponseRows(entry)
  let bannerLabel = 'Shared result'
  let bannerValue = `+${entry.payload?.heartBonus || 0} hearts`

  if (entry.type === 'vibe-sync') {
    bannerLabel = 'Alignment'
    bannerValue = `${entry.payload?.syncScore || 0}%`
  } else if (entry.type === 'tempo') {
    bannerLabel = 'Combined rhythm'
    bannerValue = `${entry.payload?.averageAccuracy || 0}%`
  } else if (entry.type === 'word') {
    bannerLabel = 'Combined dictionary'
    bannerValue = `${entry.payload?.combinedWordCount || 0} words`
  }

  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
      </div>
      <div className="scrapbook-match-banner matched">
        <span>{bannerLabel}</span>
        <strong>{bannerValue}</strong>
      </div>

      {entry.type === 'vibe-sync' && (
        <div className="scrapbook-continuum">
          <div>
            <span>{entry.payload?.leftLabel}</span>
            <span>{entry.payload?.rightLabel}</span>
          </div>
          <div className="scrapbook-continuum-track">
            {(entry.payload?.markers || []).map((marker, index) => (
              <i
                className={`marker-${index}`}
                key={`${marker.playerIndex}-${marker.value}`}
                style={{ left: `${marker.value}%` }}
              >
                {marker.value}
              </i>
            ))}
          </div>
        </div>
      )}

      {entry.type === 'word' && (
        <div className="scrapbook-letter-row">
          {(entry.payload?.letters || []).map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
        </div>
      )}

      <div className="scrapbook-response-grid">
        {responses.map((response, index) => (
          <div className="scrapbook-response-card" key={`${response.speaker}-${index}`}>
            <span>{response.speaker}</span>
            <p>{response.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function CooperativeResultCard({ entry }) {
  const responses = getResponseRows(entry)

  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
      </div>

      {entry.type === 'maze' && (
        <div className="scrapbook-coop-stats">
          <div>
            <span>Shared moves</span>
            <strong>{entry.payload?.moves || 0}</strong>
          </div>
          <div>
            <span>Wall bumps</span>
            <strong>{entry.payload?.bumps || 0}</strong>
          </div>
        </div>
      )}

      {entry.type === 'canvas' && (
        <>
          <div className="scrapbook-prompt">
            <span>Blind prompt</span>
            <p>{entry.payload?.prompt}</p>
          </div>
          <div className="scrapbook-blind-canvas">
            {(entry.payload?.halves || []).map((half) => (
              <img
                alt={`${half.side} half of ${entry.payload?.prompt}`}
                key={`${half.playerIndex}-${half.side}`}
                src={half.imageDataUrl}
              />
            ))}
          </div>
        </>
      )}

      {entry.type === 'harmonic' && (
        <div className="scrapbook-match-banner matched">
          <span>Shared resonance</span>
          <strong>{entry.payload?.averageResonance || 0}%</strong>
        </div>
      )}

      <div className="scrapbook-response-grid">
        {responses.map((response, index) => (
          <div className="scrapbook-response-card" key={`${response.speaker}-${index}`}>
            <span>{response.speaker}</span>
            <p>{response.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function WaveFourResultCard({ entry }) {
  if (entry.type === 'photo') {
    return (
      <>
        <div className="scrapbook-headline">
          <strong>{entry.title}</strong>
          <p>{entry.summary}</p>
        </div>
        <div className="scrapbook-prompt">
          <span>Photo prompt</span>
          <p>{entry.payload?.prompt}</p>
        </div>
        {entry.payload?.imageDataUrl && (
          <img
            alt="Shared Photo Flashback"
            className="scrapbook-photo-flashback"
            src={entry.payload.imageDataUrl}
          />
        )}
        <div className="scrapbook-response-grid">
          {(entry.payload?.captions || []).map((caption, index) => (
            <div className="scrapbook-response-card" key={`${caption.playerIndex}-${index}`}>
              <span>{caption.label || `Caption ${index + 1}`}</span>
              <p>{caption.text}</p>
            </div>
          ))}
        </div>
      </>
    )
  }

  const succeeded = Boolean(entry.payload?.succeeded)
  return (
    <>
      <div className="scrapbook-headline">
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
      </div>
      <div className={`scrapbook-match-banner${succeeded ? ' matched' : ''}`}>
        <span>{succeeded ? 'Boast proved' : 'Bluff caught'}</span>
        <strong>{entry.payload?.bid || 0} promised</strong>
      </div>
      <div className="scrapbook-prompt">
        <span>Category</span>
        <p>{entry.payload?.topic}</p>
      </div>
      <div className="scrapbook-bluff-answers">
        {(entry.payload?.answers || []).map((answer, index) => (
          <span key={`${answer}-${index}`}>{answer}</span>
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

function ScrapbookEntry({ entry, index, vaultRevealed }) {
  let body = <DefaultEntryCard entry={entry} />

  if (entry.type === 'duel') {
    body = <DuelEntryCard entry={entry} />
  } else if (entry.type === 'keepsake') {
    body = <KeepsakeEntryCard entry={entry} />
  } else if (entry.type === 'finale') {
    body = <FinaleEntryCard entry={entry} />
  } else if (entry.type === 'match' || entry.type === 'prediction') {
    body = <ChoiceRevealCard entry={entry} />
  } else if (entry.type === 'vault') {
    body = <VaultEntryCard entry={entry} revealed={vaultRevealed} />
  } else if (
    entry.type === 'vibe-sync' ||
    entry.type === 'tempo' ||
    entry.type === 'word'
  ) {
    body = <WaveTwoResultCard entry={entry} />
  } else if (
    entry.type === 'maze' ||
    entry.type === 'canvas' ||
    entry.type === 'harmonic'
  ) {
    body = <CooperativeResultCard entry={entry} />
  } else if (entry.type === 'bluff' || entry.type === 'photo') {
    body = <WaveFourResultCard entry={entry} />
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

  const finaleSessionIds = new Set(
    entries
      .filter((entry) => entry.type === 'finale' && entry.sessionId)
      .map((entry) => entry.sessionId),
  )

  return (
    <div className="journal-timeline scrapbook-flow">
      {entries.map((entry, index) => (
        <ScrapbookEntry
          entry={entry}
          index={index}
          key={entry.id}
          vaultRevealed={
            entry.type === 'vault' &&
            Boolean(entry.sessionId) &&
            finaleSessionIds.has(entry.sessionId)
          }
        />
      ))}
    </div>
  )
}

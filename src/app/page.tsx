import { Card, cards } from '@/resources'

function normalizeWord (word: string) {
  return word
    .trim()
    .toLowerCase()
    .replace(/^(the|to|a|an)\s+/, '')
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMatchRegex(front: string) {
  const normalized = normalizeWord(front)
  const parts = normalized.split(/\s+/).filter(Boolean).map(escapeRegExp)
  if (parts.length === 0) return null

  const suffix = '\\w*'
  let pattern: string

  if (parts.length === 1) {
    pattern = `\\b${parts[0]}${suffix}\\b`
  } else {
    const head = parts.slice(0, -1).join('\\s+')
    const last = parts[parts.length - 1]
    pattern = `\\b${head}\\s+${last}${suffix}\\b`
  }
  // console.log('Pattern:', pattern)

  return new RegExp(pattern, 'iu');
}

function decorateHint ({ front, hint }: Card) {
  const regex = buildMatchRegex(front)
  if (!regex) return hint;

  const match = regex.exec(hint)
  if (!match) return hint

  const startIndex = match.index // can be 0
  const matchedText = match[0]
  const endIndex = startIndex + matchedText.length

  const before = hint.substring(0, startIndex)
  const after = hint.substring(endIndex)

  return (
    <span>
      {before}
      <b className="text-amber-400">{matchedText}</b>
      {after}
    </span>
  )
}

export default function Home () {
  return (
    <div
      className="font-sans w-full flex items-center justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-2">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <h1 className="text-white text-3xl text-center w-full">Hints</h1>

        <div className="flex flex-col gap-[32px] items-center p-8 w-full">
          {cards.map((card: Card) => (
            <div key={card.id} className="text-white flex items-center w-full justify-between">
              <div>
                {card.front}
              </div>
              <div>
                {decorateHint(card)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

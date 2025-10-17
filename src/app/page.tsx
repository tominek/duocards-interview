import { Card, cards } from '@/resources'

type LangConfig = {
  members: string[]
  allowPrefixes: boolean
}

function normalizeWord (word: string, members: string[]) {
  const regexp = new RegExp(`^(${members.join('|')})\\s+`, 'g')

  return word
    .trim()
    .toLowerCase()
    .replace(regexp, '')
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMatchRegex (front: string, config: LangConfig) {
  const normalized = normalizeWord(front, config.members)
  const parts = normalized.split(/\s+/).filter(Boolean).map(escapeRegExp)
  if (parts.length === 0) return null

  // Use Unicode letter/number marks instead of \w to properly match letters like ř, é, etc.
  const unicodeChars = '[\\p{L}\\p{M}\\p{N}_]'
  const suffix = `${unicodeChars}*`
  const wb = `(?<!${unicodeChars})` // Unicode-aware "word boundary" start
  const we = `(?!${unicodeChars})`  // Unicode-aware "word boundary" end

  let pattern: string

  const optionalPrefix = config.allowPrefixes ? `${unicodeChars}*` : ''
  if (parts.length === 1) {
    // If allowPrefixes is true, allow any alphabetic prefix before the first token (e.g., přejít for jít)
    pattern = `${wb}${optionalPrefix}${parts[0]}${suffix}${we}`
  } else {
    const head = parts.slice(0, -1).join('\\s+')
    const last = parts[parts.length - 1]
    // For multi-word, only allow prefixing on the very first token when enabled
    pattern = `${wb}${optionalPrefix}${head}\\s+${last}${suffix}${we}`
  }
  // console.log('Pattern:', pattern)

  return new RegExp(pattern, 'iu');
}

function decorateHint ({ front, hint }: Card, config: LangConfig) {
  const regex = buildMatchRegex(front, config)
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
  // EN
  // const config: LangConfig = {
  //   members: ['the', 'to', 'a', 'an'],
  //   allowPrefixes: false
  // }
  // CZ
  const config: LangConfig = {
    members: [],
    allowPrefixes: true
  }

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
                {decorateHint(card, config)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

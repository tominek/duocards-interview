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
  // allow decoration when hint contains a word that starts with front,
  // e.g. front: "bad" matches "bad", "badly", "badness"
  // match at word boundaries; preserve internal spaces in multi-word fronts
  // e.g. "contingency plan" should match "contingency plan" and "contingency plans"

  // const parts = normalizeFront(front).split(/\s+/).filter(Boolean).map(escapeRegExp);
  // if (parts.length === 0) return null;
  //
  // // Build a pattern that matches:
  // // - the exact multi-word phrase
  // // - optional word suffix on the last token (e.g., "plan" -> "plans", "planned" won't match as a single word suffix if space follows)
  // // For single-word fronts: allow suffix on that single word.
  // const last = parts[parts.length - 1];
  // const head = parts.slice(0, -1).join('\\s+');
  // const suffix = '[a-z]*'; // simple suffix allowance (ASCII letters)
  //
  // let pattern: string;
  // if (parts.length === 1) {
  //   pattern = `\\b${last}${suffix}\\b`;
  // } else {
  //   // Require earlier words with word boundaries, allow normal whitespace between them.
  //   // Allow suffix only on the last word.
  //   pattern = `\\b${head}\\s+${last}${suffix}\\b`;
  // }
  const pattern = `\\b${escapeRegExp(normalizeWord(front))}[a-z]*\\b`
  console.log('Pattern:', pattern)


  // Case-insensitive
  return new RegExp(pattern, 'i');
}

function decorateHint ({ front, hint }: Card) {
  // Find the front within the hint and replace with the front within <b> element
  const normalizedFront = normalizeWord(front)
  const regex = buildMatchRegex(normalizedFront)
  if (!regex) return hint;

  const match = regex.exec(hint)

  const startIndex = match?.index
  if (!startIndex) return hint;

  const matchedWords = match
  console.log(matchedWords)
  const endIndex = startIndex + matchedWords.length

  const before = hint.substring(0, startIndex)
  const after = hint.substring(endIndex)

  return (<span>{before} <b className="text-amber-400">{matchedWords}</b>{after}</span>)
}

export default function Home () {
  return (
    <div
      className="font-sans w-full flex items-center justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-2">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <h1 className="text-white text-3xl text-center w-full">Hints</h1>
        {/*List of hints*/}
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

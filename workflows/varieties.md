# Regional English Varieties Workflow

## Objective
Expose vocabulary differences across UK, US, and Australian English in formal, everyday, and slang registers.

## Tracks
- **UK (British English)** 🇬🇧 — primary focus, target for professional use
- **US (American English)** 🇺🇸 — common in global professional contexts
- **Australian English** 🇦🇺 — useful for awareness and comparison
- **General English** 🌐 — pan-variety terms, international standard

## Categories
- **Formal** — professional emails, academic writing, presentations
- **Everyday** — conversation, shopping, transport, social situations
- **Slang** — colloquial, informal; labelled with register note

## Content Generation
GET `/api/varieties?variety=uk&category=everyday`:
- Calls `generateVarietyContent()` via OpenRouter
- Returns 8 items per call
- Each item: word, definition, example, register_note, equivalents (cross-variety)
- Content is generated fresh per request (no DB cache) — suitable for personal use

## Refresh Behaviour
- User can trigger a new set by clicking "Load new examples"
- Each refresh calls OpenRouter with the same variety/category params
- Temperature 0.6 ensures variety in results

## Register Notes
Each entry includes a `register_note` explaining:
- When it's appropriate to use (e.g., "Use in formal written correspondence only")
- When to avoid it (e.g., "Too informal for professional emails")
- Regional appropriateness (e.g., "Common in UK; may confuse American colleagues")

## Known Constraints
- OpenRouter returns JSON object; array is extracted from the response
- Malformed responses fall back to empty array — no error shown to user
- No progress tracking for variety content (enhancement: mark words as learned)

# Writing & Spelling Test Workflow

## Objective
Run a timed writing session, collect output, and return AI analysis.

## Session Flow
1. User selects duration: 3 or 5 minutes
2. Daily prompt is fetched from `/api/prompt` (cached in DB by date)
3. Session timer counts down
4. User writes in split UI: committed text (gray, scroll area) + active textarea
5. Pressing Enter twice commits the current paragraph to the committed area
6. Timer expires → session auto-submits
7. Session saved to `sessions` table via POST `/api/sessions`
8. Analysis triggered via POST `/api/analyze`
9. Micro-lesson check triggered via POST `/api/lessons` (background)

## Committed Text UX
- Once a paragraph is committed (Enter+Enter), it moves to the committed display and is no longer editable
- If character count drops more than 10 below the peak, a backtrack warning is shown
- Users should be encouraged to keep moving forward

## Analysis Output
- Spelling errors (UK English standard)
- Grammar issues (type-labelled)
- Word choice notes
- Structure feedback (2–3 sentences)
- Strengths list
- Score 0–100 (70 = solid intermediate)
- Suggested vocabulary (3–5 intermediate words)

## Error Persistence
- Each spelling error increments `word_list.error_count`
- Each error inserted into `word_errors` table
- Micro-lesson triggers at 3+ occurrences of the same error pattern

## Known Constraints
- OpenRouter model: `google/gemini-flash-1.5` — JSON mode enabled
- Prompt format returns `json_object` — validate before saving
- Daily prompt is deterministic based on date; no AI call needed each time

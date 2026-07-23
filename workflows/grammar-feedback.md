# Grammar Feedback & Micro-Lessons Workflow

## Objective
Track recurring grammar and spelling patterns; generate targeted micro-lessons when a mistake appears 3+ times.

## Trigger Logic
POST `/api/lessons` is called after each writing session. It:
1. Queries `word_errors` grouped by `(error_type, word)` with COUNT >= 3
2. For each pattern without an existing lesson, calls `generateMicroLesson()` via OpenRouter
3. Inserts the lesson into `micro_lessons` table
4. If a lesson already exists for that pattern, increments `trigger_count`

## Lesson Structure
```json
{
  "title": "...",
  "explanation": "...",
  "examples": [{"wrong": "...", "correct": "...", "note": "..."}],
  "tip": "...",
  "practice": "..."
}
```

## Display
- Lessons shown on `/grammar` page, ordered by trigger_count DESC
- User can expand/collapse each lesson
- Dismiss marks `dismissed = 1`; dismissed lessons are hidden

## Adaptation Logic
- High-frequency errors (5+) get `trigger_count` incremented but no duplicate lesson
- If the same error type has multiple words (e.g., multiple spelling errors), each gets its own lesson
- Focus shifts to weaker areas automatically by sorting on trigger_count

## Known Constraints
- OpenRouter JSON mode required; malformed responses fall back to empty lesson
- Lessons are permanent unless dismissed; reinstatement is not supported

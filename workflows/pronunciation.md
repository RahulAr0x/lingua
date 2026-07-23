# Pronunciation Module Workflow

## Objective
Guide the user through UK English phonemes from foundational to advanced. Track practice attempts per phoneme.

## Phoneme Lists
Defined in `/app/api/pronunciation/route.ts`:
- **Foundational**: Core vowel and diphthong sounds (17 items)
- **Intermediate**: Consonant clusters, linking sounds, weak forms, stress patterns (11 items)
- **Advanced**: Glottal stop, vowel reduction, rhythm, intonation, connected speech (7 items)

## Lesson Generation
POST `/api/pronunciation` with `{ phoneme, level }`:
- Calls `getPronunciationLesson()` via OpenRouter
- Returns: IPA symbol, description, examples with IPA, tips for non-native speakers, minimal pairs, UK/US comparison note

## Progress Tracking
PATCH `/api/pronunciation` with `{ phoneme, level, correct: boolean }`:
- Inserts or updates `pronunciation_progress` table
- Tracks: total attempts, correct attempts, last_practiced date

## Audio Note
Audio input is not currently supported via OpenRouter's text API. The module is structured so that audio can be added later by:
1. Adding a `Record` button per phoneme
2. POSTing audio to a new `/api/pronunciation/audio` route
3. Using a model that supports audio (e.g., Gemini 1.5 Pro via Google AI SDK)

## Display Priority
- Foundational first — these are the UK-specific distinctions most non-native speakers miss
- Within each level, phonemes with fewer attempts or lower accuracy surface first (future enhancement)
- UK/US differences highlighted where relevant (e.g., /ɑː/ in "bath" — UK vs. /æ/ in US)

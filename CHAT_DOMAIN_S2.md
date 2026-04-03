# Sprint 2 Chat Domain Design (S2-01)

## Domain Entities
1. `ChatParticipant`
   - `id`
   - `name`
   - `role` (`explorer` | `guide`)
   - `avatarInitial`
2. `ChatThreadSummary`
   - `id`
   - `title`
   - `explorer`
   - `guide`
   - `lastMessagePreview`
   - `lastMessageAt`
   - `status` (`open` | `awaiting_reply` | `scheduled`)
3. `ChatMessage`
   - `id`
   - `threadId`
   - `senderRole` (`explorer` | `guide`)
   - `body`
   - `sentAt`
4. `ChatThread`
   - `summary`
   - `messages`

## State Model (MVP)
1. Thread states
   - `open`: active conversation
   - `awaiting_reply`: one side waiting for response
   - `scheduled`: conversation converted to planned activity
2. Message flow
   - append-only timeline for MVP
   - newest messages appear lower in thread view

## Route Contracts
1. `/chat`
   - renders `ChatThreadSummary[]`
   - supports navigation to `/chat/[threadId]`
2. `/chat/[threadId]`
   - renders `ChatThread`
   - includes composer shell for upcoming realtime send action

## Notes for Sprint 3
1. Attach offer cards and conversion states to `ChatThread`
2. Add read state, delivery state, and presence metadata

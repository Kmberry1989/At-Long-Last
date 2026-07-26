# Firestore rules analysis (working file)

Target: `projects/at-long-last/databases/(default)` (Standard edition, native
mode).

## Active collections and queries

- `profiles/{uid}`: owner-only document listener and merge writes. Contains PII
  (`email`), so no cross-user reads are legitimate.
- `playerCouples/{uid}`: owner-only listener, create/update/delete. The link must
  resolve to a couple that contains the same UID after the write.
- `coupleInvites/{inviteCode}`: authenticated exact-document lookup by six
  character code, create during room creation, delete when the last participant
  leaves. Collection listing is not required.
- `couples/{coupleId}`: participant document listener and lifecycle writes.
  Creation is linked atomically to an invite, player link, and open lobby.
  Legitimate updates are a tightly constrained join, leave, preset selection,
  active-session attach/detach, or one bounded board reward.
- `publicLobbies/{coupleId}`: authenticated ordered list by `updatedAt`, exact
  document lookup, create/delete during room lifecycle. A valid join deletes the
  lobby in the same transaction that adds the second participant.
- `lobbyMessages/{messageId}`: authenticated ordered list by `createdAt`;
  immutable create-only messages scoped to an existing open lobby.
- `sessions/{sessionId}`: participant document listener. Creation is atomic
  with the couple's `activeSessionId`; identity and creation fields are
  immutable. Active sessions may become completed or abandoned, but terminal
  sessions cannot be reopened.
- `activities/{activityId}`: participant document listener. Create in
  `in_progress`, then update state or resolve once to `completed`/`skipped`.
- `journalEntries/{entryId}`: participant query by `coupleId`, ordered by
  `createdAt`; immutable create-only records.

## Critical transactions

1. Create room: create `couples`, `coupleInvites`, `playerCouples`, and
   `publicLobbies` with matching couple ID, invite code, host UID, and share
   link.
2. Join room: update waiting couple to exactly two players, create/update the
   joiner's `playerCouples` link, and delete the matching open lobby.
3. Leave room: delete the caller's link; either delete all room artifacts when
   the last participant leaves or reduce the couple to one participant and
   recreate its open lobby.
4. Start session: create an initial session and attach its ID to the couple in
   one transaction.
5. Abandon session: mark the active session abandoned and clear the matching
   couple pointer in one transaction.

## Adversarial cases to cover

- Unauthenticated reads and invite enumeration.
- Reading or mutating another couple.
- Self-linking to a couple that does not contain the caller.
- Adding a third player, replacing the host, changing invite identity, or
  changing lifecycle fields through a generic participant update.
- Attaching an arbitrary session ID or detaching a still-active session.
- Changing immutable session identity/creation fields, reopening a terminal
  session, or writing oversized strings/schema-pollution fields.
- Mutating another participant's duel result through the per-player result
  submission path.


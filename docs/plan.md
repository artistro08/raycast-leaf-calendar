# Leaf Calendar for Raycast — Plan

Status: self-approved 2026-10-13 (owner away; built against `docs/api.md` from leaf-calendar PR #31, API version 1).

## Goal

A Windows-only Raycast extension that reads and acts on your calendar through Leaf Calendar's local JSON-RPC API over `\\.\pipe\leaf-calendar-<user>`.

## Commands

| Command | Mode | What it does | API |
| --- | --- | --- | --- |
| My Agenda | view | Events for the next N days, grouped by day, calendar filter dropdown, details, join, edit, delete, open in Leaf Calendar | `calendars.list`, `events.list`, `events.get`, `events.update`, `events.delete`, `meetings.join`, `app.showEvent`, `app.showDay` |
| Create Event | view | Form: title, calendar (Leaf Calendar's default preselected), all-day, start, duration, location, description, guests, notify guests; closes Raycast when created | `calendars.list`, `events.create` |
| Join Next Meeting | no-view | Joins the meeting Leaf Calendar's join shortcut would pick | `meetings.join` |
| Find a Time to Meet | view | Free times for 14 days in slots (preference), custom times, optional booking link in the search bar, select times, Copy & Save with title, guests, message | `availability.free`, `scheduling.links`, `shares.create` |
| Scheduled Windows | view | Saved groups: book a time (event, or a booking on the link) or delete them | `shares.list`, `shares.book`, `shares.delete` |

`leaf.hello` is sent first on every connection with the extension icon (256 px PNG, under 64 KB) and a `raycast://` return link, so the approval window shows Leaf Calendar's icon and sends the person back. A no-view command returns to My Agenda instead of itself, since Leaf Calendar opens the link after Allow and would run it again.

Revised 2026-10-13 with the owner: start + duration on Create Event, scheduling without Cal.com through Leaf Calendar's share flow (new API in leaf-calendar PR #32), and delete.

## Shortcuts

Raycast's `Keyboard.Shortcut.Common` everywhere one fits:

- Enter: primary (Show Details / Copy Booking Link / Submit)
- Ctrl+Enter: secondary (Join Meeting, or Open in Leaf Calendar)
- `Common.Open`: Open in Leaf Calendar
- `Common.Edit`: Move Event
- `Common.New`: Create Event
- `Common.Refresh`: Refresh
- `Common.Copy`: Copy Meeting Link / Copy Booking Link
- `Common.CopyName`: Copy Title
- `Common.OpenWith`: Open Day in Leaf Calendar

## Design

- `src/lib/rpc.ts`: pipe client. One connection per command run, `leaf.hello` first, requests matched by id, 75 s timeout for the first request (approval waits up to 60 s), 30 s after. Errors become `LeafError` with `data.code` or a transport code (`not_running`).
- `src/lib/time.ts`: local ISO with offset, all-day date math (exclusive ends), day grouping, formatting.
- `src/lib/text.ts`: Markdown escaping (titles, descriptions and guest names are untrusted), guest parsing.
- `src/lib/leaf.ts`: Raycast glue: preferences, icon, friendly error toasts.
- Pure modules never import `@raycast/api`, so Vitest runs them without Raycast.

## Tests (Vitest)

- `rpc.test.ts` against a fake Leaf Calendar pipe server: hello first, id matching, order, JSON-RPC errors and `data.code`, not running, timeout, closed connection mid-request, unknown params never sent as `undefined`.
- `time.test.ts`: offsets incl. half-hour zones via fixed dates, all-day exclusive end, grouping of multi-day/ongoing events, mixed date/time refused.
- `text.test.ts`: Markdown escaping kills images/links/HTML, guest parsing and validation.

## Out of scope

- Live tests in CI: Leaf Calendar asks the person to approve the connecting app, so live checks run by hand from inside Raycast. Verified 2026-10-13 against Leaf Calendar 0.1.307.808: 24 checks across every method, all passing.
- macOS (no named pipe there).
- AI tools and menu bar commands.

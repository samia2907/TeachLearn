# Manual program entry points (not deployed)

`src/access/programFlow.mjs` defaults manual access mode on. Set `VITE_MANUAL_ACCESS_MODE=false` and rebuild to restore retained Plans/Checkout entry points; no access model redesign is required. This is a navigation flag, not an authorization mechanism.

The student and teacher marketplace shares `programDestination`: paid programs without full access lead to `/programs/:programId/access`; free or entitled programs open normally. The access page retains previews and partial access through the program overview, uses the existing request callable with duplicate prevention, and reads the existing centralized WhatsApp setting. Messages include name, email, program and a pricing inquiry in English, Arabic and Hebrew.

While manual mode is on, `/plans` leads to `/programs`. Retained `/checkout` links resolve a query/pending program through the server access checker and lead to that program or its access page; links with no identifiable program return to the catalog. Paddle is not initialized in this mode. Payment code, purchases, subscriptions and grants are not deleted or modified.

The owner content page previously labeled every document in the lessons collection as LESSON and displayed the stored mixed order as a lesson number. It now groups records using the shared compatibility type helper and derives display lesson numbers only from actual lessons. Reorder controls operate within the same content type. Existing document order and content were not changed. Learner program navigation uses the same lesson-only numbering and labels standalone missions as missions. Locked catalog metadata includes only the safe inferred contentType, without exposing content.

Last read-only inventory: affected program has 12 real lessons and 6 missions. No migration or parent mapping changes were made. No new routes were added. Live deployment remains pending.

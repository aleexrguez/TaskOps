# TaskOps — Video Showcase Script

**Format:** Product showcase (no narration, no tutorial pauses)
**Target duration:** 28-32 seconds
**Aspect ratio:** 16:9, 1920x1080 minimum (1440p preferred)
**Export:** MP4, H.264, 60fps for smooth UI motion

---

## Pre-Recording Setup

**Browser state:**
- Use Chrome or Arc in a clean profile (no extensions visible in toolbar)
- Hide bookmarks bar
- Set zoom to 100% — do not scale the UI
- Load sample data in advance: at least 12 tasks across 3 statuses, 2-3 recurrence rules, a task with a full checklist and 2-3 activity entries

**System:**
- Close all unrelated windows and notifications
- Enable Do Not Disturb
- Use a wired mouse for precise drag operations — no trackpad jitter on the kanban drag shot

**Sample data recommendations:**
- Task titles should be realistic and varied (mix of short and multi-word)
- Use a mix of priorities and due dates so filter badges are visible
- Have at least one overdue task so the countdown badge shows
- Dark mode should be the final toggle — record the last shot with it already on or do a real-time toggle

---

## Shot-by-Shot Breakdown

### Shot 1 — Title Card (0:00 - 0:03)
**Duration:** 3 seconds
**Content:** Static card, dark background

```
TaskOps
Full-stack task manager — built from scratch
```

**Notes:**
- Centered text, clean sans-serif font
- No animation needed — keep it still and confident
- Fade in from black (0.3s), hold, cut to Shot 2

**Transition to Shot 2:** Hard cut

---

### Shot 2 — Inbox Capture (0:03 - 0:07)
**Duration:** 4 seconds
**Action:**
1. App is open on the task list view (inbox/all tasks)
2. Click the "New Task" button or quick-add input
3. Type a task title fast (pre-type if needed, show the filled state)
4. Hit Enter — task appears in the list with a subtle animation

**Focus:** The speed of capture. Show the task land in the list.

**Transition to Shot 3:** Hard cut

---

### Shot 3 — Task List with Filters (0:07 - 0:10)
**Duration:** 3 seconds
**Action:**
1. Task list is visible with several tasks
2. Click a filter (e.g., "High Priority" or a status tab)
3. List animates to filtered results — show 2-4 tasks remaining
4. Pause 0.5s on the filtered state

**Focus:** Show filter badges, task cards with priority indicators and due date countdowns.

**Transition to Shot 4:** Crossfade (0.2s)

---

### Shot 4 — Board View Drag and Drop (0:10 - 0:15)
**Duration:** 5 seconds
**Action:**
1. Switch to board/kanban view — show the view toggle click
2. Three columns visible (To Do, In Progress, Done)
3. Grab a task card from "To Do", drag it to "In Progress" with a visible hover state
4. Drop — card snaps into place

**Focus:** Smooth drag animation is the hero of this shot. Rehearse it. The grab, travel, and drop should feel effortless.

**Notes:** If the drag produces a ghost/overlay card, make sure it is visible in the recording area. Slow your mouse movement slightly — fast drags look jittery on video.

**Transition to Shot 5:** Hard cut

---

### Shot 5 — Task Detail: Checklist and Activity (0:15 - 0:18)
**Duration:** 3 seconds
**Action:**
1. Click a task card to open the detail panel or modal
2. Scroll slightly to show the checklist — check one item
3. Pan down or hold to show the activity feed (at least 2 entries)

**Focus:** Depth of the task detail. The checklist check should produce a visible tick animation.

**Notes:** Pre-populate the checklist with 3-4 items, 2 already checked. The activity feed should show real entries (status change, comment).

**Transition to Shot 6:** Hard cut

---

### Shot 6 — Recurrences Grouped View (0:18 - 0:21)
**Duration:** 3 seconds
**Action:**
1. Navigate to the Recurrences section via sidebar
2. Show the grouped list — rules visible with frequency labels (Daily, Weekly, Monthly)
3. Expand one group or hover over a rule to show generated instances

**Focus:** The concept of recurring tasks as a first-class domain — not just a checkbox.

**Transition to Shot 7:** Crossfade (0.2s)

---

### Shot 7 — Dark Mode Toggle (0:21 - 0:24)
**Duration:** 3 seconds
**Action:**
1. Navigate to Settings (sidebar click)
2. Click the dark/light mode toggle
3. The entire UI transitions smoothly to dark mode

**Focus:** The theme transition should be smooth. If the transition is instant, add a CSS transition in advance and verify it records well.

**Notes:** End on dark mode — it photographs and screens better for thumbnails and social sharing.

**Transition to Shot 8:** Crossfade (0.3s)

---

### Shot 8 — Tech Stack Overlay (0:24 - 0:29)
**Duration:** 5 seconds
**Content:** Dark card or overlay on top of the dark-mode app (blurred or dimmed in background)

```
React 19   TypeScript   Supabase
Tailwind CSS 4   Vitest   PWA   i18n
```

**Notes:**
- Arrange as two rows, centered
- Use the official wordmarks or simple text — no logos if you are unsure of licensing
- Fade in each row with a 0.1s stagger (optional, keep it subtle)
- Do not add logos that distract — clean text is fine

**Transition to Shot 9:** Hard cut

---

### Shot 9 — Close / Call to Action (0:29 - 0:33)
**Duration:** 4 seconds
**Content:** Static card, dark background

```
Live demo
taskops-project.vercel.app

Source code
github.com/aleexrguez/TaskOps
```

**Notes:**
- Keep URL text readable — large enough to read in a LinkedIn preview at 50% size
- Fade out to black (0.4s) at the end

---

## Transitions Summary

| From | To | Transition | Duration |
|------|----|-----------|---------|
| Title card | Inbox capture | Hard cut | — |
| Inbox capture | Task list filters | Hard cut | — |
| Task list filters | Board drag | Crossfade | 0.2s |
| Board drag | Task detail | Hard cut | — |
| Task detail | Recurrences | Hard cut | — |
| Recurrences | Dark mode toggle | Crossfade | 0.2s |
| Dark mode toggle | Tech stack overlay | Crossfade | 0.3s |
| Tech stack overlay | Close card | Hard cut | — |
| Close card | Black | Fade out | 0.4s |

---

## Music and Mood

**Mood:** Focused, confident, forward-moving. Not aggressive, not corporate elevator music.

**Style:** Minimal electronic or lo-fi instrumental. A single clean melodic line over a steady beat works well. No vocals — vocals compete with reading the UI.

**Tempo:** 100-120 BPM. Matches the pace of fast cuts without feeling rushed.

**Sources (royalty-free):**
- Pixabay Music (pixabay.com/music) — filter by "Corporate" or "Electronic", pick tracks under 1 minute
- Uppbeat (uppbeat.io) — free tier has suitable options
- YouTube Audio Library — filter "Upbeat", "Electronic"

**Tip:** Start the music at the title card and let it run. Fade audio out in the last 2 seconds of the close card. Total music duration needed: ~30 seconds.

---

## Recording Tool Recommendations

| Tool | Platform | Notes |
|------|----------|-------|
| OBS Studio | Win/Mac/Linux | Free, reliable, 60fps, no watermark |
| Cleanshot X | Mac only | Built-in trim and annotation |
| Loom | Win/Mac | Quick export, but adds branding on free tier |
| ScreenFlow | Mac only | Best timeline editing for this type of video |

**Editing:** Even a basic tool (iMovie, DaVinci Resolve free tier, CapCut desktop) is enough. You only need: trim, cuts, crossfades, text overlay, and audio fade.

---

## Thumbnail Frame

Capture a still from Shot 4 (board view with a card mid-drag) as the LinkedIn video thumbnail. It is the most visually dynamic frame and communicates "this is a real app" at a glance.

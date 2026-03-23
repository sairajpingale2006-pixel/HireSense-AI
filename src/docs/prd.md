# Requirements Document

## 1. Application Overview

- **Application Name:** HireSense AI
- **Description:** A cinematic, futuristic AI-powered virtual HR web application optimized for Android and mobile devices, delivering a native-app-like experience that is fast, responsive, touch-friendly, and operable with one hand. The platform supports two access modes — Guest Mode and Google Sign-In — allowing users to quickly try the system or sign in for a personalized experience with saved history. The platform simulates real-time AI analysis of facial expressions, voice, and body language during mock interviews, delivering immersive visual feedback and performance analytics through a dark, holographic UI. The system supports resume-based dynamic questioning, student branch selection, emotion detection, adaptive follow-up questions, and a progress tracking dashboard (for signed-in users only) with session comparison and full history management including the ability to delete individual or all interview records. All scoring logic is governed by strict data validation rules — scores are only computed when sufficient, valid data is present; otherwise, the system surfaces clear warnings, contextual suggestions, and retry options. The UI is built mobile-first with a single-column layout, bottom navigation bar, thumb-friendly controls, and automatic detection of mobile screen widths to disable heavy effects on low-end devices.

---

## 2. Users & Use Cases

### 2.1 Target Users
- Students preparing for technical and HR interviews (AIML, CS, IT branches)
- Job seekers seeking AI-assisted mock interview practice on Android and mobile devices
- HR professionals evaluating candidates via mobile

### 2.2 Core Use Cases
- A new visitor lands on the Auth Screen (fully visible within the viewport) and chooses to continue as a Guest or sign in with Google
- A guest user accesses all interview features (branch selection, resume upload, interview, results) without any data being saved; the Dashboard tab is hidden from the bottom navigation bar
- A signed-in user completes an interview, has their results saved and linked to their account, and can access the Dashboard to compare sessions
- A returning signed-in user is automatically kept signed in on refresh and can view their progress history
- A signed-in user deletes a single interview record from the Dashboard via a trash icon and confirmation popup
- A signed-in user clears all interview history via the 「Clear All History」 button and confirmation warning popup
- A guest user who attempts to access history sees a prompt to sign in

---

## 3. Page Structure & Core Features

### 3.1 Page Overview

```
HireSense AI
├── Auth Screen (Guest Mode + Google Sign-In)
├── Landing Page (Hero + Branch Selection + Resume Upload + CTA)
├── Interview Page (Camera Feed + HUD + Real-Time AI Analysis)
├── Result Page (Score Dashboard + Suggestions + Emotion Summary + Warning Banners)
└── Dashboard Page (History + Progress Comparison + History Management) [Signed-In Users Only]
```

### 3.2 Global Layout & Responsive Rules

**Mobile-First Layout**
- All pages use a single-column layout by default
- Reduced padding and margins on screens narrower than 768px to maximize usable space
- No horizontal scrolling permitted on any page; all sections fit within screen width
- Side-by-side layouts are replaced with vertical stacking on mobile
- Smooth vertical scrolling throughout; snap-to-section behavior applied where appropriate
- Nested scroll areas are avoided to prevent conflicting scroll interactions

**Device Detection**
- Screen width below 768px is treated as mobile
- On mobile detection:
  - Mobile single-column layout is automatically activated
  - Heavy 3D effects, complex particle systems, and parallax animations are automatically disabled
  - Lightweight CSS-based animations replace JS-driven heavy animations
  - Particle count is reduced; parallax is disabled
- Sections not in the current viewport are lazy-loaded to improve initial load performance

**Typography**
- Title text: 24–32px, bold, neon-lit
- Body text: 14–16px
- All font sizes use scalable units (rem or clamp) to ensure readability on small screens

**Performance**
- Animation complexity is reduced on mobile
- Heavy 3D effects are disabled on low-end or mobile devices
- CSS animations are preferred over JS-driven animations wherever possible
- requestAnimationFrame-based animations (waveform, 3D) are paused or simplified when not in view

### 3.3 Bottom Navigation Bar (Mobile)

- Replaces the top navbar on screens narrower than 768px
- Fixed (sticky) at the bottom of the viewport at all times
- Contains the following tabs with icon + label:
  - Home (navigates to Landing Page)
  - Interview (navigates to Interview Page)
  - Results (navigates to Result Page)
  - Dashboard (navigates to Dashboard Page) — visible only for signed-in users; hidden for guest users
- Active tab is highlighted with a neon accent color
- For guest users: 「Upgrade to Sign In」 prompt is displayed within the bottom bar or as a persistent banner above it, linking to the Auth Screen
- For signed-in users: profile avatar and 「Sign Out」 option are accessible via a tap on the avatar icon or a slide-up sheet; on sign-out, session is cleared and user is returned to the Auth Screen

**Desktop Navigation Bar (≥768px)**
- Standard top navbar is retained on desktop
- Behavior unchanged from original specification

### 3.4 Auth Screen

**Layout & Visual Design**
- Full-viewport dark background consistent with the cinematic theme (neon blue and purple gradient overlays, lightweight CSS particle animation)
- The entire Auth Screen content (title, options, labels) fits within the viewport without scrolling on mobile
- Centered glassmorphism card presenting the two access options
- Application title 「HireSense AI」 displayed prominently above the options
- Smooth transition animation from Auth Screen to Landing Page on selection

**Option 1: Continue as Guest**
- A clearly labeled button: 「Continue as Guest」 — minimum height 48px, full-width on mobile
- Subtle label displayed below the button: 「Guest mode – history will not be saved」
- On click: user is taken directly to the Landing Page without any authentication
- Guest session is maintained while the app is open; no persistence on refresh
- Guest users have access to: Interview Page, AI analysis, Result Page
- Guest users do NOT have access to: Dashboard Page
- No interview data is stored for guest users

**Option 2: Sign in with Google**
- A clearly labeled button: 「Sign in with Google」 with Google branding — minimum height 48px, full-width on mobile
- Implemented via OSS Google Sign-In
- On successful sign-in:
  - Store user profile: name, email, profile photo
  - User is taken to the Landing Page
  - Session is persisted so the user remains signed in on page refresh
- On sign-in failure: display an inline error message and allow retry
- Adequate spacing between the two buttons to prevent accidental taps

### 3.5 Landing Page

**Layout & Visual Design**
- Full-viewport dark background with neon blue and purple gradient overlays
- Background animation: lightweight CSS-driven flowing data stream particles on mobile; JS particle system on desktop
- Glassmorphism-style hero card centered on screen, full-width on mobile with reduced horizontal padding

**3D AI Brain Visualization**
- On desktop (≥768px): Central 3D neural network / AI brain animation rendered using Three.js or @react-three/fiber with floating data particles, animated connection lines, parallax camera movement responding to mouse position, glowing edges and depth shadows
- On mobile (<768px): 3D rendering is replaced with a lightweight 2D CSS/SVG animated neural network illustration to avoid performance lag; parallax effect is disabled
- If WebGL is not supported on any device: gracefully fall back to a static 2D animated background; no crash or blank screen
- Low-poly geometry, instanced meshes, and frame-rate throttling applied on desktop 3D rendering

**Hero Content**
- Title: 「HireSense AI」 — 24–32px on mobile, large on desktop; bold, neon-lit typography
- Tagline: 「Your AI-powered virtual HR for real-time interview evaluation」 — 14–16px on mobile

**Student Mode — Branch Selection**
- Displayed below the tagline as a vertically stacked card group on mobile; segmented selector on desktop
- Options: AIML / CS / IT
- Selected branch is highlighted with a neon glow border
- Each option has a minimum tap target height of 48px
- Branch selection determines the question pool used during the interview session

**Resume Upload (Optional)**
- A clearly labeled upload zone below the branch selector: 「Upload Resume (PDF or text) — Optional」
- Full-width on mobile; accepts PDF and plain text files
- On successful upload, display a confirmation indicator: 「Resume uploaded — questions will be personalized」
- If no resume is uploaded, the system uses the selected branch question pool only
- Resume content is parsed client-side to extract keywords; no file is transmitted to any external server
- If file is unreadable or parse error occurs: display inline notice 「Resume could not be parsed. Proceeding with branch-based questions.」 and fall back to branch question pool

**CTA Button: 「Start Interview」**
- Minimum height 48px; full-width on mobile
- Hover/tap state: glow pulse effect with neon border expansion
- Click/tap: triggers smooth page transition to Interview Page with loading animation overlay displaying 「AI is analyzing...」

### 3.6 Interview Page

**Mobile Layout Order (top to bottom)**
1. Question Display Panel
2. Camera Feed Container
3. Real-Time Confidence Meter + Filler Word Detection Panel
4. Emotion Detection Display
5. Waveform Animation + Voice Recording Indicator
6. Session Controls (End Interview button)

**Camera Feed Container**
- Responsive and centered; full-width on mobile with rounded corners and glowing neon border
- HUD-style futuristic scanning overlay layered on top of the camera feed
- On mobile: lightweight CSS overlay replaces heavy JS-driven HUD effects
- Animated horizontal scanning lines sweeping vertically across the feed at regular intervals
- Face tracking frame: animated corner brackets that lock onto the detected face region with subtle pulsing glow
- If camera permission is denied or no video input is available: display inline warning banner 「Camera access required for body language analysis」; body language scoring is disabled for the session

**Body Language Analysis (Camera-Based)**
- Live analysis performed client-side using the camera feed
- Metrics tracked:
  - Eye contact: detected via face presence in frame
  - Facial expression: basic smile / neutral detection using facial landmark heuristics
  - Head stability: movement tracking based on face bounding box position variance
- Face visibility ratio tracked throughout the session
- If face detection frames fall below 30% of total frames processed: body language scoring is marked incomplete and warning banner shown: 「Face not clearly visible. Please maintain camera visibility.」
- Live analysis text displayed below the camera feed on mobile, cycling through:
  - 「Analyzing eye contact...」
  - 「Tracking expressions...」
  - 「Monitoring head stability...」
- Text transitions use a CSS fade-in animation effect

**Real-Time Confidence Meter**
- Displayed below the camera feed on mobile; full-width horizontal meter
- Labeled 「Live Confidence Score」; scale 0–10, clamped to 1–10
- Updates live while the user is speaking
- Smooth CSS animation as value transitions between states
- Color transitions: Red (1–3), Yellow (4–6), Green (7–10)
- If no sufficient speech detected (word count < 5): meter is hidden and replaced with 「No sufficient speech detected. Please provide a complete answer.」

**Live Speech Analysis Engine**
- Continuously converts user speech into text using the browser's Web Speech API (SpeechRecognition)
- Analyzes speech dynamically: speaking speed (WPM), hesitation (pause frequency + filler words), response length
- Confidence score (1–10, clamped) updated after each recognized speech segment
- All processing client-side; no audio transmitted to external servers
- Speaking speed validation: WPM < 50 or WPM > 220 reduces confidence score and surfaces warning 「Speaking speed outside optimal range」
- Pause tracking: if pause count exceeds defined threshold, confidence score is reduced and warning 「High hesitation detected」 is surfaced
- If SpeechRecognition is not available in the browser: display inline notice 「Live speech analysis is not supported in your browser. Please use Chrome for the full experience.」; disable live confidence meter, filler word panel, and emotion detection; other interview features remain functional
- If SpeechRecognition error event fires: silently restart recognition instance; display error only if recognition fails repeatedly

**Filler Word Detection Panel**
- Compact panel displayed below the confidence meter on mobile
- Displays in real time:
  - 「Avoid: um, uh, like」 — when filler words detected in most recent speech segment
  - 「Good speaking!」 — when no filler words detected
- If filler word ratio exceeds 10% of total words: communication score is reduced and warning 「Frequent filler words detected」 is surfaced
- CSS fade-in / fade-out animation on each content change
- Filler word list: um, uh, like, you know, basically, literally, actually, right, so (configurable in code)

**Emotion Detection Display**
- Compact labeled indicator below the filler word panel on mobile
- States: Nervous / Confident / Neutral
- Detection logic: voice stability + head movement variance
- Only computed when word count ≥ 5; hidden when data is insufficient
- Neon color coding: Nervous = red, Confident = green, Neutral = blue
- CSS fade transition on state update

**Dynamic AI Analysis Text Panel**
- Positioned below the camera feed on mobile
- Cycles through status messages every 3 seconds using CSS fade-in animation:
  - 「Analyzing speech patterns...」
  - 「Analyzing facial expressions...」
  - 「Tracking confidence...」
  - 「Evaluating eye contact...」
  - 「Processing voice tone...」

**Voice Recording Indicator**
- Glowing pulse mic icon displayed when audio recording is active
- CSS pulse animation expands and contracts rhythmically
- Color shifts from dim to bright neon blue when voice is detected

**Waveform Animation**
- Real-time audio waveform visualization displayed adjacent to the mic icon
- Waveform bars animate in response to voice input (amplitude-driven) using Web Audio API (AnalyserNode)
- Rendered with requestAnimationFrame; paused when no speech is detected
- On mobile: simplified waveform with reduced bar count for performance
- Styled with neon blue/purple consistent with the cinematic dark theme
- Flat/idle when no speech is detected

**Question Display Panel**
- Positioned above the camera feed on mobile
- Floating glassmorphism card; full-width on mobile
- Question types: HR questions, technical questions (based on selected branch), and adaptive follow-up questions
- Adaptive follow-up logic: if transcribed answer word count < 20 or filler word density > 20%, inject a follow-up prompt before advancing to next pool question
- If resume was uploaded: at least 30% of questions generated from extracted resume keywords
- Questions presented one at a time with CSS fade or slide transition
- Navigation control to proceed to next question or end the session; minimum tap target 48px

**Session Controls**
- 「End Interview」 button — minimum height 48px, full-width on mobile, positioned below the camera feed
- Triggers transition to Result Page with loading animation overlay 「AI is analyzing...」

### 3.7 Result Page

**Data Validation Gate**
- Before rendering any scores, the Result Page evaluates completeness and validity of all session data
- Missing or invalid metrics are replaced with warning banners; metric is skipped safely
- Global 「Incomplete data for full evaluation」 banner shown at top if one or more metrics could not be computed
- 「Retry Interview」 button always visible, minimum height 48px, full-width on mobile
- If user navigates directly to Result Page with no completed interview session in state: display placeholder 「Please complete an interview to view your results.」 with 「Start Interview」 CTA

**Data Persistence on Result Page**
- For signed-in users: interview result (scores, timestamp, branch, emotion summary, warning flags) saved and linked to user account for Dashboard retrieval
- For guest users: no data saved; result displayed for current session only and discarded on navigation away

**Warning Banner System**
- Warning banners displayed prominently above the affected score section
- Color-coded: red for blocking issues, yellow for degraded-quality warnings
- Each banner includes a short actionable message
- CSS fade-slide entrance animation

**Analytics Dashboard Layout**
- Single-column stacked layout on mobile
- Dark glassmorphism panel with neon-accented section dividers
- Subtle depth effects simplified on mobile (reduced box shadows, no perspective tilt)

**Circular Progress Meters**
- Three animated circular meters stacked vertically on mobile:
  - Communication Score
  - Confidence Score
  - Body Language Score
- Count-up animation on page load (CSS or lightweight JS)
- Score value displayed numerically at center of each ring
- Neon blue-to-purple gradient ring color
- All scores clamped between 1–10
- Score computation rules:
  - Communication Score: computed only when word count ≥ 5; reduced if filler ratio > 10%; if word count 5–20, shown as low with explanation 「Response too short to evaluate effectively」; if word count < 5, replaced with warning 「No sufficient speech detected. Please provide a complete answer.」
  - Confidence Score: computed only when word count ≥ 5; reduced if WPM < 50 or WPM > 220 (warning: 「Speaking speed outside optimal range」); reduced if pause count exceeds threshold (warning: 「High hesitation detected」)
  - Body Language Score: computed only when camera access was granted AND face detection frames ≥ 30% of total frames; if camera denied, disabled with message 「Camera access required for body language analysis」; if face visibility < 30%, marked incomplete or low with warning 「Face not clearly visible. Please maintain camera visibility.」
- If a score cannot be computed: meter replaced by warning card with relevant message and retry suggestion

**Emotion Summary**
- Dedicated section displaying dominant emotion state (Nervous / Confident / Neutral)
- Brief contextual note (e.g., 「You appeared confident throughout most of the session.」)
- Styled with corresponding neon color
- If insufficient speech data: section hidden and replaced with 「Emotion data unavailable due to insufficient speech input.」

**Feedback Cards (Smart Feedback Mode)**
- Floating glassmorphism cards stacked vertically on mobile
- Warning cards surface all active warnings from the session
- Standard suggestion cards (when data sufficient): 「Maintain eye contact」, 「Avoid filler words」, 「Improve clarity」, and contextual feedback based on session metrics
- CSS staggered fade-up entrance animation
- Tap state: subtle glow border and slight elevation lift
- Warning cards highlighted in red or yellow; standard cards use default neon glassmorphism style

**Visual Feedback Enhancements**
- Pulse and glow effects on score reveal (CSS-based on mobile)
- Animated bar indicators for secondary metrics (speaking speed, response length, hesitation rate) — only rendered when corresponding data is valid; simplified on mobile

**Navigation**
- 「View Dashboard」 button — visible only for signed-in users; minimum height 48px, full-width on mobile
- For guest users: 「Sign in to track your progress」 prompt linking to Auth Screen
- 「Retake Interview」 button — minimum height 48px, full-width on mobile
- 「Retry Interview」 button — always visible; minimum height 48px, full-width on mobile
- Adequate spacing between all navigation buttons to prevent accidental taps

### 3.8 Dashboard Page (Signed-In Users Only)

- Accessible only to signed-in users
- If a guest user attempts to navigate to this page: display 「Sign in to track your progress」 with CTA linking to Auth Screen

**History Management Controls**
- 「Clear All History」 button displayed prominently at the top of the past interviews list
  - Styled in red to signal a destructive action
  - Minimum height 48px; full-width on mobile
  - On click: display a warning confirmation popup:
    「This will permanently delete all your interview data. This action cannot be undone.」
  - Popup contains two actions: 「Cancel」 and 「Delete All」 (red)
  - On confirm: all stored interview records linked to the current signed-in user are permanently deleted; UI updates instantly without page reload; list transitions to empty state
  - On cancel: popup closes; no data is affected
  - Deletion is strictly scoped to the current signed-in user's data; no other user's data is affected
  - Hidden for guest users

**Past Interviews List**
- Vertically stacked card layout on mobile
- Each card shows: date, branch, overall score, and a summary tag (e.g., 「Good Performance」)
- Each card includes a trash icon button positioned at the top-right corner of the card
  - Icon styled in red to signal a destructive action
  - Minimum tap target: 44×44px
  - On click: display a confirmation popup:
    「Are you sure you want to delete this interview record?」
  - Popup contains two actions: 「Cancel」 and 「Delete」 (red)
  - On confirm: the specific record is permanently deleted from storage for the current signed-in user; the card is removed from the list with a smooth CSS fade-out and collapse animation; UI updates instantly without page reload
  - On cancel: popup closes; no data is affected
  - Deletion is strictly scoped to the current signed-in user's data; no other user's data is affected
- Tap animation on card body: card lifts with neon glow border
- Empty state (shown when all records are deleted or no sessions exist): 「No interviews yet. Start your first session to see your progress.」
- Delete options (trash icon and 「Clear All History」 button) are not rendered for guest users

**Progress Comparison**
- Vertically stacked score indicators on mobile (side-by-side on desktop)
- Shows Previous vs. Current session score comparison
- Color-coded delta indicators: green = improved, red = declined
- If only one past session: comparison section displays current session only; previous score labeled 「No previous session」
- If all history is deleted: comparison section displays empty state consistent with no sessions

**Improvement Graph**
- Simplified line or area chart on mobile (reduced data points, no complex animations)
- Animated draw-on effect when chart first renders (lightweight CSS or minimal JS)
- Neon-colored data line on dark background
- If no session data exists: graph area displays empty state placeholder

**Navigation**
- 「Start New Interview」 CTA button — minimum height 48px, full-width on mobile, linking to Landing Page

---

## 4. Business Rules & Logic

**Authentication & Session Rules**
- On app load, if no active session exists, the Auth Screen is displayed before any other page
- Guest session is maintained in memory while the app is open; no persistence on refresh
- Signed-in user session is persisted (e.g., via localStorage or session token) so the user remains signed in on page refresh
- Sign-out clears the session and redirects the user to the Auth Screen
- Google Sign-In is implemented via OSS Google Sign-In; Google OAuth is prohibited
- User profile data stored on sign-in: name, email, profile photo

**Data Storage Rules**
- For signed-in users: interview results (scores, branch, date, emotion summary, feedback, warning flags) are saved and linked to the user's email or ID; data is retrievable by the Dashboard
- For guest users: no interview data is stored at any point; all session data is temporary and discarded on navigation away or refresh
- Guest users who attempt to access the Dashboard are shown: 「Sign in to track your progress」

**History Deletion Rules**
- Delete Single Entry: removes only the specific interview record identified by its unique record ID, scoped strictly to the currently signed-in user; no other records or users are affected
- Delete All History: removes all interview records linked to the currently signed-in user's ID or email; no other users' data is affected
- All deletion operations must update the UI instantly without requiring a page reload
- Deleted records are permanently removed and cannot be recovered
- Confirmation popups are mandatory before any deletion is executed; deletion cannot proceed without explicit user confirmation
- Delete controls (trash icons and 「Clear All History」 button) are never rendered for guest users
- After deletion, all dependent UI sections (progress comparison, improvement graph) must reflect the updated data state immediately

**Interview & Scoring Rules**
- The Interview Page must request camera and microphone permissions on load; if denied, display a clear inline error message and disable body language scoring for the session
- Live speech analysis is powered by the browser's Web Speech API (SpeechRecognition); all confidence scoring, filler word detection, speaking speed, and emotion detection are computed entirely client-side
- Score validity gate: scores are only computed and displayed when the underlying data meets minimum validity thresholds; if thresholds are not met, the score is suppressed and replaced with a warning message
- Score clamping: all computed scores must be clamped to the range 1–10 without exception
- Determinism rule: given the same input data, the system must always produce the same output scores; no randomness is permitted in score computation
- Confidence score (1–10, clamped) is recalculated after each recognized speech segment using a weighted formula:
  - Word count contribution: higher word count within a segment increases base score
  - Speaking speed: WPM within normal range (120–160 wpm) contributes positively; WPM < 50 or WPM > 220 reduces score and triggers warning
  - Hesitation penalty: if pause count exceeds the defined threshold, score is reduced and warning is triggered
  - Filler word penalty: each detected filler word deducts a fixed amount from the segment score
  - Final live score is a rolling average of the last 5 segment scores
- Filler word detection compares each recognized word against a predefined list; detection is case-insensitive; if filler ratio > 10% of total session words, communication score is reduced
- Emotion state is derived after each speech segment only when word count ≥ 5
- Adaptive follow-up question logic: if transcribed answer word count < 20 or filler word density > 20%, inject a follow-up prompt before advancing to the next pool question
- Resume parsing is performed client-side on upload; extracted keywords are stored in session state
- Branch selection (AIML / CS / IT) determines the active question pool
- All page transitions must include the 「AI is analyzing...」 loading overlay animation
- 3D rendering on desktop must be optimized: low-poly geometry, instanced meshes, frame-rate throttling; disabled on mobile
- Waveform animation must use requestAnimationFrame and be paused when no audio input is active; simplified on mobile
- All real-time UI updates must be debounced or throttled appropriately to prevent layout thrashing
- Dynamic AI analysis text panel messages update at a fixed 3-second interval

**Mobile Performance Rules**
- On screen width < 768px: heavy 3D effects, complex particle systems, and parallax are automatically disabled
- CSS animations replace JS-driven animations wherever possible on mobile
- Sections not in the current viewport are lazy-loaded
- Waveform bar count is reduced on mobile
- Dashboard graphs are simplified on mobile
- Low FPS detection: reduce particle count, disable parallax, simplify waveform animation

---

## 5. Edge Cases & Boundary Conditions

| Scenario | Condition | Handling |
|---|---|---|
| No speech detected | Transcript empty OR word count < 5 | Suppress all score displays; show warning: 「No sufficient speech detected. Please provide a complete answer.」; show 「Retry Interview」 button |
| Very short answer | Word count between 5–20 | Show low communication score; add explanation: 「Response too short to evaluate effectively」 |
| Face not visible | Face detection frames < 30% of total frames | Body language score marked incomplete or low; show warning: 「Face not clearly visible. Please maintain camera visibility.」 |
| Camera permission denied | Camera permission denied OR no video input | Disable body language scoring; show: 「Camera access required for body language analysis」 |
| Extreme speaking speed | WPM < 50 OR WPM > 220 | Reduce confidence score; show: 「Speaking speed outside optimal range」 |
| High filler word ratio | Filler ratio > 10% of total words | Reduce communication score; show: 「Frequent filler words detected」 |
| Frequent pauses | Pause count > defined threshold | Reduce confidence score; show: 「High hesitation detected」 |
| Any metric missing | No transcript, no camera data, or other missing input | Skip that metric safely; show: 「Incomplete data for full evaluation」 |
| Browser lacks Web Speech API | SpeechRecognition not available | Display inline notice: 「Live speech analysis is not supported in your browser. Please use Chrome for the full experience.」; disable live confidence meter, filler word panel, and emotion detection; other interview features remain functional |
| Resume upload fails | File unreadable or parse error | Display inline notice: 「Resume could not be parsed. Proceeding with branch-based questions.」; fall back to branch question pool only |
| No past sessions on Dashboard | No session records linked to user | Display empty state: 「No interviews yet. Start your first session to see your progress.」 |
| Browser lacks WebGL | WebGL not supported | Gracefully fall back to a static 2D animated background; no crash or blank screen |
| Direct navigation to Result Page | No completed interview session in state | Display placeholder with prompt: 「Please complete an interview to view your results.」; show 「Start Interview」 CTA |
| Slow device / low frame rate | Low FPS detected | Reduce particle count, disable parallax, simplify waveform animation |
| Speech recognition error | SpeechRecognition error event fired | Silently restart recognition instance; display error only if recognition fails repeatedly |
| Only one past session on Dashboard | Single session record linked to user | Display comparison section with current session only; label previous score as 「No previous session」 |
| Score out of range | Any computed score < 1 or > 10 | Clamp to 1–10 before display; never display a score outside this range |
| Inconsistent output attempt | Same input processed multiple times | System must produce identical output; all non-deterministic paths are prohibited |
| Guest user accesses Dashboard | User is in guest mode | Display: 「Sign in to track your progress」 with CTA to Auth Screen |
| Google Sign-In fails | OAuth error or network failure | Display inline error message on Auth Screen; allow retry |
| Signed-in user refreshes page | Active session exists in storage | User remains signed in; session is restored without re-authentication |
| Guest user refreshes page | No session persistence for guests | User remains as guest for the current tab; no data is restored |
| Mobile screen detected | Screen width < 768px | Automatically switch to mobile layout; disable heavy 3D effects and parallax; activate bottom navigation bar |
| Horizontal overflow on mobile | Content wider than screen width | All sections constrained to screen width; horizontal scrolling is prohibited |
| Delete single record confirmed | User confirms deletion of one interview record | Record is permanently removed from storage for current user only; card removed with CSS fade-out and collapse animation; UI updates instantly without page reload |
| Delete single record cancelled | User cancels deletion popup | Popup closes; no data is affected; record remains intact |
| Delete all history confirmed | User confirms 「Clear All History」 | All records for current signed-in user are permanently deleted; list transitions to empty state instantly without page reload; progress comparison and graph reflect empty state |
| Delete all history cancelled | User cancels 「Clear All History」 popup | Popup closes; no data is affected; all records remain intact |
| Guest user attempts to delete | User is in guest mode | Delete controls are not rendered; no delete action is possible |
| All records deleted | No remaining session records after deletion | Dashboard displays empty state: 「No interviews yet. Start your first session to see your progress.」; progress comparison and graph show empty state |
| Cross-user deletion attempt | Deletion triggered for a record not belonging to current user | Operation is rejected; only records linked to the current signed-in user's ID or email may be deleted |

---

## 6. Acceptance Criteria

- Auth Screen is displayed on first load when no active session exists, presenting both 「Continue as Guest」 and 「Sign in with Google」 options; the entire Auth Screen fits within the mobile viewport without scrolling
- 「Continue as Guest」 button (minimum 48px height, full-width on mobile) navigates the user to the Landing Page without authentication; label 「Guest mode – history will not be saved」 is visible
- 「Sign in with Google」 button (minimum 48px height, full-width on mobile) triggers OSS Google Sign-In; on success, user profile (name, email, photo) is stored and user is navigated to the Landing Page
- Signed-in user session persists on page refresh; guest session does not persist
- Bottom navigation bar is visible and sticky on screens narrower than 768px, containing Home, Interview, Results, and Dashboard (signed-in only) tabs with icons and labels; active tab is highlighted
- Top navbar is displayed on desktop (≥768px); bottom nav bar is displayed on mobile (<768px)
- Profile avatar and 「Sign Out」 option are accessible for signed-in users; sign-out clears session and returns user to Auth Screen
- 「Upgrade to Sign In」 prompt is visible for guest users in the bottom navigation area and links to the Auth Screen
- Dashboard tab is hidden from the bottom navigation bar for guest users; guest users attempting to access the Dashboard see: 「Sign in to track your progress」
- All pages use a single-column layout on mobile with no horizontal scrolling
- All interactive buttons have a minimum height of 48px and adequate spacing between them on mobile
- Font sizes on mobile are: titles 24–32px, body 14–16px
- Heavy 3D effects, complex particle systems, and parallax are automatically disabled on screens narrower than 768px
- CSS animations replace JS-driven animations on mobile wherever applicable
- Sections not in the current viewport are lazy-loaded
- Landing Page renders the 3D neural network animation on desktop; a lightweight 2D CSS/SVG animated illustration is shown on mobile; parallax is disabled on mobile
- Branch selector (AIML / CS / IT) is visible and functional on the Landing Page; options are vertically stacked on mobile with minimum 48px tap targets; selected branch is highlighted
- Resume upload zone accepts PDF and text files; successful upload displays a confirmation indicator
- 「Start Interview」 CTA button (minimum 48px, full-width on mobile) triggers the loading overlay and transitions smoothly to the Interview Page
- On the Interview Page (mobile), layout order from top to bottom is: Question Display Panel, Camera Feed, Confidence Meter + Filler Word Panel, Emotion Detection, Waveform + Mic Icon, Session Controls
- Camera feed is responsive and centered on mobile; lightweight CSS overlay replaces heavy HUD effects on mobile
- Live Confidence Meter (1–10) is visible during the interview when sufficient speech is present, updates in real time, and transitions through red / yellow / green color states
- When transcript is empty or word count < 5, the confidence meter is hidden and the no-speech warning is displayed
- Waveform animation responds visibly to voice input (simplified bar count on mobile) and remains flat during silence
- Filler Word Detection Panel updates after each speech segment with correct content and CSS fade animations
- Emotion Detection indicator updates after each speech segment with correct color coding; hidden when speech data is insufficient
- Adaptive follow-up questions are injected when the user's answer is too short or contains high filler word density
- Resume-based questions appear during the interview when a resume was uploaded
- Result Page displays three animated circular progress meters stacked vertically on mobile, only when corresponding data is valid
- Result Page suppresses scores and displays appropriate warning banners when data is missing or invalid
- Warning banners are color-coded (red / yellow) and include actionable messages
- 「Retry Interview」 button is always visible on the Result Page (minimum 48px, full-width on mobile)
- All scores displayed on the Result Page are clamped between 1–10
- Given identical session input, the system always produces identical output scores
- Short answer (5–20 words) produces a low communication score with the explanation: 「Response too short to evaluate effectively」
- Face visibility below 30% produces a low or incomplete body language score with the corresponding warning
- Camera denial disables body language scoring and displays the camera access warning
- WPM outside 50–220 range reduces confidence score and surfaces the speed warning
- Filler ratio above 10% reduces communication score and surfaces the filler word warning
- Pause count above threshold reduces confidence score and surfaces the hesitation warning
- Missing metric data causes that metric to be skipped safely with the 「Incomplete data for full evaluation」 message
- Result Page displays an Emotion Summary section when data is sufficient; hidden otherwise
- Staggered feedback cards animate in on the Result Page with tap glow effects; cards are stacked vertically on mobile
- Dashboard Page displays past session cards stacked vertically on mobile with date, branch, score, and tap animations (signed-in users only)
- Each past interview card on the Dashboard displays a red trash icon button (minimum tap target 44×44px) for signed-in users; trash icons are not rendered for guest users
- Clicking the trash icon on a card displays a confirmation popup: 「Are you sure you want to delete this interview record?」 with 「Cancel」 and 「Delete」 (red) actions
- On confirming single record deletion, the card is removed with a CSS fade-out and collapse animation; UI updates instantly without page reload; only the current signed-in user's record is affected
- On cancelling single record deletion, the popup closes and no data is affected
- 「Clear All History」 button is displayed at the top of the past interviews list in red for signed-in users; not rendered for guest users
- Clicking 「Clear All History」 displays a warning popup: 「This will permanently delete all your interview data. This action cannot be undone.」 with 「Cancel」 and 「Delete All」 (red) actions
- On confirming 「Clear All History」, all records for the current signed-in user are permanently deleted; UI transitions to empty state instantly without page reload; progress comparison and graph reflect empty state
- On cancelling 「Clear All History」, the popup closes and no data is affected
- Deletion operations are strictly scoped to the current signed-in user; no other user's data is affected
- After all records are deleted, the Dashboard displays the empty state: 「No interviews yet. Start your first session to see your progress.」
- Dashboard Page displays a Previous vs. Current score comparison section with color-coded delta indicators; stacked vertically on mobile
- Dashboard Page displays a simplified animated improvement graph on mobile
- All page transitions include the 「AI is analyzing...」 loading animation
- Tap/hover glow effects are present on all interactive buttons and cards
- Camera/microphone permission denial is handled gracefully with a clear user message
- Browsers lacking Web Speech API support display an appropriate fallback notice without breaking the interview flow
- Google Sign-In failure displays an inline error on the Auth Screen with a retry option
- Low FPS detection reduces particle count, disables parallax, and simplifies waveform animation
- No horizontal scrolling occurs on any page on any mobile screen width

---

## 7. Out of Scope for This Version

- Real AI/ML inference via external model APIs for facial expression, voice tone, or body language analysis
- Backend database or server-side user data storage (all signed-in user data is stored locally linked to user identity)
- Multi-user or recruiter-side candidate management features
- Video recording, playback, or export of interview sessions
- Native mobile application (iOS or Android app store distribution)
- Integration with third-party ATS (Applicant Tracking Systems)
- Server-side speech processing or cloud-based NLP analysis
- LLM API integration for dynamically generated interview questions
- Accessibility (WCAG) compliance enhancements beyond basic readability
- Resume parsing via server-side OCR or external document processing services
- Email/password or other non-Google authentication methods
- Admin panel or user management interface
- iOS-specific UI optimizations (focus is Android and general mobile web)
- Progressive Web App (PWA) installation or offline support
- Bulk export or download of interview history data
- Undo or recovery of deleted interview records
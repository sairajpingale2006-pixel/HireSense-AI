# Task: Implement HireSense AI application

## Plan
- [x] Initialize Design System (colors, index.css, tailwind.config.js)
- [x] Define Routes and Layout
- [x] Create Core Components
  - [x] AIBrain (3D)
  - [x] LoadingOverlay
  - [x] HUDOverlay (Camera interface)
- [x] Implement Pages
  - [x] Landing Page
  - [x] Interview Page
  - [x] Result Page
  - [x] Dashboard Page
- [x] Finalize logic and transitions
- [x] Run lint and fix issues
- [x] Upgrade Interview Page with Real-Time AI Behavior
  - [x] Implement Speech Recognition (Web Speech API or simulation)
  - [x] Add Real-Time Confidence Meter
  - [x] Add Waveform Animation
  - [x] Add Filler Word Detection UI
  - [x] Enhance HUD with live feedback overlays




## Notes
- Using Supabase for persistent storage
- LLM API for question generation and feedback
- TensorFlow.js for face detection
- Web Speech API for voice recognition
- Dark holographic theme

## New Features to Add
- [x] Setup Supabase backend
- [x] Create Edge Function for AI question generation
- [x] Add resume upload and parsing
- [x] Implement branch selection (AIML/CS/IT)
- [x] Add face detection with TensorFlow.js
- [x] Store interview sessions in database
- [x] Generate AI-powered feedback
- [x] Replace random scoring with rule-based scoring engine
- [x] Add explainable score reasons for each metric
- [x] Display metrics breakdown (words, fillers, WPM, eye contact)
- [x] Add "AI analyzing..." loading state before results
- [x] Implement comprehensive edge case handling
- [x] Add validation system for insufficient data
- [x] Display warning banners for edge cases
- [x] Prevent misleading scores with smart feedback mode
- [x] Handle no speech, short answers, camera issues, extreme speeds
- [x] Add user authentication with Google SSO and Guest mode
- [x] Create profiles table with trigger for user sync
- [x] Implement AuthContext and RouteGuard
- [x] Add UserProfile component with dropdown menu
- [x] Create AuthLandingPage with Google sign-in and guest options
- [x] Update interview flow to save user_id for logged-in users
- [x] Protect Dashboard page - show sign-in prompt for guests
- [x] Add dynamic navbar with navigation items
- [x] Implement active route highlighting
- [x] Add mobile-responsive navigation menu
- [x] Show guest mode banner when active
- [x] Hide navbar on auth page
- [x] Redirect to /landing after authentication
- [x] Update all navigation buttons to use correct routes

## Authentication Flow
1. User lands on AuthLandingPage (/) with two options
2. Sign in with Google → redirects to /landing with full features
3. Continue as Guest → redirects to /landing with limited features
4. Navbar appears with Home, Interview, Results, Dashboard (logged-in only)
5. Guest mode shows banner and locks Dashboard
6. Sign out returns to AuthLandingPage

## Mobile Optimizations
- [x] Bottom navigation bar for mobile (<768px)
- [x] Top navbar for desktop (≥768px)
- [x] Single-column layout on mobile
- [x] Reduced padding and margins for small screens
- [x] Touch-friendly buttons (minimum 48px height)
- [x] Disabled 3D effects on mobile for performance
- [x] Simplified animations on mobile
- [x] Responsive typography (scalable font sizes)
- [x] Safe area support for notched devices
- [x] Viewport meta tags for proper mobile rendering
- [x] Mobile-first CSS with touch optimizations
- [x] Vertical stacking of all content on mobile
- [x] Simplified charts and graphs for mobile
- [x] Device detection hook (useIsMobile, useDevicePerformance)

## History Management
- [x] Delete single interview functionality
- [x] Delete all interviews functionality
- [x] Confirmation dialogs for delete actions
- [x] Trash icon on each interview card (visible on hover)
- [x] "Clear All History" button in dashboard header
- [x] Smooth animations when items are removed (AnimatePresence)
- [x] Instant UI updates without page reload
- [x] User-specific deletion (only affects logged-in user)
- [x] Red/destructive color scheme for delete actions
- [x] Toast notifications for delete success/failure
- [x] Guests don't see delete options (no history stored)


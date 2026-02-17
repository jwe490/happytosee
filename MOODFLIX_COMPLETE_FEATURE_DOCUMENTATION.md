# MoodFlix — Complete Feature & Function Documentation
> **Generated: February 2026** | For rebuilding all features from scratch if needed.

---

## TABLE OF CONTENTS
1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Routing & App Structure](#3-routing--app-structure)
4. [Authentication System (Key-Based Auth)](#4-authentication-system)
5. [Homepage / Index Page](#5-homepage--index-page)
6. [Hero Section](#6-hero-section)
7. [Mood Selector (Orange SVG Cards)](#7-mood-selector)
8. [Movie Recommendations Engine](#8-movie-recommendations)
9. [Trailer Reels System (TikTok-style)](#9-trailer-reels-system)
10. [Expanded Movie View (Movie Detail Modal)](#10-expanded-movie-view)
11. [AI Search](#11-ai-search)
12. [Movie Search (Text Search)](#12-movie-search)
13. [Watchlist & Collections](#13-watchlist--collections)
14. [User Profile](#14-user-profile)
15. [User Insights / Poster Generation](#15-user-insights)
16. [Community Page](#16-community-page)
17. [Mood Assessment Flow](#17-mood-assessment-flow)
18. [Person (Actor/Director) Page](#18-person-page)
19. [Admin Dashboard](#19-admin-dashboard)
20. [Header & Navigation](#20-header--navigation)
21. [Discovery Drawer & Filters](#21-discovery-drawer)
22. [Theme System (Light/Dark + Accent Colors)](#22-theme-system)
23. [Supabase Edge Functions (Backend)](#23-supabase-edge-functions)
24. [FastAPI Backend (MongoDB)](#24-fastapi-backend)
25. [Database Schema (Supabase Tables)](#25-database-schema)
26. [SVG Assets List](#26-svg-assets)
27. [CSS Design Tokens & Styling](#27-css-design-tokens)
28. [Lovable Compatibility Requirements](#28-lovable-compatibility)

---

## 1. Architecture Overview

```
Frontend (React + Vite + TypeScript + Tailwind + shadcn/ui)
    ↕ Supabase Client (supabase-js)
Supabase Backend (PostgreSQL + Edge Functions)
    ↕ TMDB API (movie data)
FastAPI Backend (Python, MongoDB)
    ↕ Recommendation engine, interaction tracking, referrals
```

- **Frontend**: React 18 with Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Primary Backend**: Supabase (PostgreSQL for users, watchlists, reviews, collections + Edge Functions for TMDB API calls)
- **Secondary Backend**: FastAPI with MongoDB (recommendation engine, interaction tracking, referral system, mood cards)
- **External API**: TMDB (The Movie Database) — for movie data, trailers, search, trending, person details

---

## 2. Tech Stack & Dependencies

### Frontend Key Libraries
| Library | Purpose |
|---------|---------|
| `react` ^18.3.1 | UI framework |
| `react-router-dom` ^6.30.x | Client-side routing |
| `framer-motion` ^12.x | Animations (used heavily throughout) |
| `@tanstack/react-query` ^5.x | Server state management |
| `@supabase/supabase-js` ^2.x | Supabase client |
| `tailwindcss` ^3.4.x | Utility CSS |
| `tailwindcss-animate` | Animation utilities |
| `lucide-react` ^0.462.0 | Icon library |
| `sonner` | Toast notifications |
| `recharts` | Charts (admin dashboard, insights) |
| `html2canvas` | Screenshot/poster generation |
| `next-themes` | Theme switching (light/dark) |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class merging utilities |
| `vaul` | Drawer component |
| `cmdk` | Command menu |
| `embla-carousel-react` | Carousel component |
| `react-day-picker` | Date picker |
| `react-hook-form` + `zod` | Form handling + validation |
| `canvas-confetti` | Confetti animations |
| `lovable-tagger` | Lovable component tagging (devDep) |

### Backend (FastAPI)
| Library | Purpose |
|---------|---------|
| `fastapi` | API framework |
| `motor` | Async MongoDB driver |
| `pydantic` | Data validation |
| `python-dotenv` | Env vars |

---

## 3. Routing & App Structure

**File: `src/App.tsx`**

All routes are lazy-loaded with `React.lazy()` and wrapped in `<Suspense>` with a spinner fallback.

| Route | Page Component | Auth Required | Description |
|-------|---------------|---------------|-------------|
| `/` | `Index` | No | Homepage with hero, mood selector, recommendations |
| `/auth` | `Auth` | No | Key-based authentication (sign up / sign in) |
| `/watchlist` | `Watchlist` | No (guest-safe) | Saved movies + collections |
| `/profile` | `Profile` | No (guest view) | User profile with stats, social feed |
| `/person/:id` | `Person` | No | Actor/director detail page |
| `/assessment` | `Assessment` | No | Mood assessment quiz |
| `/u/:userId` | `PublicProfile` | No | Public user profile |
| `/trailers` | `Trailers` | No | TikTok-style vertical trailer scroll |
| `/insights` | `UserInsights` | Recommended | Personal viewing statistics + poster generator |
| `/community` | `Community` | Recommended | User discovery, follow/unfollow |
| `/admin/login` | `AdminLogin` | Yes (admin) | Admin login verification |
| `/admin/dashboard` | `AdminDashboard` | Yes (admin) | Full admin analytics panel |
| `*` | `NotFound` | No | 404 page |

### Provider Hierarchy (App.tsx)
```
QueryClientProvider → ThemeProvider → TooltipProvider → BrowserRouter →
  KeyAuthProvider → AuthProvider → [Routes]
```

---

## 4. Authentication System

### Overview
**Key-based authentication** — no email/password. Users get a unique secret key (e.g., `MF-XXXX-XXXX-XXXX-XXXX`) that serves as their login credential.

### Files
- `src/hooks/useKeyAuth.tsx` — Main auth context & provider
- `src/hooks/useAuth.tsx` — Unified auth wrapper (re-exports useKeyAuth)
- `src/lib/keyAuth.ts` — Key generation, hashing, session storage utilities
- `src/pages/Auth.tsx` — Auth UI (choice → signup-persona → key-reveal → login)
- `src/components/auth/PersonaForm.tsx` — Signup form (display name, username, DOB, gender, purpose)
- `src/components/auth/KeyRevealCard.tsx` — Shows generated key with copy/download
- `src/components/auth/KeyLoginForm.tsx` — Login form with key input
- `src/components/auth/VaultIllustration.tsx` — Visual for auth page
- `src/components/auth/GlassCard.tsx` — Glass morphism card
- `src/components/auth/FloatingParticles.tsx` — Background animation
- `src/components/auth/AuthBackground.tsx` — Auth page background

### Flow
1. **Sign Up**: User fills persona form → app generates 128-bit random key → SHA-256 hashed → sent to `key-auth` Supabase function → profile created → auto-login
2. **Sign In**: User enters key → hashed → verified via `key-auth` edge function → JWT token returned → stored in localStorage/sessionStorage (based on "Remember Me")
3. **Session**: JWT token stored locally, verified on app load via `key-auth` verify action
4. **Key Format**: `MF-XXXX-XXXX-XXXX-XXXX` (Base64 URL-safe, 128-bit)

### Key Auth Data Types
```typescript
interface KeyUser {
  id: string;
  display_name: string;
  username?: string;
  date_of_birth?: string;
  gender?: string;
  purpose?: string;
  created_at: string;
  last_login_at?: string;
}
```

### Auth Page Design
- Minimal, clean layout with dot pattern background
- Logo with light/dark mode variants (`logo.svg` for light, `moodflix-logo-new.svg` for dark)
- Steps: "choice" → "signup-persona" → "signup-key" → "login"
- "Continue as Guest" option
- Spring animations between steps
- "Encrypted & Private" footer badge

---

## 5. Homepage / Index Page

**File: `src/pages/Index.tsx`**

### Layout (top to bottom)
1. **Header** (fixed, sticky) — with navigation, search, trailer button
2. **Hero Section** — coral card with brain illustration, cycling text, emoji button
3. **Cinematic Image Carousel** — featured/trending movies auto-sliding
4. **Active Filters Indicator** — shows when discovery filters are active
5. **Tabs**: "By Mood" | "AI Find" | "Search"
   - **Mood Tab**: TrendingSection → MoodSelector → PreferencesForm → MovieGrid
   - **AI Tab**: AISearch component
   - **Search Tab**: MovieSearch component
6. **Expanded Movie View** — modal overlay for movie details
7. **Footer**

### State Management
- `selectedMood` — saved to localStorage with 24h expiry
- `preferences` — language, genres, duration, movieType
- `discoveryFilters` — hidden gems, max runtime, date night moods
- `selectedMovie` — URL-driven (`?movie=ID`) for proper history navigation
- `trendingMovies` — fetched from Supabase edge function

### Key Behaviors
- Mood persists in localStorage for 24 hours
- Movie selection uses URL params (`?movie=123`) for browser back/forward support
- Sticky filter bar appears after scrolling past mood selector (scrollY > 400)
- Race condition protection for movie selection (pendingMovieIdRef)
- From-trailers navigation: when coming from trailers, "back" returns to the exact trailer position

---

## 6. Hero Section

**File: `src/components/HeroSection.tsx`**

### Design
- **Coral gradient card** (3:4 aspect ratio) — `linear-gradient(145deg, #E8775E 0%, #D4654E 100%)`
- **Brain SVG illustration** centered in card (hero-brain-new.svg) with subtle pulse animation
- **Floating accessories**: Camera, Juice, Popcorn, Reel SVGs floating around the brain with independent bobbing animations
- **"MOOD FLIX" watermark** — large, white, 12% opacity, Space Grotesk font
- **Cycling sell lines** (rotate every 3.5s):
  - "12+ Moods · 500k+ Movies · Infinite curations"
  - "AI reads your mood and picks the perfect film."
  - "From blockbusters to hidden gems — curated for you."
  - "Stop scrolling. Start feeling. Let AI find your movie."
- **Interactive emoji button** (top-right of card) — tap to cycle through 12 emojis with spring animation
- **Below card**: "AI-powered Movie Suggestions" text (rainbow gradient on "AI") + "Start" button (scrolls to mood selector)
- **Scroll indicator** — mouse/trackpad wheel icon at bottom

### Emojis Cycle
```
["😊", "😎", "🤯", "😴", "😡", "🤖", "😍", "🎬", "🍿", "🥰", "😢", "🤩"]
```

### Responsive
- Mobile: card width 88vw, brain 200px, accessories smaller
- Desktop: card width 420px, brain 280px, accessories larger

---

## 7. Mood Selector

**File: `src/components/MoodSelector.tsx`**

### Design — Original Orange SVG Cards
- **12 mood buttons** in a grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Each mood uses a **custom hand-drawn SVG image** (orange background with emoji faces)
- Card size: 140×140px

### Moods (12 total)
| ID | Label | SVG Asset |
|----|-------|-----------|
| happy | Happy | mood-happy.svg |
| sad | Sad | mood-sad.svg |
| romantic | Romantic | mood-romantic.svg |
| chill | Chill | mood-chill.svg |
| relaxed | Relaxed | mood-relaxed.svg |
| motivated | Motivated | mood-motivated.svg |
| bored | Bored | mood-bored.svg |
| inspired | Inspired | mood-inspired.svg |
| angry | Angry | mood-angry.svg |
| anxious | Anxious | mood-anxious.svg |
| thrilled | Thrilled | mood-thrilled.svg |
| nostalgic | Nostalgic | mood-nostalgic.svg |

### Interaction States
1. **Default**: Shows the SVG image (orange card with emoji face)
2. **Hover/Active**: SVG fades out, replaced by a **blank orange blob** (`#f15e3d`) with the mood label text animating in (letter-by-letter spring animation). Dark border overlay appears.
3. **Selected**: Similar to hover but stays active
4. **Press**: Scale down to 0.9 with y+4 offset

### Animation Details
- Staggered entrance: each card delays by `index * 0.05s`
- Hover: scale 1.08, y: -6, subtle rotation wiggle
- Drop shadow changes: more prominent on hover (`rgba(241, 94, 61, 0.4)`)
- Active state SVG blob uses exact viewBox `0 0 384 384` matching the original SVG coords (`rect x=26, y=51, w=320, h=194, rx=50`)

---

## 8. Movie Recommendations

**File: `src/hooks/useMovieRecommendations.ts`**

### Flow
1. User selects mood + optional preferences (language, genres, industry, duration)
2. Calls Supabase edge function `recommend-movies` with params
3. Returns array of `Movie` objects
4. Supports "load more" (pagination via `previouslyRecommended` titles to avoid duplicates)
5. `clearHistory` resets everything

### Movie Type
```typescript
interface Movie {
  id: number;
  title: string;
  rating: number;
  year: number;
  genre: string;
  language?: string;
  industry?: string;
  posterUrl: string;
  backdropUrl?: string;
  moodMatch: string;
  overview?: string;
}
```

### Params
```typescript
interface RecommendationParams {
  mood: string;
  languages: string[];
  genres: string[];
  industries: string[];
  duration: string;
  hiddenGems?: boolean;
  maxRuntime?: number;
  dateNightMoods?: [string, string] | null;
}
```

---

## 9. Trailer Reels System

**File: `src/pages/Trailers.tsx`**

### Overview
TikTok/Instagram Reels-style vertical scrolling trailer player using YouTube IFrame API.

### UI Layout
- **Full-screen black background** (fixed, z-50)
- **Top bar**: Back button (left) | MoodFlix logo (center) | empty spacer (right)
- **Vertical scroll container**: Each trailer takes full viewport height with snap scrolling
- **Right action rail** (when info closed): Like ❤️ | Save ➕ | Info ℹ️ | Share ↗️
- **Bottom bar**: Poster thumbnail + title + rating + year | Play/Pause | Mute buttons
- **Info pane**: Slides up from bottom (30dvh), draggable, shows details
- **Movie detail overlay**: Full-screen slide-up with complete movie details

### Gesture System
| Gesture | Action |
|---------|--------|
| **Single tap** (center) | Toggle mute/unmute with Instagram-style icon flash (1.5s) |
| **Hold edge** (15% left/right, >180ms) | Activate 2× speed |
| **Drag up while 2× active** (>50px) | Lock 2× speed (shows Lock icon flash) |
| **Drag down while locked** (>50px) | Unlock (shows Unlock icon flash) |
| **Vertical scroll** | Navigate between trailers |

### Edge Hint
- On first load, edges glow with pulsing white gradients for 5 seconds
- Text: "hold edges for 2× speed" appears centered below top bar

### 2× Speed System
- **Hold edge > 180ms** → 2× playback starts
- **While holding, drag up > 50px** → Lock 2× (persists even after releasing)
- **While locked, drag down > 50px** → Unlock
- **Lock flash**: Large centered Lock icon + "2× Locked" text with spring animation
- **Unlock flash**: Large centered Unlock icon + "Unlocked" text
- **Persistent badge**: Centered pill below top bar showing "2×" (with Lock icon if locked)
- **Haptic feedback**: `navigator.vibrate` on lock/unlock actions

### Recommendation Engine (Client-Side)
- Tracks user behavior in localStorage: `mf_trailer_behavior`
  - `likedIds`, `savedIds`, `watchedDurations`, `skippedIds`, `genreAffinities`
- **Watch duration tracking**: >8s boosts genre affinity, <3s penalizes (skip)
- **Like** adds +3 genre affinity weight
- **Save** adds +4 genre affinity weight
- Trailers are re-ranked client-side using `scoreTrailer()` function
- Top genres sent to `fetch-trailers` edge function for server-side personalization

### YouTube Player
- Uses YouTube IFrame API (`YT.Player`)
- Players created for current, previous, and next trailer (preloading)
- Thumbnail overlay shown until video starts playing
- Player vars: autoplay, mute, no controls, no branding, loop, inline

### Info Pane (30dvh)
- Draggable (drag down to dismiss)
- Shows: Poster, title, rating, year, genres, synopsis (2-line clamp)
- Actions: Save | Share | Details (white button)
- Close button (X) top-right

### Movie Detail Overlay (Full-screen)
- Slides up from bottom (spring animation)
- Backdrop hero image with gradient overlay
- Poster, title, tagline, rating, year, runtime, genres
- Overview text
- Save & Share buttons
- Cast section (horizontal scroll, 8 cast members)
- Similar Movies section (horizontal scroll)
- "Back to Trailer" button at bottom

### Data Fetching
- Fetches from `fetch-trailers` Supabase edge function
- Infinite scroll: fetches next page when idx >= trailers.length - 3
- Supports personalized mode (sends top liked genres) or trending mode

---

## 10. Expanded Movie View

**File: `src/components/ExpandedMovieView.tsx`**

### Overview
Full-screen modal overlay for movie details, triggered from any movie card click.

### Features
- **URL-driven**: Movie ID in URL params (`?movie=123`) for proper browser history
- **Internal navigation stack**: Can browse similar movies, with back button going through history
- **Swipe-to-go-back** gesture support (swipe right = back)
- **Sections**: Backdrop image, poster, title/tagline, rating/year/runtime, genres, overview, trailer, watch providers, cast, similar movies, reviews
- **Actions**: Save to watchlist, mark as watched, share, add to collection, download poster
- **Watch providers** (collapsible): Flatrate (streaming), Rent, Buy — with logos and links
- **Cast**: Horizontal scroll with profile photos, names, characters — click navigates to Person page
- **Similar Movies**: Grid below reviews — click opens new movie in the same modal (stack navigation)
- **Reviews**: Enhanced review section with reactions and reply threads

### Data Source
- Fetches from `movie-details` Supabase edge function
- Returns: title, tagline, overview, releaseDate, runtime, rating, voteCount, posterUrl, backdropUrl, genres, budget, revenue, productionCompanies, cast, trailerKey, similarMovies, watchProviders

---

## 11. AI Search

**File: `src/components/AISearch.tsx`**

### Overview
Natural language movie search — describe a movie and AI finds it.

### Features
- **Typewriter placeholder** cycling through example queries:
  - "A blue alien named Jaduu with Hrithik Roshan"
  - "Romantic movie set in Europe with a train journey"
  - "Sci-fi with time loops and a strong female lead"
  - "Dark thriller about a missing girl in a small town"
- Text input with search button
- Calls `ai-search` Supabase edge function
- Returns movies with `matchReason`, `surpriseReason`, `confidence`
- Results shown as cards with poster, title, year, rating, match reason
- Each card clickable to open ExpandedMovieView

---

## 12. Movie Search (Text Search)

**File: `src/components/MovieSearch.tsx`**

### Overview
Traditional text-based movie search using TMDB search API.

### Features
- Search input with debounced queries
- Calls `search-movies` Supabase edge function
- Results displayed as movie cards
- Full-screen search overlay available (via Header search button)

**File: `src/components/FullScreenSearch.tsx`**
- Full-screen overlay with large search input
- Keyboard shortcut support
- Results update as you type

---

## 13. Watchlist & Collections

### Watchlist
**File: `src/hooks/useWatchlist.ts`**

- Stores movies via `user-data` Supabase edge function
- Functions: `addToWatchlist`, `removeFromWatchlist`, `isInWatchlist`
- Data persisted per user in Supabase
- Accessible from Watchlist page, movie detail modal, trailer actions

### Collections
**File: `src/hooks/useCollections.ts`**

- Users can create named collections (e.g., "Date Night", "Comfort Movies")
- Each collection has: name, description, mood tag, movies
- Mood-based color accents

### Watchlist Page
**File: `src/pages/Watchlist.tsx`**

- **Tabs**: Watchlist | Collections
- **View modes**: Grid | List | Compact
- **Sort options**: Date, Rating, Title, Custom, Year
- **Search filter** within watchlist
- **Drag-to-reorder** (using @dnd-kit)
- **Collection cards** with stacked poster fan layout

### Collection Card Design
**File: `src/components/collections/CollectionCard.tsx`**

- **Stacked poster fan**: 3 posters overlapping at angles (-8°, 0°, +8°)
- Mood-colored accent borders (based on collection mood tag)
- Film count badge
- Hover effect: lift + shadow increase
- Actions dropdown: Edit, Share, Delete

### Collection Detail Dialog
**File: `src/components/collections/CollectionDetailDialog.tsx`**

- Shows all movies in collection
- Grid layout with poster, title, rating
- Remove movie from collection
- Share collection link

---

## 14. User Profile

**File: `src/pages/Profile.tsx`**

### Features
- **Avatar**: Emoji picker (20 options) or image upload
- **Display info**: Name, bio, favorite quote, favorite director, movie personality
- **Accent color picker** (10 color options)
- **Favorite genres** selection (12 options)
- **Stats cards**: Watchlist count, followers, following
- **Social feed**: User's activity feed
- **Edit mode**: Toggle to edit all profile fields
- **Data export**: Download all user data
- **Account deletion**: With confirmation dialog
- **Public profile toggle**: Privacy setting
- **Guest view**: Limited features shown for non-authenticated users

### Local Storage Profile
Profile data is stored in localStorage (`moodflix_profile`) with these fields:
```typescript
interface LocalProfile {
  display_name: string;
  favorite_genres: string[];
  selected_moods: string[];
  avatar_emoji: string;
  avatar_image: string | null;
  accent_color: string;
  bio: string;
  favorite_quote: string;
  favorite_director: string;
  movie_personality: string;
  social_link: string;
}
```

### Movie Personalities
- "🎬 The Cinephile", "🍿 Casual Viewer", "🎭 Drama Lover", "⚡ Action Junkie", "🌙 Night Owl Binger", "📚 Story Seeker", "🎪 Genre Explorer", "🌟 Blockbuster Fan"

---

## 15. User Insights

**File: `src/pages/UserInsights.tsx`**

### Overview
Personal viewing statistics dashboard with poster generation feature.

### Stats Computed
- Total watchlist items, reviews, watched movies
- Average rating
- Top 5 moods (from mood_selections table)
- Rating distribution (1-10)
- Monthly activity (last 6 months)
- Total collections & movies in collections
- Active days count

### Poster Generation
- Uses `html2canvas` to capture a styled poster div
- **Poster design**: Dark gradient background, key stats (movies watched, avg rating, top moods), rating chart, user name
- **Actions**: Download as PNG, Share

### Data Sources
- Supabase tables: `reviews`, `watch_history`, `mood_selections`, `collections`

---

## 16. Community Page

**File: `src/pages/Community.tsx`**

### Features
- **User discovery**: Browse other MoodFlix users
- **Search**: Filter users by display name
- **Tabs**: Discover | Following | Followers
- **User cards**: Avatar, name, bio, favorite genres, follow/unfollow button
- **Follow system**: Uses `user_follows` Supabase table
- **Sign-in prompt**: For non-authenticated users

---

## 17. Mood Assessment Flow

**File: `src/components/assessment/AssessmentFlow.tsx`**

### Overview
Interactive quiz to determine user's movie mood archetype.

### Questions (7 total, client-side mock data)
1. What's your ideal movie night setup? (Cozy/Fun/Emotional/High Energy)
2. Which language movies do you prefer? (Multi-select: English/Hindi/Korean/Japanese/Spanish/Mixed)
3. What kind of movies do you enjoy? (Commercial/Indie/Thought-Provoking/Fast-Paced/Comfort/Experimental)
4. How are you feeling right now? (Light/Intense/Romantic/Adventurous/Reflective)
5. Pick a movie era (Classic/90s/2000s/Modern/Latest/Timeless)
6. What's your comfort movie snack? (Popcorn/Ice Cream/Nachos/Fruit/Nothing)
7. Ideal movie length? (<90min/90-120/120-150/150+/Doesn't matter)

### Results
- **MoodBoardResults** component with carousel slides:
  - MoodIntroSlide — animated intro
  - MoodArchetypeSlide — your mood archetype
  - MoodTraitsSlide — personality traits
  - MoodRecommendationsSlide — movie recommendations based on assessment

---

## 18. Person Page

**File: `src/pages/Person.tsx`**

### Overview
Actor/Director detail page with filmography.

### Features
- **Hero section**: Profile photo, name, biography, birthday, birthplace
- **Social links**: Instagram, Twitter, Facebook, IMDB
- **Filmography tabs**: Acting | Directing/Crew
- **Movie cards**: Poster, title, character/role, year, rating
- **Sorting**: By popularity, year, rating
- **Expandable biography** (show more/less)
- **Breadcrumb navigation**: Home → Person Name
- **Click movie** → opens ExpandedMovieView

### Data Source
- `person-details` Supabase edge function (TMDB person API)

---

## 19. Admin Dashboard

**File: `src/pages/AdminDashboard.tsx`**

### Access Control
- Admin role verified via `useAdminAuth` hook
- Protected by `AdminProtectedRoute` component
- Roles: `admin`, `super_admin`

### Sections (sidebar navigation)
| Section | Component | Description |
|---------|-----------|-------------|
| Overview | `OverviewSection` | Key metrics, stat cards |
| Mood Insights | `MoodInsightsSection` | Mood selection analytics |
| User Activity | `UserActivitySection` | User engagement metrics |
| Watchlist Stats | `WatchlistStatsSection` | Most watchlisted movies |
| Reviews Stats | `ReviewsStatsSection` | Review analytics |
| User Sessions | `UserSessionsSection` | Active sessions |
| User Management | `UserManagementSection` | User list/management |
| Engagement | `EngagementAnalyticsSection` | Detailed engagement data |
| Site Editor | `SiteEditorSection` | Visual site customization |
| System Settings | `SystemSettingsSection` | System configuration |

### Components
- `AdminSidebar` — collapsible sidebar navigation
- `AdminHeader` — top bar with filters
- `StatCard` — metric display card
- `MoodTrendsChart` — mood trend visualization
- `RealTimeStatsPanel` — live stats panel
- `TopMoviesCard` — most popular movies card

---

## 20. Header & Navigation

**File: `src/components/Header.tsx`**

### Design
- Fixed top bar, transparent → glass morphism on scroll
- **Logo**: `logo.svg` (light mode), `moodflix-logo-new.svg` (dark mode)
- Height: h-14

### Desktop Navigation
| Link | Icon | Path |
|------|------|------|
| Home | Home | `/` |
| Watchlist | Bookmark | `/watchlist` |
| Community | Users | `/community` |
| Profile | User | `/profile` |
| Mood Match | Sparkles | `/assessment` |
| Discover | Filter | (opens Discovery Drawer, only on homepage) |
| Admin | Shield | `/admin/dashboard` (only for admin users) |

### Right Side Icons
- **Trailer Reels** (Clapperboard icon) → `/trailers`
- **Search** (Search icon) → Opens FullScreenSearch overlay
- **Accent Color Picker** (desktop only)
- **Theme Toggle** (desktop only)
- **Sign In/Out** button

### Mobile
- Hamburger menu → slides in from right (w-64)
- Includes all nav links + theme controls + sign in/out

---

## 21. Discovery Drawer

**File: `src/components/DiscoveryDrawer.tsx`**

### Features
- Slide-in drawer from the right
- **Hidden Gems Toggle**: Filter for lesser-known movies (rating 6-7.8, vote count < 500)
- **Runtime Slider**: Set maximum movie runtime (0-240 minutes)
- **Date Night Mixer**: Select moods for both partners → get combined recommendations

### Filter Types
```typescript
interface DiscoveryFilters {
  hiddenGems: boolean;
  maxRuntime: number;        // 0-240
  dateNightMoods: [string, string] | null;  // [mood1, mood2]
}
```

### Sub-components
- `HiddenGemsToggle` — toggle with gem icon
- `RuntimeSlider` — slider with time display
- `DateNightMixer` — dual mood selector

---

## 22. Theme System

### Theme Provider
**File: `src/components/ThemeProvider.tsx`** — wraps `next-themes` ThemeProvider

### Theme Toggle
**File: `src/components/ThemeToggle.tsx`** — Sun/Moon icon button

### Accent Color Picker
**File: `src/components/AccentColorPicker.tsx`** — Color swatch picker (10 colors)

### CSS Variables (Light Mode)
```css
--background: 0 0% 99%;        /* Near white */
--foreground: 0 0% 6%;         /* Near black */
--card: 0 0% 100%;             /* White */
--primary: 0 0% 6%;            /* Black */
--secondary: 0 0% 96%;         /* Light gray */
--muted: 0 0% 95%;             /* Gray */
--muted-foreground: 0 0% 42%;  /* Medium gray */
--border: 0 0% 91%;            /* Light border */
--radius: 0.625rem;            /* 10px */
```

### CSS Variables (Dark Mode)
```css
--background: 220 10% 8%;       /* Dark blue-gray (NOT pure black) */
--foreground: 210 10% 96%;      /* Light gray */
--card: 220 10% 10%;            /* Slightly lighter */
--secondary: 220 8% 14%;        /* Dark secondary */
--muted-foreground: 215 8% 55%; /* Medium gray */
--border: 220 8% 18%;           /* Dark border */
```

### Custom Tokens
- Mood colors: happy(yellow), sad(blue), romantic(pink), excited(orange), nostalgic(brown), stressed(teal), bored(purple)
- Shadow presets: glow, card, card-hover
- Gradient presets: gradient-cinema, gradient-gold

### Fonts
| Token | Font |
|-------|------|
| `font-display` | Space Grotesk |
| `font-sans` | Open Sans |
| `font-mono` | Roboto Mono |
| `font-serif` | Playfair Display |

---

## 23. Supabase Edge Functions

All located in `frontend/supabase/functions/`:

| Function | Purpose | Called From |
|----------|---------|-------------|
| `recommend-movies` | Get mood-based movie recommendations from TMDB | Index page, mood selector |
| `trending-movies` | Fetch trending/popular movies | Index page, carousel |
| `fetch-trailers` | Fetch movie trailers with YouTube keys | Trailers page |
| `movie-details` | Full movie details (cast, similar, providers) | ExpandedMovieView, Trailer detail |
| `search-movies` | Text search via TMDB | MovieSearch, FullScreenSearch |
| `ai-search` | AI-powered natural language movie search | AISearch component |
| `person-details` | Actor/director details + filmography | Person page |
| `key-auth` | Key-based authentication (signup/signin/verify) | Auth system |
| `user-data` | User data CRUD (watchlist, profile, etc.) | Watchlist, Profile hooks |
| `admin-setup` | Admin role management | Admin system |

---

## 24. FastAPI Backend (MongoDB)

**File: `backend/server.py`**

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/` | Health check → `{"message": "MoodFlix API v2"}` |
| POST | `/api/status` | Create status check |
| GET | `/api/status` | List status checks |
| POST | `/api/interactions` | Track single user interaction |
| POST | `/api/interactions/batch` | Track batch interactions |
| POST | `/api/recommend/rank` | Re-rank trailer candidates for a user |
| GET | `/api/recommend/profile/{user_id}` | Get user's recommendation profile |
| POST | `/api/referral/create` | Create referral code for user |
| POST | `/api/referral/use` | Use a referral code |
| POST | `/api/referral/add-points` | Add points for an action |
| GET | `/api/referral/stats/{user_id}` | Get user's referral stats |
| GET | `/api/referral/leaderboard` | Top 20 referrers |
| POST | `/api/share/mood-card` | Create shareable mood card |
| GET | `/api/share/mood-card/{card_id}` | Get mood card by ID |

### Interaction Tracking System
- Tracks: like, unlike, save, unsave, share, skip, watch, info_view, detail_view
- Updates user profile incrementally with genre affinity scores
- Genre scores weighted by interaction type (like: +3, save: +2.5, share: +2, skip: -1, etc.)
- Watch duration bonus: >50% watched gets extra genre boost

### Recommendation Ranking Algorithm
Scores trailers by:
1. **Genre affinity** (0-40 pts) — from user's interaction history
2. **Mood match** (0-20 pts) — current mood genre boosts
3. **Rating quality** (0-15 pts) — closeness to user's average rating preference
4. **Freshness** (0-10 pts) — newer movies score higher
5. **Interaction history** — penalties for watched (-15) and skipped (-20), small boost for liked (+5)
6. **Diversity** (0-5 pts) — slight randomness to avoid staleness

### Referral System
- Codes: `MOOD` + first 6 chars of MD5 hash of user_id
- Points: signup_referral(50), daily_streak(10), first_watchlist(20), share_mood_card(15), invite_accepted(100)
- Badges: Starter(0), Explorer(100), Curator(300), Influencer(500), Legend(1000)

### Mood-Genre Affinity Map
```python
{
  "happy": {Comedy: 1.5, Family: 1.3, Animation: 1.3, Music: 1.2, Romance: 1.1},
  "sad": {Drama: 1.5, Romance: 1.3, Music: 1.2, History: 1.1},
  "excited": {Action: 1.5, Adventure: 1.4, Sci-Fi: 1.3, Fantasy: 1.2, Thriller: 1.1},
  "romantic": {Romance: 1.6, Drama: 1.3, Comedy: 1.2, Music: 1.1},
  "scared": {Horror: 1.5, Thriller: 1.4, Mystery: 1.3, Sci-Fi: 1.1},
  "chill": {Comedy: 1.3, Animation: 1.3, Family: 1.2, Documentary: 1.2, Music: 1.1},
  "angry": {Action: 1.5, Thriller: 1.4, Crime: 1.3, War: 1.2},
  "nostalgic": {Drama: 1.3, Family: 1.3, Comedy: 1.2, Romance: 1.2, Animation: 1.1},
  "curious": {Documentary: 1.5, Sci-Fi: 1.4, Mystery: 1.3, History: 1.2, Fantasy: 1.1},
  "adventurous": {Adventure: 1.5, Action: 1.4, Fantasy: 1.3, Sci-Fi: 1.2, Western: 1.1},
  ...
}
```

---

## 25. Database Schema (Supabase Tables)

Based on migrations, the app uses these Supabase tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (user_id, display_name, avatar_url, bio, favorite_genres) |
| `watchlists` | User watchlist items |
| `reviews` | Movie reviews with ratings |
| `watch_history` | Movies marked as watched |
| `mood_selections` | User mood selection history |
| `collections` | Named movie collections |
| `collection_movies` | Movies within collections |
| `user_follows` | Follow relationships (follower_id, following_id) |
| `user_sessions` | Authentication sessions |
| `admin_roles` | Admin role assignments |
| `assessment_results` | Mood assessment results |
| `engagement_events` | User engagement tracking |

---

## 26. SVG Assets

Located in `src/assets/`:

### Mood SVGs (Orange hand-drawn faces)
- `mood-happy.svg`, `mood-sad.svg`, `mood-romantic.svg`, `mood-chill.svg`
- `mood-relaxed.svg`, `mood-motivated.svg`, `mood-bored.svg`, `mood-inspired.svg`
- `mood-angry.svg`, `mood-anxious.svg`, `mood-thrilled.svg`, `mood-nostalgic.svg`
- Also: `mood-excited.svg`, `mood-adventurous.svg`, `mood-stressed.svg` (extras)

### Hero Illustration SVGs
- `hero-brain-new.svg` — Brain/neural network illustration (main hero visual)
- `hero-camera-new.svg` — Camera icon (floating accessory)
- `hero-popcorn-new.svg` — Popcorn icon (floating accessory)
- `hero-juice-new.svg` — Juice/drink icon (floating accessory)
- `hero-reel-new.svg` — Film reel icon (floating accessory)
- Also older versions: `hero-brain.svg`, `hero-camera.svg`, `hero-popcorn.svg`, `hero-juice.svg`, `hero-reel.svg`

### Logo SVGs
- `logo.svg` — Main logo (light mode)
- `moodflix-logo-new.svg` — Updated logo (dark mode / trailers)
- `moodflix-logo-dark.svg` — Dark variant
- `moodflix-logo.svg` — Original logo

### Other Assets
- `hero-reference.png` — Design reference image
- `img_20260130_165233_047.jpg` — Additional asset

---

## 27. CSS Design Tokens & Styling

**File: `src/index.css`**

### Key Patterns
- **Glass morphism**: `bg-background/90 backdrop-blur-md`
- **Card shadows**: `shadow-card` (2px 8px), `shadow-card-hover` (12px 32px)
- **Scrollbar hide**: `.scrollbar-hide` utility class
- **Scroll snap**: Used in trailers for `scroll-snap-type: y mandatory`
- **Gradient backgrounds**: Radial gradient blobs for hero background
- **Theme transitions**: Smooth 0.2s transitions on theme change

### Font Stack
```css
--font-sans: "Open Sans", ui-sans-serif, system-ui, sans-serif;
--font-serif: "Playfair Display", ui-serif, Georgia;
--font-mono: "Roboto Mono", ui-monospace, SFMono-Regular;
```

Display font (headings): `Space Grotesk` (loaded via Google Fonts in index.html)

---

## 28. Lovable Compatibility Requirements

### Root `package.json` MUST have:
```json
{
  "name": "moodflix",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": { ... },
  "devDependencies": {
    "lovable-tagger": "^1.1.13",
    "vite": "^5.4.x",
    ...
  }
}
```

### Root `vite.config.ts` must resolve `@/` to `./frontend/src/`:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./frontend/src"),
  },
},
```

### Root `tsconfig.json` paths must point to `./frontend/src/*`:
```json
"paths": {
  "@/*": ["./frontend/src/*"]
}
```

### Root `tailwind.config.ts` content must include:
```typescript
content: [
  "./frontend/src/**/*.{ts,tsx}",
  "./frontend/components/**/*.{ts,tsx}",
],
```

### Root `components.json` CSS path:
```json
"css": "frontend/src/index.css"
```

### Required root-level config files:
- `package.json` (with scripts + type: module)
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `eslint.config.js`
- `index.html` (with `<script type="module" src="/src/main.tsx">`)

### Root `src/main.tsx`:
```typescript
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";
createRoot(document.getElementById("root")!).render(<App />);
```

---

## Additional Components Reference

### Sharing System
- `src/components/sharing/ShareDrawer.tsx` — Share options drawer
- `src/components/sharing/ShareableCard.tsx` — Shareable movie card
- `src/components/sharing/EnhancedShareableCard.tsx` — Enhanced version
- `src/components/sharing/MinimalShareButton.tsx` — Compact share button

### Review System
- `src/components/reviews/EnhancedReviewSection.tsx` — Review list with reactions
- `src/components/reviews/ReviewReactionButtons.tsx` — Like/helpful reactions
- `src/components/reviews/ReviewReplyThread.tsx` — Threaded replies

### Gamification
- `src/components/gamification/index.ts` — Gamification components

### UI Components (shadcn/ui)
Full set of shadcn/ui components in `src/components/ui/`:
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, loading-skeleton, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip

### Custom Hooks
| Hook | Purpose |
|------|---------|
| `useAuth` | Unified auth interface |
| `useKeyAuth` | Key-based auth core |
| `useWatchlist` | Watchlist CRUD |
| `useCollections` | Collections CRUD |
| `useMovieRecommendations` | Movie rec engine |
| `useWatchHistory` | Watch history tracking |
| `useReviews` / `useEnhancedReviews` | Review system |
| `useFollows` | Follow/unfollow users |
| `useProfile` | User profile management |
| `useSocialPosts` | Social feed posts |
| `useSwipeGesture` | Touch swipe detection |
| `useEngagementTracking` | Track user engagement events |
| `useAdminAuth` / `useAdminRole` | Admin role checking |
| `useAdminAnalytics` / `useEnhancedAdminAnalytics` | Admin data |
| `useRealTimeAnalytics` | Live stats polling |
| `useSiteEditor` | Site customization |
| `useHistoryState` | Browser history state |
| `useProgressiveImage` | Lazy image loading |
| `useVirtualizedGrid` | Virtualized list rendering |
| `use-mobile` | Mobile breakpoint detection |
| `use-toast` | Toast notification hook |

---

*This document contains everything needed to rebuild MoodFlix with all its current features and design details.*

# MoodFlix Feature Documentation
## Complete Guide to Today's Implementations

> **Last Updated:** February 1, 2026  
> **Purpose:** Reference documentation for reproducing all active features

---

## Table of Contents

1. [Mood Button System](#1-mood-button-system)
2. [Authentication Experience (White Theme)](#2-authentication-experience-white-theme)
3. [Full-Screen Search Overlay](#3-full-screen-search-overlay)
4. [Cinematic Image Carousel](#4-cinematic-image-carousel)
5. [Premium Dark Mode Theme](#5-premium-dark-mode-theme)
6. [Reviews System](#6-reviews-system)
7. [Library & Collections](#7-library--collections)
8. [Data Layer Architecture](#8-data-layer-architecture)
9. [Quick Reference Prompts](#9-quick-reference-prompts)

---

## 1. Mood Button System

### Location
- `src/components/MoodSelector.tsx`

### Feature Overview
12 mood buttons arranged in a responsive grid with dynamic hover animations, lively visual feedback, and morphing label transitions.

### Design Specifications

**Grid Layout:**
- Mobile: 2 columns
- Tablet: 3 columns  
- Desktop: 4 columns
- Gap: `gap-4 sm:gap-5 lg:gap-6`

**Button Size:**
- Width/Height: `140px × 140px` (increased from 120px for presence)

**Color Palette:**
- Primary orange: `#f15e3d` / `rgba(241, 94, 61, x)`
- Border dark: `#2D3436`
- Border stroke width: `6px`

### Animation Specifications

**Entry Animation:**
```tsx
initial={{ opacity: 0, scale: 0.85, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{
  delay: index * 0.05,  // Staggered entry
  duration: 0.5,
  ease: [0.23, 1, 0.32, 1]  // Custom easing
}}
```

**Hover State:**
```tsx
animate={{
  scale: isPressed ? 0.9 : isHovered ? 1.08 : isSelected ? 1.02 : 1,
  y: isPressed ? 4 : isHovered ? -6 : 0,  // Lift effect
  rotate: isHovered ? [0, -1, 1, 0] : 0,  // Wiggle animation
}}
transition={{
  type: "spring",
  stiffness: 350,
  damping: 22,
  mass: 0.9,
}}
```

**Shadow System:**
```tsx
filter: isHovered 
  ? "drop-shadow(0 12px 24px rgba(241, 94, 61, 0.4)) drop-shadow(0 4px 8px rgba(0,0,0,0.15))" 
  : isSelected 
    ? "drop-shadow(0 8px 20px rgba(241, 94, 61, 0.35)) drop-shadow(0 3px 6px rgba(0,0,0,0.1))"
    : "drop-shadow(0 4px 12px rgba(0,0,0,0.08)) drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
```

**4-Step Animation Sequence:**
1. **Default State:** Full SVG button with icon and label visible
2. **Hover Triggered:** Icon fades out with `opacity: 0, scale: 0.92`
3. **Border Appears:** Dark `#2D3436` border stroke (6px) appears on orange blob
4. **Label Morphs Up:** Text squeezes into button area with spring physics

**Label Morph Animation:**
```tsx
initial={{ y: 50, opacity: 0, scale: 0.75, filter: "blur(4px)" }}
animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
transition={{
  type: "spring",
  stiffness: 300,
  damping: 24,
  mass: 0.85,
}}
```

**Character-by-Character Reveal:**
```tsx
{mood.label.split("").map((char, i) => (
  <motion.span
    key={i}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: i * 0.012,  // 12ms per character
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1],
    }}
  >
    {char}
  </motion.span>
))}
```

**Blob SVG Coordinates (exact match):**
```tsx
<svg viewBox="0 0 384 384">
  <rect
    x="26"
    y="51"
    width="320"
    height="194"
    rx="50"
    ry="50"
    fill="#f15e3d"
  />
  <rect
    x="26"
    y="51"
    width="320"
    height="194"
    rx="50"
    ry="50"
    fill="none"
    stroke="#2D3436"
    strokeWidth="6"
  />
</svg>
```

### Prompt for AI Recreation
> "Create a mood selector with 12 buttons (140px × 140px) in a responsive grid (2/3/4 columns). Each button should lift up 6px on hover with a wiggle rotation animation. Add layered coral-orange drop shadows (rgba 241,94,61,0.4). Implement a 4-step animation where on hover: (1) icon fades out with scale 0.92, (2) orange blob (x=26, y=51, w=320, h=194, rx=50) stays visible, (3) dark 6px #2D3436 border reveals with delay, (4) label morphs upward into blob area with spring physics (stiffness 300, damping 24, mass 0.85). Include character-by-character text reveal with 12ms stagger. Use framer-motion AnimatePresence for smooth state transitions."

---

## 2. Authentication Experience (White Theme)

### Location
- `src/pages/Auth.tsx` - Main auth page (WHITE THEME)
- `src/components/auth/PersonaForm.tsx` - Signup form
- `src/components/auth/KeyLoginForm.tsx` - Login form
- `src/components/auth/KeyRevealCard.tsx` - Secret key display

### Feature Overview
Clean, minimal white-themed authentication with high contrast, visible form fields, and smooth step transitions.

### Design Specifications

**Page Background:**
```tsx
<div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
```

**Color Scheme (White Theme):**
- Background: Pure white (`bg-white`)
- Primary text: `text-neutral-900`
- Secondary text: `text-neutral-500`
- Muted text: `text-neutral-400`
- Form container: `bg-neutral-50 border-neutral-200`
- Primary button: `bg-neutral-900 text-white`
- Secondary button: `bg-neutral-100 border-neutral-200 text-neutral-700`
- Loading spinner: `text-neutral-400`

**Logo Placement:**
```tsx
<img
  src={logo}
  alt="MoodFlix"
  className="h-14 w-auto mx-auto"  // Choice screen
  // or h-10 for sub-screens
/>
```

**Choice Screen Layout:**
```tsx
<div className="w-full max-w-sm">
  <div className="space-y-8">
    {/* Logo */}
    <div className="text-center">
      <img className="h-14 w-auto mx-auto mb-8" />
      
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Welcome Back
      </h1>
      
      <p className="text-neutral-500 mt-2 text-base">
        Sign in with your secret key or create a new account
      </p>
    </div>
    
    {/* Buttons */}
    <div className="space-y-3 pt-4">
      <button className="w-full py-4 px-6 rounded-xl bg-neutral-900 text-white font-medium">
        Sign In with Key
      </button>
      
      <button className="w-full py-4 px-6 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 font-medium">
        Create New Account
      </button>
    </div>
    
    {/* Guest link */}
    <div className="text-center pt-4">
      <button className="text-sm text-neutral-500 hover:text-neutral-900">
        Continue as Guest →
      </button>
    </div>
  </div>
</div>
```

**Form Container Styling:**
```tsx
<div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
  {/* Form content */}
</div>
```

**Page Transitions:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    {/* Step content */}
  </motion.div>
</AnimatePresence>
```

**Close Button:**
```tsx
<motion.button
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
  onClick={() => navigate("/")}
  className="absolute top-5 right-5 z-50 p-2 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-all"
>
  <X className="w-5 h-5" />
</motion.button>
```

**Back Button (Sub-steps):**
```tsx
<button
  onClick={() => setStep("choice")}
  className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm inline-flex items-center gap-2"
>
  <ArrowLeft className="w-4 h-4" />
  <span>Back</span>
</button>
```

**Footer Security Info:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6 }}
  className="px-6 pb-8 text-center"
>
  <div className="flex items-center justify-center gap-2 mb-3">
    <Shield className="w-4 h-4 text-neutral-400" />
    <span className="text-xs text-neutral-500">Secure & Private</span>
  </div>
  <p className="text-neutral-400 text-xs leading-relaxed max-w-xs mx-auto">
    Your data is encrypted and stored securely. We never share your information.
  </p>
</motion.div>
```

### Auth Flow Steps
1. **choice** - Primary selection: Sign In or Create Account
2. **signup-persona** - Collect user details (name, DOB, gender, purpose)
3. **signup-key** - Display generated secret key with copy functionality
4. **login** - Enter secret key to sign in

### Prompt for AI Recreation
> "Create a minimal white-themed authentication page. Pure white background (`bg-white`). Centered layout with max-w-sm container. Logo at top (h-14), title 'Welcome Back' in text-2xl font-bold text-neutral-900, subtitle in text-neutral-500. Two stacked buttons: primary (`bg-neutral-900 text-white py-4 rounded-xl`) for Sign In, secondary (`bg-neutral-100 border-neutral-200 text-neutral-700`) for Create Account. 'Continue as Guest' link below. Forms wrapped in `bg-neutral-50 rounded-2xl border-neutral-200 p-6` containers. Use AnimatePresence for step transitions with y:20→0→-20 animation. Close button top-right with `bg-neutral-100` hover state. Footer with Shield icon and privacy text. High contrast everywhere - no dark mode considerations."

---

## 3. Full-Screen Search Overlay

### Location
- `src/components/FullScreenSearch.tsx`
- `src/components/Header.tsx` (integration)

### Feature Overview
Apple TV+ inspired full-screen search overlay with smooth animation, debounced search, trending grid, and movie detail integration.

### Design Specifications

**Overlay Animation Variants:**
```tsx
const overlayVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
};

const contentVariants = {
  closed: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: "easeIn" as const,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: 0.1,
      ease: "easeOut" as const,
    },
  },
};
```

**Full-Screen Container:**
```tsx
<motion.div
  className="fixed inset-0 z-[100] bg-background"
  variants={overlayVariants}
  initial="closed"
  animate="open"
  exit="closed"
>
```

**Header with Search Bar:**
```tsx
<div className="sticky top-0 z-10 bg-background border-b border-border">
  <div className="max-w-4xl mx-auto px-4 py-4">
    <div className="flex items-center gap-3">
      {/* Back button */}
      <button className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Search input */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Search movies, shows..."
        />
        {/* Clear button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-secondary"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Cancel */}
      <button className="text-sm font-medium text-primary hover:text-primary/80">
        Cancel
      </button>
    </div>
  </div>
</div>
```

**Search Result Row:**
```tsx
<motion.button
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.03 }}
  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left group"
>
  {/* Poster thumbnail */}
  <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
    <img className="w-full h-full object-cover" />
  </div>

  {/* Movie info */}
  <div className="flex-1 min-w-0">
    <h3 className="font-semibold text-foreground truncate group-hover:text-primary">
      {movie.title}
    </h3>
    <p className="text-sm text-muted-foreground mt-0.5">
      {movie.genre} · {movie.year}
    </p>
  </div>
</motion.button>
```

**Trending Grid (Default State):**
```tsx
<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
  <motion.button
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.03 }}
    className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-muted"
  >
    <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
    
    {/* Hover overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white text-sm font-semibold line-clamp-2">
          {movie.title}
        </h3>
      </div>
    </div>
  </motion.button>
</div>
```

**Debounced Search Implementation:**
```tsx
useEffect(() => {
  if (query.trim().length < 2) {
    setResults([]);
    return;
  }

  const debounceTimer = setTimeout(async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-movies", {
        body: { query: query.trim() },
      });
      if (!error) {
        setResults(data.movies || []);
      }
    } finally {
      setIsSearching(false);
    }
  }, 300);  // 300ms debounce

  return () => clearTimeout(debounceTimer);
}, [query]);
```

**Keyboard & Scroll Lock:**
```tsx
// Escape to close
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen && !isExpanded) {
      onClose();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isOpen, isExpanded, onClose]);

// Prevent body scroll when open
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => { document.body.style.overflow = ""; };
}, [isOpen]);
```

**Header Integration:**
```tsx
// In Header.tsx
const [isSearchOpen, setIsSearchOpen] = useState(false);

<button onClick={() => setIsSearchOpen(true)}>
  <Search className="w-5 h-5" />
</button>

<FullScreenSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
```

### Prompt for AI Recreation
> "Create a full-screen search overlay component. Use framer-motion AnimatePresence with opacity fade for overlay (0.3s) and y:20→0 scale:0.98→1 for content (0.35s with 0.1s delay). Fixed inset-0 z-[100] with bg-background. Sticky header with max-w-4xl containing: back arrow button, rounded-xl h-12 search input with left Search icon and animated clear button, Cancel text button. Content area with max-height calc(100vh-80px) overflow-y-auto. Two states: (1) searching shows list results with 56×80px poster thumbnails in rounded-xl hover:bg-muted rows, (2) default shows 'Trending Now' grid 3/4/6 columns with aspect-[2/3] poster cards, hover:scale-105 with gradient overlay revealing title. Debounce search 300ms. Auto-focus input on open. Escape key and body scroll lock."

---

## 4. Cinematic Image Carousel

### Location
- `src/components/CinematicImageCarousel.tsx`

### Feature Overview
Apple TV+ inspired full-screen hero carousel with Ken Burns zoom effect, stable background transitions, touch-responsive swiping without page scroll, and premium Apple-style action buttons.

### Design Specifications

**Container:**
```tsx
<section
  className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden bg-black select-none"
  style={{ touchAction: "pan-y pinch-zoom" }}
  role="region"
  aria-label="Featured movies carousel"
>
```

**Ken Burns Background Animation:**
```tsx
const backgroundVariants = {
  enter: {
    scale: 1,
    opacity: 0,
  },
  center: {
    scale: 1.08,  // Slow zoom effect
    opacity: 1,
    transition: {
      scale: { duration: 12, ease: "linear" },  // 12 second zoom
      opacity: { duration: 0.8, ease: "easeOut" },  // Fast fade-in
    },
  },
  exit: {
    scale: 1.08,  // Maintain zoom on exit
    opacity: 0,
    transition: {
      opacity: { duration: 0.6, ease: "easeIn" },  // Fade out
    },
  },
};
```

**Background Layering:**
```tsx
<AnimatePresence mode="sync">
  <motion.div
    key={currentMovie.id}
    variants={backgroundVariants}
    initial="enter"
    animate="center"
    exit="exit"
  >
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backdropUrl})` }}
    />
    
    {/* Cinematic gradient overlays */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
  </motion.div>
</AnimatePresence>
```

**Content Animation:**
```tsx
const contentVariants = {
  enter: {
    opacity: 0,
    y: 60,
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],  // Smooth easing
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};
```

**Content Layout:**
```tsx
<motion.div className="max-w-7xl mx-auto px-5 md:px-12 pb-28 md:pb-36">
  {/* Genre tag */}
  <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/60 font-medium">
    {genre}
  </span>

  {/* Title */}
  <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.95] mb-4 md:mb-6 tracking-tight max-w-4xl">
    {title}
  </h2>

  {/* Meta info */}
  <div className="flex items-center gap-4 mb-5 md:mb-6 flex-wrap">
    <div className="flex items-center gap-1.5">
      <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
      <span className="text-sm md:text-base font-semibold text-white">{rating}</span>
    </div>
    <span className="w-1 h-1 rounded-full bg-white/40" />
    <span className="text-sm md:text-base text-white/80">{year}</span>
    <span className="w-1 h-1 rounded-full bg-white/40" />
    <span className="text-sm md:text-base text-white/60">2h 15m</span>
  </div>

  {/* Overview */}
  <p className="text-white/70 text-sm md:text-base lg:text-lg leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 max-w-2xl">
    {overview}
  </p>
</motion.div>
```

**Apple TV+ Action Buttons:**
```tsx
<div className="flex items-center gap-3 md:gap-4">
  {/* Play Trailer - Primary */}
  <Button
    size="lg"
    className="rounded-xl md:rounded-2xl px-6 md:px-10 h-12 md:h-14 gap-2.5 font-semibold text-sm md:text-base bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10 transition-all duration-300 hover:scale-[1.02]"
  >
    <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
    <span>Play Trailer</span>
  </Button>

  {/* My List - Secondary */}
  <Button
    variant="outline"
    size="lg"
    className="rounded-xl md:rounded-2xl px-5 md:px-8 h-12 md:h-14 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300"
  >
    <Plus className="w-5 h-5 md:w-6 md:h-6" />
    <span className="hidden sm:inline">My List</span>
  </Button>

  {/* Mute Toggle */}
  <button
    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300"
  >
    {isMuted ? <VolumeX /> : <Volume2 />}
  </button>
</div>
```

**Progress Bar:**
```tsx
<div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10 z-50">
  <motion.div
    className="h-full bg-white"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.05, ease: "linear" }}
  />
</div>
```

**Thumbnail Filmstrip (Desktop):**
```tsx
<div className="hidden lg:flex items-center gap-2 p-2 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10">
  {movies.slice(0, slidesCount).map((movie, index) => (
    <button
      className={`
        relative w-16 h-24 rounded-xl overflow-hidden transition-all duration-400 ease-out
        ${index === currentIndex
          ? "ring-2 ring-white scale-105 opacity-100 shadow-lg shadow-white/20"
          : "opacity-40 hover:opacity-70 hover:scale-[1.02]"
        }
      `}
    >
      <img src={movie.posterUrl} className="w-full h-full object-cover" />
      {index === currentIndex && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
      )}
    </button>
  ))}
</div>
```

**Pagination Dots (Mobile):**
```tsx
<div className="flex items-center gap-2 lg:ml-auto">
  {movies.slice(0, slidesCount).map((_, index) => (
    <button
      className={`
        transition-all duration-400 ease-out rounded-full
        ${index === currentIndex
          ? "w-8 md:w-10 h-2 bg-white"  // Active: pill shape
          : "w-2 h-2 bg-white/30 hover:bg-white/50"  // Inactive: dot
        }
      `}
    />
  ))}
</div>
```

**Touch Gesture Handling (No Page Scroll):**
```tsx
const handleTouchStart = useCallback((e: React.TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
  touchStartY.current = e.touches[0].clientY;
  touchEndX.current = e.touches[0].clientX;
  isSwiping.current = false;
  pauseAutoPlay();
}, [pauseAutoPlay]);

const handleTouchMove = useCallback((e: React.TouchEvent) => {
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const diffX = Math.abs(currentX - touchStartX.current);
  const diffY = Math.abs(currentY - touchStartY.current);

  // If horizontal movement is dominant, prevent page scroll
  if (diffX > diffY && diffX > 10) {
    isSwiping.current = true;
    e.preventDefault();  // Prevents page scroll during horizontal swipe
  }

  touchEndX.current = currentX;
}, []);

const handleTouchEnd = useCallback(() => {
  if (!isSwiping.current) {
    resumeAutoPlayDelayed(3000);
    return;
  }

  const diff = touchStartX.current - touchEndX.current;
  const threshold = 40;

  if (diff > threshold) handleNext();
  else if (diff < -threshold) handlePrev();

  isSwiping.current = false;
  resumeAutoPlayDelayed(4000);
}, [handleNext, handlePrev, resumeAutoPlayDelayed]);

// Apply to container
style={{ touchAction: "pan-y pinch-zoom" }}
onTouchStart={handleTouchStart}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
```

**Navigation Arrows (Desktop):**
```tsx
<button
  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110 group"
>
  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:-translate-x-0.5" />
</button>
```

**Swipe Indicator (Mobile):**
```tsx
{isMobile && (
  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-white/40 text-xs">
    <ChevronLeft className="w-3 h-3" />
    <span>Swipe</span>
    <ChevronRight className="w-3 h-3" />
  </div>
)}
```

**Auto-play Logic:**
```tsx
const autoPlayInterval = 6000;  // 6 seconds per slide

// Progress bar update (50ms intervals)
useEffect(() => {
  if (!isAutoPlaying || slidesCount <= 1) return;

  const progressInterval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) return 0;
      return prev + (100 / (autoPlayInterval / 50));
    });
  }, 50);

  return () => clearInterval(progressInterval);
}, [currentIndex, isAutoPlaying, autoPlayInterval, slidesCount]);

// Resume after interaction
const resumeAutoPlayDelayed = useCallback((delay = 5000) => {
  clearAutoPlayTimeout();
  autoPlayTimeoutRef.current = setTimeout(() => {
    setIsAutoPlaying(true);
    setProgress(0);
  }, delay);
}, [clearAutoPlayTimeout]);
```

### Prompt for AI Recreation
> "Create a cinematic hero carousel with Ken Burns effect. Full viewport height (75-85vh) with bg-black. Background uses AnimatePresence mode='sync' with scale 1→1.08 over 12s (linear), opacity crossfade 0.8s. Layer 3 gradient overlays: vertical from-black via-40% to-20%, horizontal from-80% via-transparent to-60%, and top darkening. Content animates y:60→0 with 0.4s delay, spring easing [0.25,0.46,0.45,0.94]. Apple TV+ buttons: white Play Trailer with fill icon (h-14, rounded-2xl, shadow-white/10), glass My List (bg-white/10, border-white/20), round mute toggle. Progress bar at top (h-[3px] bg-white). Desktop: thumbnail filmstrip in glass container (rounded-2xl bg-black/50 backdrop-blur-xl) with ring-2 ring-white on active, opacity-40 on inactive. Mobile: pill dots (w-8 h-2 active, w-2 h-2 inactive). Touch gestures: prevent page scroll when horizontal swipe detected (diffX > diffY && diffX > 10), use touchAction: 'pan-y pinch-zoom'. Navigation arrows scale 1.1x on hover with slight translate. 6s auto-play, pause on hover/touch, resume after 3-5s. Use React.memo for performance."

---

## 5. Premium Dark Mode Theme

### Location
- `src/index.css` (CSS variables)
- `src/components/ThemeProvider.tsx` (theme context)
- `tailwind.config.ts` (Tailwind integration)

### Feature Overview
Premium greyish dark theme that replaces pure black with sophisticated warm dark tones for a more premium feel.

### Design Specifications

**Light Mode Variables (unchanged):**
```css
:root {
  --background: 0 0% 99%;
  --foreground: 0 0% 6%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 6%;
  --primary: 0 0% 6%;
  --primary-foreground: 0 0% 99%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 6%;
  --muted: 0 0% 95%;
  --muted-foreground: 0 0% 42%;
  --accent: 0 0% 6%;
  --accent-foreground: 0 0% 99%;
  --border: 0 0% 91%;
  --input: 0 0% 91%;
  --ring: 0 0% 6%;
  --radius: 0.625rem;
}
```

**Premium Greyish Dark Mode:**
```css
.dark {
  /* Premium greyish dark theme - not pure black */
  --background: 220 10% 8%;      /* Warm dark grey instead of pure black */
  --foreground: 210 10% 96%;     /* Slightly warm white */
  --card: 220 10% 10%;           /* Slightly elevated from background */
  --card-foreground: 210 10% 96%;
  --popover: 220 10% 10%;
  --popover-foreground: 210 10% 96%;
  --primary: 210 10% 96%;
  --primary-foreground: 220 10% 8%;
  --secondary: 220 8% 14%;       /* Elevated surface */
  --secondary-foreground: 210 10% 96%;
  --muted: 220 8% 14%;
  --muted-foreground: 215 8% 55%; /* Readable secondary text */
  --accent: 210 10% 96%;
  --accent-foreground: 220 10% 8%;
  --border: 220 8% 18%;          /* Subtle visible borders */
  --input: 220 8% 18%;
  --ring: 210 10% 96%;
  
  /* Glass effects */
  --glass-bg: hsl(220 10% 10% / 0.85);
  --glass-border: hsl(210 10% 100% / 0.06);
}
```

**Sidebar Dark Mode:**
```css
.dark {
  --sidebar-background: 220 10% 10%;
  --sidebar-foreground: 210 10% 96%;
  --sidebar-primary: 210 10% 96%;
  --sidebar-primary-foreground: 220 10% 8%;
  --sidebar-accent: 220 8% 14%;
  --sidebar-accent-foreground: 210 10% 96%;
  --sidebar-border: 220 8% 18%;
  --sidebar-ring: 210 10% 96%;
}
```

**Key Color Differences from Pure Black:**

| Token | Pure Black | Greyish Premium |
|-------|-----------|-----------------|
| background | 0 0% 0% | 220 10% 8% |
| card | 0 0% 5% | 220 10% 10% |
| muted | 0 0% 10% | 220 8% 14% |
| border | 0 0% 15% | 220 8% 18% |

**Theme Transition (Smooth Mode Switch):**
```css
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease !important;
}
```

**Glass Effect Utilities:**
```css
@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur, 8px));
    -webkit-backdrop-filter: blur(var(--glass-blur, 8px));
    border: 1px solid var(--glass-border);
  }
}
```

### Prompt for AI Recreation
> "Update CSS variables for premium dark mode. Replace pure black (#000) with warm greyish tones using HSL 220 10% base. Background: 220 10% 8%, card: 220 10% 10%, secondary/muted: 220 8% 14%, border: 220 8% 18%. Foreground text: 210 10% 96% (warm white). Muted foreground: 215 8% 55%. Add glass variables: --glass-bg: hsl(220 10% 10% / 0.85), --glass-border: hsl(210 10% 100% / 0.06). Include .theme-transition class with 0.2s ease for background-color, border-color, and 0.15s for color transitions. All values in HSL format for consistency."

---

## 6. Reviews System

### Location
- `src/components/ReviewSection.tsx`

### Feature Overview
Interactive 10-star rating system with review submission, editing, and display functionality.

### Design Specifications

**Star Rating Component:**
```tsx
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
  <motion.button
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.95 }}
  >
    <Star
      className={cn(
        "w-6 h-6",
        star <= displayValue 
          ? "fill-yellow-400 text-yellow-400" 
          : "text-muted-foreground/40"
      )}
    />
  </motion.button>
))}
```

**Rating Display Animation:**
```tsx
<motion.span 
  key={displayRating}
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
>
  {displayRating}<span className="text-muted-foreground text-base">/10</span>
</motion.span>
```

### Prompt for AI Recreation
> "10-star rating with scale hover, animated number display, sliding form, primary-tinted user card, staggered reviews list."

---

## 7. Library & Collections

### Location
- `src/pages/Watchlist.tsx`

### Feature Overview
Library with watchlist management, collections, search, sort, and grid/list view modes.

### Prompt for AI Recreation
> "Stats cards with colored icons, tabbed interface, search/sort/view controls, responsive grid with hover effects, list view, collection cards with create dialog."

---

## 8. Data Layer Architecture

### Overview
All user data flows through secure backend edge function (`user-data`) to bypass RLS restrictions.

### Supported Actions
```typescript
"get_watchlist" | "get_collections" | "get_collection_movies"
"add_to_watchlist" | "remove_from_watchlist"
"create_collection" | "update_collection" | "delete_collection"
"add_to_collection" | "remove_from_collection"
"add_review" | "delete_review"
```

---

## 9. Quick Reference Prompts

### Complete Mood Buttons
> "Make mood buttons 140px, add coral shadow on hover (rgba 241,94,61,0.4), lift 6px, wiggle rotation, spring physics (350/22/0.9), 4-step morph animation with label squeezing up on hover using blob SVG (x=26, y=51, w=320, h=194, rx=50)."

### Complete Auth Page (White Theme)
> "Minimal white auth page: bg-white, max-w-sm centered, h-14 logo, text-2xl title in neutral-900, two buttons (primary neutral-900, secondary neutral-100), forms in bg-neutral-50 rounded-2xl containers, AnimatePresence transitions y:20→-20."

### Complete Full-Screen Search
> "Full-screen search: fixed inset-0 z-[100], opacity + y:20→0 scale:0.98→1 animation, sticky header with rounded-xl h-12 input, debounced 300ms search, list results with 56×80px thumbnails, trending grid 3/4/6 cols, escape key close, body scroll lock."

### Complete Cinematic Carousel
> "Ken Burns carousel: h-[85vh], scale 1→1.08 over 12s crossfade, 3 gradient overlays, Apple TV+ buttons (white primary, glass secondary), top progress bar, desktop filmstrip with ring-2 active, mobile pill dots, touch gestures preventing page scroll (diffX > diffY check), 6s autoplay."

### Complete Dark Mode Theme
> "Premium greyish dark: background 220 10% 8%, card 220 10% 10%, secondary 220 8% 14%, border 220 8% 18%, foreground 210 10% 96%, muted-foreground 215 8% 55%. Glass: bg hsl(220 10% 10% / 0.85), border hsl(210 10% 100% / 0.06). Theme transition 0.2s ease."

---

## Dependencies Used

- `framer-motion` - All animations
- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `next-themes` - Theme switching

## Animation Presets

**Standard Spring:**
```tsx
{ type: "spring", stiffness: 300, damping: 30 }
```

**Bouncy Spring (Mood Buttons):**
```tsx
{ type: "spring", stiffness: 350, damping: 22, mass: 0.9 }
```

**Content Entry:**
```tsx
{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
```

**Ken Burns Scale:**
```tsx
{ duration: 12, ease: "linear" }
```

**Entry Easing:**
```tsx
{ ease: [0.23, 1, 0.32, 1] }
```

---

*End of Documentation*

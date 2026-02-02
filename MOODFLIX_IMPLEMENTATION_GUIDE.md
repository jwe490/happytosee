# MoodFlix Implementation Guide
## Comprehensive Technical Documentation for Key Features

---

## Table of Contents
1. [Mood Buttons](#1-mood-buttons)
2. [Login Page](#2-login-page)
3. [Full-Screen Search](#3-full-screen-search)
4. [Cinematic Carousel](#4-cinematic-carousel)
5. [Dark Mode Theme](#5-dark-mode-theme)

---

## 1. Mood Buttons

### Design Specifications
- **Size**: 140px × 140px square buttons
- **Border Radius**: 24px (rounded-3xl)
- **Animation**: 4-step morph with spring physics

### Animation Physics
```typescript
const springConfig = {
  stiffness: 350,
  damping: 22,
  mass: 0.9
};

// Hover state
whileHover={{
  scale: 1.08,
  y: -8,
  boxShadow: "0 20px 40px -12px rgba(241, 94, 61, 0.4)"
}}

// Tap state
whileTap={{
  scale: 0.95,
  y: -2
}}
```

### Visual Styling
```typescript
// Active gradient background
style={{
  background: `linear-gradient(135deg, hsl(${mood.color}) 0%, hsl(${mood.color} / 0.8) 100%)`
}}

// Coral shadow color
boxShadow: "0 20px 40px -12px rgba(241, 94, 61, 0.4)"
```

### AI Recreation Prompt
```
Create mood selector buttons with 140px square size, 24px border radius, and spring animation (stiffness: 350, damping: 22, mass: 0.9). On hover: scale 1.08, y: -8px with coral shadow (rgba(241, 94, 61, 0.4)). On tap: scale 0.95. Use gradient backgrounds and framer-motion.
```

---

## 2. Login Page

### Theme Integration
The login page now follows the universal theme system using semantic design tokens.

### Color Variables Used
```css
/* All colors reference CSS variables */
--background      /* Page background */
--foreground      /* Primary text */
--muted-foreground /* Secondary text */
--primary         /* Primary buttons */
--primary-foreground /* Primary button text */
--secondary       /* Secondary surfaces */
--card            /* Card backgrounds */
--border          /* Border colors */
```

### Component Structure
```tsx
<div className="min-h-screen bg-background flex flex-col">
  {/* Close button */}
  <button className="bg-secondary text-muted-foreground hover:bg-muted">
    <X />
  </button>

  {/* Primary button */}
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Sign In with Key
  </button>

  {/* Secondary button */}
  <button className="bg-secondary border-border text-foreground hover:bg-muted">
    Create New Account
  </button>

  {/* Form cards */}
  <div className="bg-card border-border rounded-2xl">
    {/* Form content */}
  </div>
</div>
```

### Animation Transitions
```typescript
// Page transitions
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.4 }}
```

### AI Recreation Prompt
```
Create a login page using semantic design tokens (bg-background, text-foreground, bg-primary, bg-secondary, bg-card, border-border). Include AnimatePresence for step transitions with y: 20 to 0 animation over 0.4s. Add close button, primary CTA, secondary CTA, and form cards. Follow universal dark/light theme automatically.
```

---

## 3. Full-Screen Search

### Overlay Animation
```typescript
const overlayVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};
```

### Content Slide Animation
```typescript
const contentVariants = {
  closed: {
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.05,
      ease: "easeOut"
    }
  }
};
```

### Staggered Item Animation
```typescript
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};
```

### Search Input Styling
```tsx
<input
  className="w-full h-12 pl-12 pr-12 rounded-2xl 
    bg-secondary/80 border border-border/50 
    text-foreground placeholder:text-muted-foreground 
    focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
/>
```

### Movie Click Navigation
```typescript
// Navigate via URL parameter to open movie modal
const handleMovieClick = (movie: SearchResult) => {
  onClose();
  setTimeout(() => {
    navigate(`/?movie=${movie.id}`);
  }, 100);
};
```

### Key Features
- Debounced search (300ms delay)
- Backdrop blur effect (backdrop-blur-md)
- Escape key to close
- Body scroll prevention when open
- Trending movies grid on idle
- Staggered result animations

### AI Recreation Prompt
```
Create a full-screen search overlay with framer-motion. Overlay fades in over 0.3s with easeInOut. Content slides up from y: 30 to 0 over 0.4s with 0.05s delay. Include pill-shaped search input (h-12, rounded-2xl), debounced search at 300ms, escape key listener, body scroll lock, and trending movie grid. Results use staggered animation with 0.04s delay per item. Navigate to movie via URL parameter on click.
```

---

## 4. Cinematic Carousel

### Ken Burns Effect
```typescript
const backgroundVariants = {
  center: {
    scale: 1.08,
    opacity: 1,
    transition: { 
      scale: { duration: 12, ease: "linear" }, 
      opacity: { duration: 0.8, ease: "easeOut" } 
    }
  }
};
```

### Three-Layer Gradient Overlay
```tsx
{/* Bottom gradient */}
<div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

{/* Vignette */}
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

{/* Side fade */}
<div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
```

### Auto-Play Progress Bar
```tsx
<motion.div
  className="absolute top-0 left-0 h-1 bg-primary"
  initial={{ width: "0%" }}
  animate={{ width: "100%" }}
  transition={{ duration: 5, ease: "linear" }}
/>
```

### Apple TV+ Style Buttons
```tsx
{/* Play Trailer Button */}
<button className="h-11 px-6 rounded-full bg-white/20 backdrop-blur-md 
  border border-white/30 text-white font-medium 
  hover:bg-white/30 transition-all flex items-center gap-2">
  <Play className="w-5 h-5" />
  Play Trailer
</button>

{/* My List Button */}
<button className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-md 
  border border-white/20 text-white hover:bg-white/20 transition-all">
  <Plus className="w-5 h-5" />
</button>
```

### Touch Gesture Handling
```typescript
// Prevent page scroll during swipe
const handleTouchMove = (e: TouchEvent) => {
  if (!touchStartRef.current) return;
  const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current);
  const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
  
  // If horizontal swipe is dominant, prevent scroll
  if (deltaX > deltaY && deltaX > 10) {
    e.preventDefault();
  }
};

// Container touch settings
<div style={{ touchAction: "pan-y pinch-zoom" }}>
```

### Timing Configuration
- **Auto-play interval**: 5 seconds
- **Slide transition**: 700ms ease-out
- **Ken Burns scale**: 1.0 → 1.08 over 12 seconds
- **Background crossfade**: 800ms

### AI Recreation Prompt
```
Create an Apple TV+ style cinematic carousel with Ken Burns background effect (scale 1.0 to 1.08 over 12s with linear easing). Include three gradient overlays (bottom fade, vignette, side fade), top-aligned progress bar (5s auto-play), glassmorphic buttons (Play Trailer, My List, Mute), and thumbnail filmstrip navigation. Use touchAction: "pan-y pinch-zoom" and prevent default on horizontal swipes to avoid page scrolling.
```

---

## 5. Dark Mode Theme

### Premium Greyish Tone (Replaces Pure Black)
```css
.dark {
  --background: 220 10% 8%;        /* #121416 - Dark grey, not pure black */
  --foreground: 210 20% 95%;       /* Light text */
  --card: 220 10% 10%;             /* Card surfaces */
  --popover: 220 10% 10%;          /* Popover backgrounds */
  --primary: 15 85% 55%;           /* Coral accent */
  --primary-foreground: 0 0% 100%; /* White on primary */
  --secondary: 220 10% 14%;        /* Elevated surfaces */
  --muted: 220 10% 18%;            /* Muted backgrounds */
  --muted-foreground: 215 15% 60%; /* Muted text */
  --accent: 220 10% 16%;           /* Accent surfaces */
  --border: 220 10% 18%;           /* Border color */
}
```

### Theme Transition
```css
* {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
```

### Key Differences from Pure Black
| Element | Pure Black | Premium Grey |
|---------|------------|--------------|
| Background | 0 0% 0% | 220 10% 8% |
| Cards | 0 0% 5% | 220 10% 10% |
| Secondary | 0 0% 10% | 220 10% 14% |
| Borders | 0 0% 15% | 220 10% 18% |

### Light Mode Colors
```css
:root {
  --background: 0 0% 100%;          /* Pure white */
  --foreground: 220 15% 10%;        /* Near black text */
  --card: 0 0% 100%;                /* White cards */
  --primary: 15 85% 55%;            /* Coral accent */
  --secondary: 220 15% 96%;         /* Light grey */
  --muted: 220 15% 94%;             /* Muted surfaces */
  --border: 220 15% 90%;            /* Subtle borders */
}
```

### AI Recreation Prompt
```
Set up a premium dark mode using greyish tones instead of pure black. Base background: hsl(220 10% 8%), cards: hsl(220 10% 10%), secondary: hsl(220 10% 14%). Add 0.2s ease transition for background-color and border-color. Light mode uses pure white background with subtle grey secondary colors. Primary accent remains coral (hsl 15 85% 55%).
```

---

## Quick Implementation Commands

### 1. Mood Buttons
```
Add mood selector with 140px buttons, spring animation (stiffness: 350, damping: 22), scale 1.08 hover, coral shadow, gradient backgrounds.
```

### 2. Login Page
```
Update login page to use semantic tokens (bg-background, text-foreground, bg-primary, bg-card). Add AnimatePresence transitions, close button, and follow universal theme.
```

### 3. Full-Screen Search
```
Create search overlay with 0.3s opacity fade, content slide from y: 30, 300ms debounced search, escape key close, staggered results (0.04s delay), navigate via URL parameter.
```

### 4. Cinematic Carousel
```
Build Apple TV+ carousel with Ken Burns (scale 1.08 over 12s), 5s auto-play with progress bar, glassmorphic buttons, three gradient overlays, touch gesture handling with pan-y pinch-zoom.
```

### 5. Dark Mode Theme
```
Replace pure black with premium grey (220 10% 8%), add 0.2s background transitions, maintain coral primary accent.
```

---

## File References

| Feature | Primary File |
|---------|-------------|
| Mood Buttons | `src/components/MoodSelector.tsx` |
| Login Page | `src/pages/Auth.tsx` |
| Search Overlay | `src/components/FullScreenSearch.tsx` |
| Cinematic Carousel | `src/components/CinematicImageCarousel.tsx` |
| Theme Variables | `src/index.css` |
| Tailwind Config | `tailwind.config.ts` |

---

*Document Version: 2.0*
*Last Updated: February 2, 2026*

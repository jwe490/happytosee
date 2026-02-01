# MoodFlix Feature Documentation
## Complete Guide to Today's Implementations

> **Last Updated:** February 1, 2026  
> **Purpose:** Reference documentation for reproducing all active features

---

## Table of Contents

1. [Mood Button System](#1-mood-button-system)
2. [Authentication Experience](#2-authentication-experience)
3. [Cinematic Carousel](#3-cinematic-carousel)
4. [Reviews System](#4-reviews-system)
5. [Library & Collections](#5-library--collections)

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

### Prompt for AI Recreation
> "Create a mood selector with 12 buttons (140px × 140px) in a responsive grid. Each button should lift up 6px on hover with a wiggle rotation animation. Add layered coral-orange drop shadows (rgba 241,94,61,0.4). Implement a 4-step animation where on hover: (1) icon fades out, (2) dark 6px border appears, (3) orange background stays, (4) label morphs upward with spring physics (stiffness 300, damping 24). Include character-by-character text reveal with 12ms stagger."

---

## 2. Authentication Experience

### Files
- `src/pages/Auth.tsx` - Main auth page
- `src/components/auth/AuthBackground.tsx` - Animated background
- `src/components/auth/FloatingParticles.tsx` - Particle system
- `src/components/auth/GlassCard.tsx` - Glassmorphism container
- `src/components/auth/PersonaForm.tsx` - Signup form
- `src/components/auth/KeyLoginForm.tsx` - Login form
- `src/components/auth/KeyRevealCard.tsx` - Secret key display
- `src/components/auth/VaultIllustration.tsx` - Vault animation
- `src/components/auth/InteractiveLoginIllustration.tsx` - Login feedback

### Feature Overview
Cinematic, minimal authentication flow with glassmorphism, floating particles, and interactive illustrations.

### Design Specifications

**Background System (`AuthBackground.tsx`):**
```tsx
// Multi-layer gradient
background: `
  radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
  radial-gradient(ellipse 60% 40% at 100% 100%, hsl(var(--primary) / 0.05) 0%, transparent 40%),
  radial-gradient(ellipse 50% 30% at 0% 80%, hsl(var(--primary) / 0.04) 0%, transparent 40%),
  hsl(var(--background))
`

// Animated orbs (6 total)
{[...Array(6)].map((_, i) => (
  <motion.div
    style={{
      width: 200 + i * 80,  // 200px to 600px
      height: 200 + i * 80,
      filter: "blur(40px)",
      background: `radial-gradient(circle, hsl(var(--primary) / ${0.02 + i * 0.005}) 0%, transparent 70%)`
    }}
    animate={{
      x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
      y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8 + i * 2,  // 8s to 18s
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
))}

// Grid pattern overlay
backgroundImage: `
  linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
  linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
`,
backgroundSize: "60px 60px",
opacity: "[0.015] dark:[0.03]"

// Film grain texture SVG
backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
```

**Floating Particles (`FloatingParticles.tsx`):**
- Count: 20 particles
- Size: 2-6px (randomized)
- Duration: 10-25 seconds per cycle
- Opacity: 0.1-0.3
- Background: `hsl(var(--foreground) / 0.4)`

**Glass Card (`GlassCard.tsx`):**
```tsx
// Backdrop blur effect
backdropFilter: "blur(20px) saturate(180%)",

// Glass background
background: `
  linear-gradient(135deg, 
    hsl(var(--card) / 0.9) 0%, 
    hsl(var(--card) / 0.7) 100%
  )
`,

// Outer glow border
background: `linear-gradient(135deg, hsl(var(--${glowColor}) / 0.15) 0%, transparent 50%, hsl(var(--${glowColor}) / 0.1) 100%)`,

// Inner highlight
background: `
  radial-gradient(ellipse 100% 80% at 50% 0%, hsl(var(--${glowColor}) / 0.05) 0%, transparent 50%),
  linear-gradient(180deg, hsl(var(--foreground) / 0.02) 0%, transparent 20%)
`
```

**Cinematic Gallery Strip:**
```tsx
// Movie stills array
const GALLERY_STILLS = [
  "https://image.tmdb.org/t/p/w300/hek3koDUyRQq7gkV2Fj0hMhiWtI.jpg",
  "https://image.tmdb.org/t/p/w300/jOzrELAzFxtMx2I4uDGHOotdfsS.jpg",
  // ... 6 total images
];

// Auto-rotation every 3.5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentStill((prev) => (prev + 1) % GALLERY_STILLS.length);
  }, 3500);
  return () => clearInterval(interval);
}, []);

// Active state sizing
animate={{
  width: isActive ? 80 : 40,
  height: isActive ? 56 : 36,
  opacity: isNear ? (isActive ? 1 : 0.5) : 0.2,
}}
transition={{
  type: "spring",
  stiffness: 300,
  damping: 30,
}}
```

**Auth Buttons:**
```tsx
// Primary CTA - "Create Your Vault"
<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  className="h-16 rounded-2xl"
  style={{
    boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.25), 0 4px 12px -4px hsl(0 0% 0% / 0.1)",
  }}
>
  // Animated arrow
  <motion.div
    animate={{ x: [0, 4, 0] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <ArrowRight />
  </motion.div>
</motion.button>

// Feature pills
{["Private", "Secure", "Instant"].map((feature, i) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 + i * 0.1 }}
    className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
    {feature}
  </motion.span>
))}
```

### Prompt for AI Recreation
> "Create a cinematic authentication page with: (1) Animated background featuring 6 floating blurred orbs at different sizes (200-600px, blur 40px) moving in figure-8 patterns, a subtle 60px grid overlay at 1.5% opacity, and film grain texture. (2) 20 floating particles (2-6px, 10-25s cycle) drifting across screen. (3) Glassmorphism card container with 20px blur, 180% saturation, and gradient from card/0.9 to card/0.7. (4) Gallery strip of 6 movie stills auto-rotating every 3.5s with spring animations (stiffness 300, damping 30) - active image 80×56px, inactive 40×36px. (5) Two auth buttons: primary dark 'Create Vault' with animated arrow and secondary outlined 'Enter With Key'. Include feature pills (Private, Secure, Instant) with staggered fade-in."

---

## 3. Cinematic Hero Carousel

### Location
- `src/components/CinematicHeroCarousel.tsx` (NEW - combined hero + carousel)
- Old files kept for reference: `src/components/CinematicCarousel.tsx`, `src/components/HeroSection.tsx`

### Feature Overview
Full-screen cinematic hero section with backdrop-based movie showcase, thumbnail navigation, and auto-play. Combines the hero and carousel into a single immersive experience inspired by premium streaming services.

### Design Specifications

**Layout:**
- Full viewport height: `min-h-[70vh] md:min-h-[80vh]`
- Backdrop image with multiple gradient overlays
- Content positioned at bottom with max-width container
- Thumbnail strip for navigation

**Background System:**
```tsx
// Backdrop with dimming
<div 
  style={{ 
    backgroundImage: `url(${backdropUrl})`,
    filter: "brightness(0.4) saturate(1.2)",
  }}
/>

// Multiple gradient overlays for depth
<div className="bg-gradient-to-t from-background via-background/60 to-transparent" />
<div className="bg-gradient-to-r from-background via-background/40 to-transparent" />
<div className="bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.8)_100%)]" />
```

**Content Animation:**
```tsx
// Movie info slides in/out on change
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
```

**Thumbnail Navigation:**
```tsx
// Poster thumbnails: 16×24px mobile, 20×28px desktop
<div className="w-16 h-24 md:w-20 md:h-28 rounded-lg">

// Active state
className={`
  ${isActive 
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/20" 
    : "hover:ring-1 hover:ring-white/30"
  }
`}

// Hover/tap animations
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.98 }}
```

**Progress Indicator:**
```tsx
// Animated progress bar within active dot
{index === currentIndex && isAutoPlaying && (
  <motion.div
    initial={{ width: "0%" }}
    animate={{ width: "100%" }}
    transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
    className="h-full bg-white/50"
  />
)}
```

**Auto-play & Navigation:**
- Auto-play interval: 6000ms (6 seconds)
- Pause on interaction: 15 seconds
- Progress indicator shows remaining time

**Performance Optimizations:**
- Components wrapped with `memo()` for re-render prevention
- Background and thumbnails are separate memoized components
- Spring animations use consistent config for GPU optimization

### Prompt for AI Recreation
> "Create a full-screen cinematic hero carousel combining hero section and movie showcase. Full viewport height (70-80vh). Active movie's backdrop fills background with brightness(0.4) saturate(1.2) filter. Layer 3 gradient overlays: vertical from-background via-60% to-transparent, horizontal from-background via-40% to-transparent, and radial vignette. Content at bottom: badges (rating, year, genre) in glassmorphism pills, large title, 2-3 line overview, and 'View Details' + 'More Info' buttons. Below content: horizontal thumbnail strip (20×28px posters) with ring-2 primary accent on active. Progress dots with animated fill showing autoplay timing. Auto-advance every 6s, pause 15s on interaction. Use React.memo on subcomponents for performance."

---

## 4. Reviews System

### Location
- `src/components/ReviewSection.tsx`

### Feature Overview
Interactive 10-star rating system with review submission, editing, and display functionality.

### Design Specifications

**Star Rating Component:**
```tsx
// 10 interactive stars
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
  <motion.button
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.95 }}
  >
    <Star
      className={cn(
        "w-6 h-6",  // md size, w-4 h-4 for sm
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
  className="text-2xl font-bold"
>
  {displayRating}<span className="text-muted-foreground text-base">/10</span>
</motion.span>
```

**Form Animations:**
```tsx
// Form container
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.2 }}
/>

// User review card
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  className="bg-primary/5 rounded-2xl border-primary/20"
/>
```

**UI Structure:**
- Header: Icon + title + average rating + count
- Write button: `rounded-full` pill button
- Form: Card with rating picker + textarea + submit/cancel
- User review: Highlighted card with edit/delete actions
- Other reviews: Staggered list with avatars

### Prompt for AI Recreation
> "Create a review section with 10-star interactive rating. Stars should scale 1.15x on hover, 0.95x on tap. Filled stars are yellow-400, empty are muted-foreground/40. Display current rating as animated number (scale 0.8→1 on change). Form slides in with height animation (0.2s). User's own review has primary/5 background with primary/20 border. Other reviews stagger in with 50ms delay each. Include edit/delete buttons and avatar with fallback icon."

---

## 5. Library & Collections

### Location
- `src/pages/Watchlist.tsx`

### Feature Overview
Comprehensive library system with watchlist management, collections, search, sort, and multiple view modes.

### Design Specifications

**Stats Dashboard:**
```tsx
// 4 stat cards in responsive grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
  {[
    { icon: Film, label: "In Watchlist", value: stats.total, color: "primary" },
    { icon: Star, label: "Avg Rating", value: stats.avgRating, color: "yellow-500" },
    { icon: Calendar, label: "This Week", value: stats.thisWeek, color: "green-500" },
    { icon: Folder, label: "Collections", value: stats.collections, color: "purple-500" },
  ].map(stat => (
    <Card className="p-4 bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-shadow">
      <div className="p-2 rounded-xl bg-{stat.color}/10">
        <stat.icon className="w-5 h-5 text-{stat.color}" />
      </div>
      <p className="text-2xl font-bold">{stat.value}</p>
      <p className="text-xs text-muted-foreground">{stat.label}</p>
    </Card>
  ))}
</div>
```

**Tabs:**
```tsx
<TabsList className="bg-muted/50 p-1">
  <TabsTrigger className="data-[state=active]:bg-background">
    <Bookmark /> Watchlist
  </TabsTrigger>
  <TabsTrigger className="data-[state=active]:bg-background">
    <Folder /> Collections
  </TabsTrigger>
</TabsList>
```

**Controls:**
```tsx
// Search input
<Input
  placeholder="Search movies..."
  className="pl-9 rounded-full bg-muted/50"
/>

// Sort dropdown
<DropdownMenu>
  <DropdownMenuItem onClick={() => setSortBy("date")}>Date Added</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setSortBy("rating")}>Rating</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setSortBy("title")}>Title</DropdownMenuItem>
</DropdownMenu>

// View mode toggle
<div className="flex bg-muted/50 rounded-full p-1">
  <button className={viewMode === "grid" ? "bg-background shadow-sm" : ""}>
    <Grid3X3 />
  </button>
  <button className={viewMode === "list" ? "bg-background shadow-sm" : ""}>
    <List />
  </button>
</div>
```

**Grid View:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    className="aspect-[2/3] rounded-xl ring-1 ring-border/30 group-hover:ring-primary/50"
  >
    // Hover overlay gradient
    <div className="bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100" />
  </motion.div>
</div>
```

**List View:**
```tsx
<div className="flex gap-4 p-4 rounded-xl bg-card border hover:shadow-md transition-all group">
  <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0" />
  <div className="flex-1 min-w-0 flex flex-col justify-between">
    <h3 className="font-semibold line-clamp-2">{movie.title}</h3>
    // Badges for year, rating
  </div>
  <div className="shrink-0 flex flex-col items-end justify-between">
    <DropdownMenu> // More actions
    <Badge> // Release year
  </div>
</div>
```

**Collection Cards:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}
  whileTap={{ scale: 0.98 }}
  className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-5 border hover:shadow-lg"
>
  <div className="flex items-start justify-between gap-3">
    <div className="p-2.5 rounded-xl bg-primary/10">
      <Folder className="w-5 h-5 text-primary" />
    </div>
  </div>
</motion.div>
```

**Create Collection Dialog:**
```tsx
<Dialog>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Create New Collection</DialogTitle>
    </DialogHeader>
    <Label>Collection Name</Label>
    <Input placeholder="e.g., Weekend Thrillers" />
    <Label>Description (optional)</Label>
    <Textarea placeholder="What's this collection about?" />
    <Button onClick={handleCreateCollection}>Create Collection</Button>
  </DialogContent>
</Dialog>
```

### Prompt for AI Recreation
> "Create a library page with: (1) Stats dashboard - 4 cards in 2×2/4×1 grid showing total movies, avg rating, added this week, collections count. Each has colored icon in rounded-xl container. (2) Tabs for Watchlist and Collections with muted/50 background. (3) Toolbar with rounded-full search input, sort dropdown (date/rating/title), and grid/list view toggle. (4) Grid view: 2-5 column responsive grid, aspect-[2/3] cards with hover lift (-4px), ring highlight on hover (primary/50), gradient overlay revealing title. (5) List view: horizontal cards with 64×96px thumbnail, title, badges, dropdown menu. (6) Collections tab: gradient cards from card to muted/30, folder icon, hover lift, create button opens dialog with name/description inputs."

---

## 6. Data Layer Architecture

### Overview
All user data (watchlist, collections, reviews) flows through a secure backend edge function (`user-data`) to bypass RLS restrictions caused by the custom key-auth system.

### Files
- `src/hooks/useWatchlist.ts` - Watchlist state management via API
- `src/hooks/useCollections.ts` - Collections state management via API  
- `src/lib/userDataApi.ts` - API wrapper functions
- `supabase/functions/user-data/index.ts` - Edge function handling all operations

### Supported Actions
```typescript
// GET operations
"get_watchlist"       // Fetch user's watchlist
"get_collections"     // Fetch collections with movies
"get_collection_movies" // Fetch movies in specific collection

// WATCHLIST operations
"add_to_watchlist"    // Add movie to watchlist
"remove_from_watchlist" // Remove movie from watchlist

// COLLECTION operations
"create_collection"   // Create new collection
"update_collection"   // Update collection metadata
"delete_collection"   // Delete collection and its movies
"add_to_collection"   // Add movie to collection
"remove_from_collection" // Remove movie from collection

// REVIEW operations
"add_review"          // Create or update review
"delete_review"       // Delete review
```

### Key Implementation Details
1. All operations require valid JWT token from key-auth
2. Service role key bypasses RLS in edge function
3. Hooks use optimistic updates for responsive UI
4. Automatic refetch after mutations ensures data consistency

---

## Quick Reference Prompts

### For Mood Buttons Only
> "Make mood buttons 140px, add coral shadow on hover (rgba 241,94,61,0.4), lift 6px, wiggle rotation, spring physics (350/22/0.9), 4-step morph animation with label squeezing up on hover."

### For Auth Page Only
> "Cinematic auth: 6 animated orbs (blur 40px), 20 floating particles, glass cards (blur 20px), gallery strip auto-rotating 3.5s, spring transitions (300/30), feature pills with staggered fade."

### For Hero Carousel Only
> "Full-screen hero carousel: backdrop fills viewport with brightness(0.4) filter, 3 gradient overlays, content at bottom with glassmorphism badges, thumbnail strip (20×28px) with ring-2 primary on active, progress dots with animated fill, 6s autoplay with 15s pause on interaction."

### For Reviews Only
> "10-star rating with scale hover, animated number display, sliding form, primary-tinted user card, staggered reviews list."

### For Library Only
> "Stats cards with colored icons, tabbed interface, search/sort/view controls, responsive grid with hover effects, list view, collection cards with create dialog."

---

## Dependencies Used

- `framer-motion` - All animations
- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives (Dialog, Tabs, Dropdown, etc.)
- `date-fns` - Date formatting
- `sonner` - Toast notifications

## Color Tokens Used

All colors use HSL CSS variables from the design system:
- `--primary` - Main accent color
- `--accent` - Secondary accent
- `--foreground` - Text color
- `--background` - Page background
- `--card` - Card backgrounds
- `--muted` - Muted backgrounds
- `--muted-foreground` - Secondary text
- `--border` - Border color
- `--destructive` - Delete/error actions

## Animation Presets

**Standard Spring:**
```tsx
{ type: "spring", stiffness: 300, damping: 30 }
```

**Bouncy Spring:**
```tsx
{ type: "spring", stiffness: 350, damping: 22, mass: 0.9 }
```

**Smooth Spring:**
```tsx
{ type: "spring", stiffness: 200, damping: 28, mass: 1 }
```

**Entry Easing:**
```tsx
{ ease: [0.23, 1, 0.32, 1] }
```

<!-- COMPLETE GLASSMORPHIC CINEMATIC CAROUSEL -->

<section class="cinematic-carousel-section">
  <!-- Cinematic Background with Color Extraction -->
  <div class="cinematic-background" id="cinematicBg"></div>
  
  <!-- Vignette Overlay -->
  <div class="vignette-overlay"></div>
  
  <!-- Edge Fade (Letterbox) -->
  <div class="letterbox-mask"></div>
  
  <!-- Carousel Container -->
  <div class="carousel-wrapper">
    <div class="cards-container" id="cardsContainer">
      
      <!-- Movie Card (Repeat for each) -->
      <div class="movie-card" data-color="59,130,246">
        <!-- Poster -->
        <img src="poster.jpg" alt="Movie" class="poster-img">
        
        <!-- Glass Container Effect -->
        <div class="glass-container"></div>
        
        <!-- Gradient Overlay -->
        <div class="dark-gradient"></div>
        
        <!-- Glassmorphic Badges -->
        <div class="badge-group">
          <div class="rating-badge-glass">
            <span class="star-icon">⭐</span>
            <span>7.2</span>
          </div>
          <div class="year-badge-glass">2025</div>
          <div class="genre-badge-glass">Thriller</div>
        </div>
        
        <!-- Movie Info -->
        <div class="movie-details">
          <h3 class="movie-title-text">Wake Up Dead Man: A Knives Out Mystery</h3>
          <button class="glass-button">View Details</button>
        </div>
        
        <!-- Ambient Glow -->
        <div class="ambient-glow"></div>
      </div>
      
    </div>
    
    <!-- Glassmorphic Navigation Arrows -->
    <button class="glass-arrow left-arrow" id="prevArrow">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M15 18L9 12L15 6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="glass-arrow right-arrow" id="nextArrow">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 18L15 12L9 6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
  
  <!-- Dots Navigation -->
  <div class="dots-container" id="dotsNav"></div>
</section>

<style>
/* Cinematic Section */
.cinematic-carousel-section {
  position: relative;
  width: 100%;
  min-height: 640px;
  padding: 60px 0 100px;
  overflow: hidden;
  background: #FAFAFA;
}

/* Dynamic Cinematic Background */
.cinematic-background {
  position: absolute;
  inset: -100px;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.12) 0%,
    rgba(59, 130, 246, 0.08) 40%,
    rgba(59, 130, 246, 0.03) 70%,
    #FAFAFA 100%
  );
  backdrop-filter: blur(80px);
  transition: background 1000ms ease;
  z-index: 0;
}

/* Vignette Overlay */
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.08) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Letterbox Edge Fade */
.letterbox-mask {
  position: absolute;
  inset: 0;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* Carousel Wrapper */
.carousel-wrapper {
  position: relative;
  max-width: 420px;
  height: 540px;
  margin: 0 auto;
  z-index: 3;
}

/* Cards Container */
.cards-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Movie Card */
.movie-card {
  position: absolute;
  width: 320px;
  height: 480px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  overflow: hidden;
  transition: all 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform, opacity;
}

/* Card States */
.movie-card.active {
  z-index: 10;
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  filter: brightness(1) blur(0);
}

.movie-card.inactive {
  z-index: 5;
  opacity: 0.3;
  transform: translate(-50%, -50%) scale(0.88);
  filter: brightness(0.6) blur(1px);
  pointer-events: none;
}

.movie-card.hidden {
  opacity: 0;
  pointer-events: none;
}

/* Poster Image */
.poster-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Ken Burns Animation */
.movie-card.active .poster-img {
  animation: kenBurnsEffect 12s ease-out infinite alternate;
}

@keyframes kenBurnsEffect {
  0% { transform: scale(1); }
  100% { transform: scale(1.015); }
}

/* Glass Container Effect */
.glass-container {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  pointer-events: none;
  z-index: 2;
}

/* Dark Gradient Overlay */
.dark-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.92) 100%
  );
  pointer-events: none;
  z-index: 3;
}

/* Badge Group */
.badge-group {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 4;
}

/* Glassmorphic Rating Badge */
.rating-badge-glass {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  width: fit-content;
}

.star-icon {
  font-size: 14px;
}

/* Year Badge */
.year-badge-glass {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  width: fit-content;
}

/* Genre Badge */
.genre-badge-glass {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  width: fit-content;
}

/* Movie Details */
.movie-details {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 4;
}

/* Movie Title */
.movie-title-text {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: #FFFFFF;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
}

/* Glassmorphic Button */
.glass-button {
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  cursor: pointer;
  transition: all 250ms ease;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.glass-button:active {
  transform: translateY(0);
}

/* Ambient Glow */
.ambient-glow {
  position: absolute;
  bottom: -50px;
  left: 10%;
  right: 10%;
  height: 100px;
  background: radial-gradient(
    ellipse,
    rgba(59, 130, 246, 0.3) 0%,
    transparent 70%
  );
  filter: blur(50px);
  opacity: 0;
  transition: opacity 600ms ease;
  pointer-events: none;
  z-index: -1;
}

.movie-card.active .ambient-glow {
  opacity: 1;
}

/* Glassmorphic Navigation Arrows */
.glass-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 28px;
  cursor: pointer;
  color: #1F2937;
  transition: all 250ms ease;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  z-index: 20;
}

.glass-arrow.left-arrow {
  left: 24px;
}

.glass-arrow.right-arrow {
  right: 24px;
}

.glass-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.glass-arrow:active {
  transform: translateY(-50%) scale(0.96);
}

/* Dots Container */
.dots-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: #D1D5DB;
  cursor: pointer;
  transition: all 400ms ease;
}

.nav-dot.active {
  width: 20px;
  background: #1F2937;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .carousel-wrapper {
    height: 500px;
  }
  
  .movie-card {
    width: 280px;
    height: 420px;
  }
  
  .glass-arrow {
    width: 48px;
    height: 48px;
  }
  
  .glass-arrow.left-arrow {
    left: 16px;
  }
  
  .glass-arrow.right-arrow {
    right: 16px;
  }
  
  .movie-title-text {
    font-size: 20px;
  }
}
</style>

<script>
let currentIdx = 0;
const movieCards = document.querySelectorAll('.movie-card');
const totalMovies = movieCards.length;
const dotsNav = document.getElementById('dotsNav');
const bgElement = document.getElementById('cinematicBg');

// Generate Dots
function createDots() {
  for (let i = 0; i < totalMovies; i++) {
    const dot = document.createElement('div');
    dot.className = 'nav-dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => goTo(i);
    dotsNav.appendChild(dot);
  }
}

// Update Carousel
function updateView() {
  movieCards.forEach((card, idx) => {
    card.classList.remove('active', 'inactive', 'hidden');
    
    if (idx === currentIdx) {
      card.classList.add('active');
      updateBackground(card);
    } else {
      card.classList.add('inactive');
    }
  });
  
  // Update dots
  document.querySelectorAll('.nav-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentIdx);
  });
}

// Update Background Color
function updateBackground(card) {
  const color = card.dataset.color || '59,130,246';
  bgElement.style.background = `radial-gradient(
    ellipse at center,
    rgba(${color}, 0.12) 0%,
    rgba(${color}, 0.08) 40%,
    rgba(${color}, 0.03) 70%,
    #FAFAFA 100%
  )`;
  
  // Update ambient glow
  const glow = card.querySelector('.ambient-glow');
  if (glow) {
    glow.style.background = `radial-gradient(ellipse, rgba(${color}, 0.3) 0%, transparent 70%)`;
  }
}

// Navigation
function next() {
  currentIdx = (currentIdx + 1) % totalMovies;
  updateView();
}

function prev() {
  currentIdx = (currentIdx - 1 + totalMovies) % totalMovies;
  updateView();
}

function goTo(idx) {
  currentIdx = idx;
  updateView();
}

// Event Listeners
document.getElementById('nextArrow').onclick = next;
document.getElementById('prevArrow').onclick = prev;

// Touch Swipe
let startX = 0;
document.querySelector('.cards-container').addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

document.querySelector('.cards-container').addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) next();
  if (endX - startX > 50) prev();
});

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// Initialize
createDots();
updateView();
</script>

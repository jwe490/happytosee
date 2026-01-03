<!-- COMPLETE CINEMATIC CAROUSEL CODE -->

<!-- HTML STRUCTURE -->
<section class="hero-carousel-section">
  <!-- Ambient Background -->
  <div class="ambient-background" id="ambientBg"></div>
  
  <!-- Main Carousel Container -->
  <div class="carousel-container">
    <!-- Cards Wrapper -->
    <div class="cards-wrapper" id="cardsWrapper">
      
      <!-- Movie Card Template (repeat for each movie) -->
      <div class="movie-card" data-index="0">
        <!-- Poster Image -->
        <img src="movie-poster.jpg" alt="Movie Title" class="poster-image">
        
        <!-- Glass Border -->
        <div class="glass-border"></div>
        
        <!-- Dark Gradient Overlay -->
        <div class="gradient-overlay"></div>
        
        <!-- Top Badges -->
        <div class="badges-top">
          <div class="rating-badge">
            <span class="star">⭐</span>
            <span>7.2</span>
          </div>
          <div class="year-badge">2025</div>
          <div class="genre-badge">Thriller</div>
        </div>
        
        <!-- Bottom Info -->
        <div class="movie-info">
          <h3 class="movie-title">Wake Up Dead Man: A Knives Out Mystery</h3>
          <button class="view-details-btn">View Details</button>
        </div>
        
        <!-- Color Glow (dynamically colored) -->
        <div class="color-glow"></div>
      </div>
      
    </div>
    
    <!-- Navigation Arrows -->
    <button class="nav-arrow left" id="prevBtn" aria-label="Previous">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="nav-arrow right" id="nextBtn" aria-label="Next">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
  
  <!-- Navigation Dots (Outside Carousel) -->
  <div class="carousel-dots" id="carouselDots">
    <!-- Dots generated dynamically -->
  </div>
</section>

<!-- CSS STYLES -->
<style>
/* Hero Carousel Section */
.hero-carousel-section {
  position: relative;
  width: 100%;
  padding: 40px 0 80px;
  overflow: hidden;
}

/* Ambient Cinematic Background */
.ambient-background {
  position: absolute;
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: -100px;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.08) 0%,
    rgba(99, 102, 241, 0.05) 40%,
    rgba(168, 85, 247, 0.03) 70%,
    transparent 100%
  );
  filter: blur(60px);
  transition: background 1200ms ease;
  pointer-events: none;
  z-index: 0;
}

/* Carousel Container */
.carousel-container {
  position: relative;
  max-width: 400px;
  height: 540px;
  margin: 0 auto;
  z-index: 1;
}

/* Cards Wrapper */
.cards-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Movie Card */
.movie-card {
  position: absolute;
  width: 320px;
  height: 480px;
  border-radius: 20px;
  overflow: hidden;
  transition: all 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
  cursor: pointer;
}

/* Card States */
.movie-card.active {
  z-index: 10;
  transform: scale(1) translateX(0);
  opacity: 1;
  filter: brightness(1) blur(0);
}

.movie-card.prev,
.movie-card.next {
  z-index: 5;
  transform: scale(0.85) translateX(0);
  opacity: 0.3;
  filter: brightness(0.6) blur(1px);
  pointer-events: none;
}

.movie-card.hidden {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

/* Poster Image */
.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 10s ease-out;
}

.movie-card.active .poster-image {
  animation: kenBurns 12s ease-out infinite alternate;
}

@keyframes kenBurns {
  from { transform: scale(1); }
  to { transform: scale(1.03); }
}

/* Glass Border Effect */
.glass-border {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  pointer-events: none;
  z-index: 1;
}

/* Dark Gradient Overlay */
.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 30%,
    rgba(0, 0, 0, 0.9) 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* Top Badges Container */
.badges-top {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 3;
}

/* Rating Badge */
.rating-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
}

.star {
  font-size: 14px;
}

/* Year Badge */
.year-badge {
  padding: 5px 12px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  width: fit-content;
}

/* Genre Badge */
.genre-badge {
  padding: 5px 12px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  width: fit-content;
}

/* Movie Info (Bottom) */
.movie-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 3;
}

/* Movie Title */
.movie-title {
  font-size: 24px;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.2;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
  letter-spacing: -0.01em;
}

/* View Details Button (Glassmorphic) */
.view-details-btn {
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
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.view-details-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.view-details-btn:active {
  transform: translateY(0);
}

/* Color Glow Under Card */
.color-glow {
  position: absolute;
  bottom: -40px;
  left: 10%;
  right: 10%;
  height: 80px;
  background: radial-gradient(ellipse, rgba(59, 130, 246, 0.25), transparent);
  filter: blur(40px);
  opacity: 0;
  transition: opacity 600ms ease;
  pointer-events: none;
  z-index: -1;
}

.movie-card.active .color-glow {
  opacity: 1;
}

/* Navigation Arrows */
.nav-arrow {
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
  transition: all 250ms ease;
  z-index: 20;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  color: #1F2937;
}

.nav-arrow.left {
  left: 24px;
}

.nav-arrow.right {
  right: 24px;
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.nav-arrow:active {
  transform: translateY(-50%) scale(0.96);
}

/* Carousel Dots (Outside Carousel) */
.carousel-dots {
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

.dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: #D1D5DB;
  transition: all 400ms ease;
  cursor: pointer;
}

.dot.active {
  width: 20px;
  background: #1F2937;
}

/* Desktop Responsive (>1024px) */
@media (min-width: 1024px) {
  .carousel-container {
    max-width: 500px;
    height: 600px;
  }
  
  .movie-card {
    width: 360px;
    height: 540px;
  }
  
  .nav-arrow.left {
    left: -80px;
  }
  
  .nav-arrow.right {
    right: -80px;
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .carousel-container {
    height: 500px;
  }
  
  .movie-card {
    width: 280px;
    height: 420px;
  }
  
  .nav-arrow {
    width: 48px;
    height: 48px;
  }
  
  .nav-arrow.left {
    left: 16px;
  }
  
  .nav-arrow.right {
    right: 16px;
  }
  
  .movie-title {
    font-size: 20px;
  }
}
</style>

<!-- JAVASCRIPT -->
<script>
// Carousel State
let currentIndex = 0;
const cards = document.querySelectorAll('.movie-card');
const totalCards = cards.length;
const dotsContainer = document.getElementById('carouselDots');
const ambientBg = document.getElementById('ambientBg');

// Generate Dots
function generateDots() {
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

// Update Carousel
function updateCarousel() {
  cards.forEach((card, index) => {
    card.classList.remove('active', 'prev', 'next', 'hidden');
    
    if (index === currentIndex) {
      card.classList.add('active');
    } else if (index === currentIndex - 1 || (currentIndex === 0 && index === totalCards - 1)) {
      card.classList.add('prev');
    } else if (index === currentIndex + 1 || (currentIndex === totalCards - 1 && index === 0)) {
      card.classList.add('next');
    } else {
      card.classList.add('hidden');
    }
  });
  
  // Update Dots
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });
  
  // Update Ambient Background (extract dominant color logic here)
  updateAmbientBackground();
}

// Update Ambient Background Color
function updateAmbientBackground() {
  // Placeholder - extract dominant color from active poster
  const colors = [
    'rgba(59, 130, 246, 0.08)',   // Blue
    'rgba(239, 68, 68, 0.08)',    // Red
    'rgba(16, 185, 129, 0.08)',   // Green
    'rgba(168, 85, 247, 0.08)',   // Purple
    'rgba(245, 158, 11, 0.08)'    // Orange
  ];
  
  const color = colors[currentIndex % colors.length];
  ambientBg.style.background = `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`;
}

// Navigation Functions
function nextSlide() {
  currentIndex = (currentIndex + 1) % totalCards;
  updateCarousel();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + totalCards) % totalCards;
  updateCarousel();
}

function goToSlide(index) {
  currentIndex = index;
  updateCarousel();
}

// Event Listeners
document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.getElementById('prevBtn').addEventListener('click', prevSlide);

// Touch/Swipe Support
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.cards-wrapper').addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.querySelector('.cards-wrapper').addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) nextSlide();
  if (touchEndX > touchStartX + 50) prevSlide();
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

// Initialize
generateDots();
updateCarousel();

// Auto-play (optional)
// setInterval(nextSlide, 5000);
</script>

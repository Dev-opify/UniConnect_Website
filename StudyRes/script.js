// Enhanced Responsive JavaScript for Study Resources

class ResponsiveStudyPage {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.handleInitialLoad();
  }

  init() {
    this.breakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
      large: 1200
    };
    
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.isResizing = false;
    this.resizeTimer = null;
  }

  setupEventListeners() {
    // Optimized resize handler with debouncing
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 150));

    // Orientation change handler for mobile devices
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });

    // Touch and click handlers for better mobile interaction
    this.setupCardInteractions();
    
    // Keyboard navigation support
    this.setupKeyboardNavigation();
    
    // Intersection Observer for performance optimization
    this.setupIntersectionObserver();
  }

  getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width <= this.breakpoints.mobile) return 'mobile';
    if (width <= this.breakpoints.tablet) return 'tablet';
    if (width <= this.breakpoints.desktop) return 'desktop';
    return 'large';
  }

  handleResize() {
    const newBreakpoint = this.getCurrentBreakpoint();
    
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.adjustLayoutForBreakpoint();
    }
    
    this.updateGridColumns();
    this.adjustFontSizes();
    this.updateCardSpacing();
  }

  handleOrientationChange() {
    // Force recalculation after orientation change
    this.handleResize();
    
    // Smooth scroll to top on orientation change for better UX
    if (this.currentBreakpoint === 'mobile') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  adjustLayoutForBreakpoint() {
    const container = document.querySelector('.container');
    const subjectsGrid = document.querySelector('.subjects-grid');
    const header = document.querySelector('.header');

    switch (this.currentBreakpoint) {
      case 'mobile':
        this.optimizeForMobile(container, subjectsGrid, header);
        break;
      case 'tablet':
        this.optimizeForTablet(container, subjectsGrid, header);
        break;
      case 'desktop':
      case 'large':
        this.optimizeForDesktop(container, subjectsGrid, header);
        break;
    }
  }

  optimizeForMobile(container, grid, header) {
    // Dynamic grid adjustment for mobile
    grid.style.gridTemplateColumns = '1fr';
    grid.style.gap = '1.2rem';
    
    // Adjust header for mobile
    const h1 = header.querySelector('h1');
    const p = header.querySelector('p');
    h1.style.fontSize = 'clamp(1.8rem, 8vw, 2.5rem)';
    p.style.fontSize = 'clamp(1rem, 4vw, 1.1rem)';
    
    // Add mobile-specific classes
    document.body.classList.add('mobile-view');
    document.body.classList.remove('tablet-view', 'desktop-view');
    
    // Optimize touch targets
    this.optimizeTouchTargets();
  }

  optimizeForTablet(container, grid, header) {
    // Tablet-specific grid
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    grid.style.gap = '1.8rem';
    
    // Adjust header for tablet
    const h1 = header.querySelector('h1');
    const p = header.querySelector('p');
    h1.style.fontSize = 'clamp(2.2rem, 6vw, 2.8rem)';
    p.style.fontSize = '1.15rem';
    
    document.body.classList.add('tablet-view');
    document.body.classList.remove('mobile-view', 'desktop-view');
  }

  optimizeForDesktop(container, grid, header) {
    // Desktop grid optimization
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    grid.style.gap = '2rem';
    
    // Reset header sizes
    const h1 = header.querySelector('h1');
    const p = header.querySelector('p');
    h1.style.fontSize = '3rem';
    p.style.fontSize = '1.2rem';
    
    document.body.classList.add('desktop-view');
    document.body.classList.remove('mobile-view', 'tablet-view');
  }

  updateGridColumns() {
    const grid = document.querySelector('.subjects-grid');
    const containerWidth = document.querySelector('.container').offsetWidth;
    const cardMinWidth = 320;
    const gap = 32; // 2rem
    
    // Calculate optimal number of columns
    const availableWidth = containerWidth - (gap * 2);
    const maxColumns = Math.floor(availableWidth / (cardMinWidth + gap));
    const columns = Math.max(1, Math.min(maxColumns, 3)); // Max 3 columns
    
    if (this.currentBreakpoint !== 'mobile') {
      grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
  }

  adjustFontSizes() {
    // Dynamic font size adjustment based on screen size
    const vw = window.innerWidth / 100;
    const cards = document.querySelectorAll('.subject-card');
    
    cards.forEach(card => {
      const title = card.querySelector('.subject-title');
      if (title) {
        const baseFontSize = this.currentBreakpoint === 'mobile' ? 1.1 : 
                           this.currentBreakpoint === 'tablet' ? 1.25 : 1.4;
        title.style.fontSize = `${baseFontSize}rem`;
      }
    });
  }

  updateCardSpacing() {
    const cards = document.querySelectorAll('.subject-card');
    const padding = this.currentBreakpoint === 'mobile' ? '1.2rem' : 
                   this.currentBreakpoint === 'tablet' ? '1.6rem' : '2rem';
    
    cards.forEach(card => {
      card.style.padding = padding;
    });
  }

  optimizeTouchTargets() {
    // Ensure touch targets are at least 44px for mobile
    const cards = document.querySelectorAll('.subject-card');
    
    cards.forEach(card => {
      const minTouchTarget = 44;
      if (card.offsetHeight < minTouchTarget) {
        card.style.minHeight = `${minTouchTarget}px`;
      }
    });
  }

  setupCardInteractions() {
    const cards = document.querySelectorAll('.subject-card');
    
    cards.forEach((card, index) => {
      // Enhanced touch feedback
      card.addEventListener('touchstart', (e) => {
        card.style.transform = 'translateY(-4px) scale(0.98)';
      }, { passive: true });
      
      card.addEventListener('touchend', (e) => {
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      }, { passive: true });
      
      // Improved click handling
      card.addEventListener('click', (e) => {
        // Add ripple effect
        this.createRippleEffect(e, card);
        
        // Handle navigation
        const titleElement = card.querySelector('.subject-title');
        if (titleElement && titleElement.onclick) {
          e.preventDefault();
          titleElement.onclick();
        }
      });
      
      // Hover effects for desktop
      if (!this.isTouchDevice()) {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      }
    });
  }

  createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  setupKeyboardNavigation() {
    const cards = document.querySelectorAll('.subject-card');
    
    cards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
        
        // Arrow key navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextCard = cards[index + 1] || cards[0];
          nextCard.focus();
        }
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevCard = cards[index - 1] || cards[cards.length - 1];
          prevCard.focus();
        }
      });
    });
  }

  setupIntersectionObserver() {
    // Optimize animations based on visibility
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, { threshold: 0.1 });
    
    const cards = document.querySelectorAll('.subject-card');
    cards.forEach(card => observer.observe(card));
  }

  handleInitialLoad() {
    // Stagger card animations on load
    const cards = document.querySelectorAll('.subject-card');
    
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
    
    // Initial responsive adjustments
    this.adjustLayoutForBreakpoint();
  }

  isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
  }

  debounce(func, wait) {
    return (...args) => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Add responsive CSS animations via JavaScript
const addResponsiveStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* Enhanced mobile styles */
    .mobile-view .subject-card {
      margin-bottom: 0.5rem;
    }
    
    .mobile-view .card-content {
      gap: 1rem;
    }
    
    /* Tablet optimizations */
    .tablet-view .subjects-grid {
      padding: 0 1rem;
    }
    
    /* Desktop hover enhancements */
    .desktop-view .subject-card:hover .icon-container {
      transform: scale(1.05);
    }
    
    /* Focus styles for accessibility */
    .subject-card:focus {
      outline: 3px solid #667eea;
      outline-offset: 2px;
    }
    
    /* Smooth transitions for all responsive changes */
    .container, .subjects-grid, .subject-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Prevent layout shift during resize */
    .subject-card {
      contain: layout style paint;
    }
  `;
  
  document.head.appendChild(style);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addResponsiveStyles();
  new ResponsiveStudyPage();
});

// Also handle cases where script loads after DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addResponsiveStyles();
    new ResponsiveStudyPage();
  });
} else {
  addResponsiveStyles();
  new ResponsiveStudyPage();
}
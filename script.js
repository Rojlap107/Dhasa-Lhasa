document.addEventListener('DOMContentLoaded', function() {
    // Logo fade effect on scroll
    const logo = document.querySelector('.logo');
    const logoLink = document.querySelector('.logo-link');

    // Get the navigation element
    const nav = document.querySelector('nav');

    // Function to handle scroll effects (logo visibility only, keep nav transparent)
    function handleScrollEffects() {
        // Start effects after scrolling 100px
        if (window.scrollY > 100) {
            // Fade out the logo
            logo.classList.add('fade-out');
            logoLink.classList.add('fade-out');
            
            // Keep nav transparent (no background change)
        } else {
            // Fade in the logo
            logo.classList.remove('fade-out');
            logoLink.classList.remove('fade-out');
            
            // Keep nav transparent (no background change)
        }
    }

    // Listen for scroll events
    window.addEventListener('scroll', handleScrollEffects);

    // Call once on page load to set initial state
    handleScrollEffects();

    // Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const menu = document.querySelector('.menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    function toggleMenu() {
        menu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    }
    
    menuBtn.addEventListener('click', toggleMenu);
    
    // Close menu when clicking outside
    menuOverlay.addEventListener('click', toggleMenu);
    
    // Smooth scroll for menu items with additional delay to allow menu to close
    document.querySelectorAll('.menu a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close the menu
            toggleMenu();
            
            // Get the target section
            const targetId = this.getAttribute('href');
            
            // Add a small delay to allow the menu to close first
            setTimeout(() => {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        });
    });
    
    // FAB is now a direct link to Instagram - no JavaScript needed
    
    // Counter Animation
    const counter = document.getElementById('counter');
    const target = 140;
    let count = 0;
    let counterStarted = false; // Flag to prevent the counter from being triggered multiple times
    
    function updateCounter() {
        if (count < target) {
            count++;
            counter.textContent = count;
            setTimeout(updateCounter, 20);
        }
    }
    
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Check if this is the stats section and counter hasn't started yet
                if (entry.target.classList.contains('stats-section') && !counterStarted) {
                    counterStarted = true; // Set flag to prevent multiple starts
                    updateCounter();
                }
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Also specifically observe the stats section
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    // Enhanced Carousel Functionality
    setupCarousel('.carousel-container', '.carousel', '.carousel-item');
    setupCarousel('.testimonials-container', '.testimonials', '.testimonial-card');
    
    /**
     * Sets up a carousel with manual scrolling capabilities
     * @param {string} containerSelector - The container element selector
     * @param {string} carouselSelector - The carousel element selector
     * @param {string} itemSelector - The item element selector
     */
    function setupCarousel(containerSelector, carouselSelector, itemSelector) {
        const container = document.querySelector(containerSelector);
        const carousel = container.querySelector(carouselSelector);
        const items = carousel.querySelectorAll(itemSelector);
        
        if (!container || !carousel || items.length === 0) return;
        
        // Add navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-nav carousel-prev';
        prevBtn.innerHTML = '&#10094;';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-nav carousel-next';
        nextBtn.innerHTML = '&#10095;';
        
        container.appendChild(prevBtn);
        container.appendChild(nextBtn);
        
        // Variables for touch/drag functionality
        let isDragging = false;
        let startPos = 0;
        let startTime = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let currentIndex = 0;
        
        // Calculate the width of each item including margin
        const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight);
        
        // Calculate visible items and true max index
        const visibleItems = Math.floor(container.offsetWidth / itemWidth);
        const maxIndex = Math.max(0, items.length - visibleItems);
        
        // Reset any existing transform
        carousel.style.transform = 'translateX(0)';
        carousel.style.transition = 'none';
        
        // Disable the existing auto-scroll functions
        if (window.autoScroll) {
            cancelAnimationFrame(window.autoScroll);
        }
        if (window.scrollTestimonials) {
            cancelAnimationFrame(window.scrollTestimonials);
        }
        
        // Event Listeners for buttons
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                setPositionByIndex(true);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                setPositionByIndex(true);
            }
        });
        
        // Touch events with passive option for better performance
        carousel.addEventListener('touchstart', touchStart, { passive: true });
        carousel.addEventListener('touchmove', touchMove, { passive: false });
        carousel.addEventListener('touchend', touchEnd);
        
        // Mouse events
        carousel.addEventListener('mousedown', touchStart);
        carousel.addEventListener('mousemove', touchMove);
        carousel.addEventListener('mouseup', touchEnd);
        carousel.addEventListener('mouseleave', touchEnd);
        
        // Prevent context menu on right click
        carousel.addEventListener('contextmenu', e => e.preventDefault());
        
        function touchStart(event) {
            const touch = event.type.includes('mouse') 
                ? event 
                : event.touches[0];
                
            startPos = touch.clientX;
            startTime = Date.now(); // Track when the touch started
            isDragging = true;
            
            // Remove transition for immediate response
            carousel.style.transition = 'none';
            
            // Store the current position
            prevTranslate = currentTranslate;
        }
        
        function touchMove(event) {
            if (!isDragging) return;
            
            // Prevent page scrolling when swiping the carousel
            if (!event.type.includes('mouse')) {
                event.preventDefault();
            }
            
            const touch = event.type.includes('mouse') 
                ? event 
                : event.touches[0];
                
            const currentPosition = touch.clientX;
            const diff = currentPosition - startPos;
            
            // Calculate new position with boundaries and add some resistance at the edges
            if ((currentIndex === 0 && diff > 0) || (currentIndex === maxIndex && diff < 0)) {
                // Add resistance at the edges (divide by 3 for less movement)
                currentTranslate = prevTranslate + (diff / 3);
            } else {
                currentTranslate = prevTranslate + diff;
            }
            
            // Apply transform without transition for immediate feedback
            setTransform(false);
        }
        
        function touchEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            // Calculate swipe duration and distance
            const touchDuration = Date.now() - startTime;
            const movedBy = currentTranslate - prevTranslate;
            
            // If it was a quick, significant swipe, move multiple items
            if (touchDuration < 300 && Math.abs(movedBy) > 50) {
                const direction = movedBy < 0 ? 1 : -1;
                const moveCount = Math.min(
                    Math.max(1, Math.floor(Math.abs(movedBy) / 100)), 
                    direction > 0 ? maxIndex - currentIndex : currentIndex
                );
                
                currentIndex += direction * moveCount;
                
                // Ensure within bounds
                if (currentIndex < 0) currentIndex = 0;
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                
                setPositionByIndex(true);
                return;
            }
            
            // For slower movements, check distance threshold
            if (movedBy < -50 && currentIndex < maxIndex) {
                currentIndex++;
            } else if (movedBy > 50 && currentIndex > 0) {
                currentIndex--;
            }
            
            // Always animate when returning to position
            setPositionByIndex(true);
        }
        
        function setPositionByIndex(animate = false) {
            currentTranslate = currentIndex * -itemWidth;
            
            if (animate) {
                carousel.style.transition = 'transform 0.3s ease-out';
            } else {
                carousel.style.transition = 'none';
            }
            
            setTransform(animate);
            updateDots();
            
            // Reset transition after animation completes
            if (animate) {
                setTimeout(() => {
                    carousel.style.transition = 'none';
                }, 300);
            }
        }
        
        function setTransform() {
            // Apply boundaries
            if (currentTranslate > 0) {
                currentTranslate = 0;
            } else if (currentTranslate < -(maxIndex * itemWidth)) {
                currentTranslate = -(maxIndex * itemWidth);
            }
            
            carousel.style.transform = `translateX(${currentTranslate}px)`;
        }
        
        // Add indicator dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        
        // Create dots based on visible items
        const dotsCount = Math.ceil(items.length / visibleItems);
        
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                currentIndex = Math.min(i * visibleItems, maxIndex);
                setPositionByIndex(true);
            });
            
            dotsContainer.appendChild(dot);
        }
        
        container.appendChild(dotsContainer);
        
        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            const activeDotIndex = Math.floor(currentIndex / visibleItems);
            
            dots.forEach((dot, index) => {
                if (index === activeDotIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Add touch hint for mobile devices
        if ('ontouchstart' in window) {
            const hintElement = document.createElement('div');
            hintElement.className = 'swipe-hint';
            hintElement.innerHTML = '← Swipe →';
            container.appendChild(hintElement);
            
            // Remove the hint after first interaction
            const removeHint = () => {
                hintElement.style.opacity = '0';
                setTimeout(() => {
                    hintElement.remove();
                }, 300);
                carousel.removeEventListener('touchstart', removeHint);
            };
            
            carousel.addEventListener('touchstart', removeHint);
            
            // Or remove after 5 seconds
            setTimeout(removeHint, 5000);
        }
        
        // Window resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Recalculate values on window resize
                const newVisibleItems = Math.floor(container.offsetWidth / itemWidth);
                const newMaxIndex = Math.max(0, items.length - newVisibleItems);
                
                if (currentIndex > newMaxIndex) {
                    currentIndex = newMaxIndex;
                    setPositionByIndex(true);
                }
            }, 100);
        });
    }
});
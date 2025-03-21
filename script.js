document.addEventListener('DOMContentLoaded', function() {
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
    
    // FAB Toggle
    const fab = document.querySelector('.fab');
    const fabMenu = document.querySelector('.fab-menu');
    const fabMenuOverlay = document.querySelector('.fab-menu-overlay');
    
    function toggleFabMenu() {
        fabMenu.classList.toggle('active');
        fabMenuOverlay.classList.toggle('active');
    }
    
    fab.addEventListener('click', toggleFabMenu);
    
    // Close menu when clicking outside
    fabMenuOverlay.addEventListener('click', toggleFabMenu);
    
    // Update Instagram link in fab menu
    const instagramLink = document.querySelector('.fab-menu a:first-child');
    if (instagramLink) {
        instagramLink.href = 'https://www.instagram.com/dhasa.lhasa/';
    }
    
    // Counter Animation
    const counter = document.getElementById('counter');
    const target = 130;
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
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = null;
        let currentIndex = 0;
        
        // Calculate the width of each item including margin
        const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight);
        
        // Calculate visible items and true max index
        const visibleItems = Math.floor(container.offsetWidth / itemWidth);
        const maxIndex = Math.max(0, items.length - visibleItems);
        
        // Reset any existing transform
        carousel.style.transform = 'translateX(0)';
        
        // Stop the auto scroll from the original code
        carousel.style.transition = 'transform 0.3s ease-out';
        
        // Disable the existing auto-scroll functions from the original code
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
                setPositionByIndex();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                setPositionByIndex();
            }
        });
        
        // Touch events
        carousel.addEventListener('touchstart', touchStart);
        carousel.addEventListener('touchmove', touchMove);
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
            isDragging = true;
            
            // Stop any running animation
            cancelAnimationFrame(animationID);
            
            // Store the current position
            prevTranslate = currentTranslate;
        }
        
        function touchMove(event) {
            if (!isDragging) return;
            
            const touch = event.type.includes('mouse') 
                ? event 
                : event.touches[0];
                
            const currentPosition = touch.clientX;
            const diff = currentPosition - startPos;
            
            // Calculate new position with boundaries
            currentTranslate = prevTranslate + diff;
            
            // Apply transform
            setTransform();
        }
        
        function touchEnd() {
            isDragging = false;
            
            // Snap to closest item
            const movedBy = currentTranslate - prevTranslate;
            
            // If moved significantly, move to next/prev item
            if (movedBy < -100 && currentIndex < maxIndex) {
                currentIndex++;
            } else if (movedBy > 100 && currentIndex > 0) {
                currentIndex--;
            }
            
            setPositionByIndex();
        }
        
        function setPositionByIndex() {
            currentTranslate = currentIndex * -itemWidth;
            setTransform();
            updateDots();
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
                setPositionByIndex();
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
        
        // Window resize handler
        window.addEventListener('resize', () => {
            // Recalculate values on window resize
            const newVisibleItems = Math.floor(container.offsetWidth / itemWidth);
            const newMaxIndex = Math.max(0, items.length - newVisibleItems);
            
            if (currentIndex > newMaxIndex) {
                currentIndex = newMaxIndex;
                setPositionByIndex();
            }
        });
    }
});
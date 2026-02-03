// Configuration
const PIXELS_PER_ORDER = 800; // Pixels per order of magnitude
const HUMAN_SIZE = 1.7; // meters
const VIEWPORT_HEIGHT = window.innerHeight;
const MIN_OBJECT_SIZE = 10; // minimum pixels
const MAX_OBJECT_SIZE = 600; // maximum pixels

// State
let scrollPosition = 0; // Current scroll position in pixels
let targetScroll = 0;
let currentFocusedObject = null;

// DOM elements
const scrollContent = document.getElementById('scroll-content');
const currentScaleDisplay = document.getElementById('current-scale');
const objectTitle = document.getElementById('object-title');
const objectDesc = document.getElementById('object-desc');
const objectSizeDisplay = document.getElementById('object-size-display');
const scaleMarker = document.getElementById('scale-marker');
const viewport = document.getElementById('viewport');

// Convert size in meters to position in pixels
function sizeToPosition(meters) {
    const logSize = Math.log10(meters);
    return logSize * PIXELS_PER_ORDER;
}

// Convert position to size in meters
function positionToSize(pixels) {
    const logSize = pixels / PIXELS_PER_ORDER;
    return Math.pow(10, logSize);
}

// Format size for display
function formatSize(meters) {
    const absMeters = Math.abs(meters);
    
    if (absMeters < 1e-12) {
        return `${(meters * 1e15).toFixed(2)} fm`;
    } else if (absMeters < 1e-9) {
        return `${(meters * 1e12).toFixed(2)} pm`;
    } else if (absMeters < 1e-6) {
        return `${(meters * 1e9).toFixed(2)} nm`;
    } else if (absMeters < 1e-3) {
        return `${(meters * 1e6).toFixed(2)} μm`;
    } else if (absMeters < 1) {
        return `${(meters * 1e3).toFixed(2)} mm`;
    } else if (absMeters < 1000) {
        return `${meters.toFixed(2)} m`;
    } else if (absMeters < 1e6) {
        return `${(meters / 1e3).toFixed(2)} km`;
    } else if (absMeters < 9.461e15) {
        const millions = meters / 1e6;
        if (millions < 1000) {
            return `${millions.toFixed(2)} million km`;
        } else {
            return `${(millions / 1000).toFixed(2)} billion km`;
        }
    } else {
        const lightYears = meters / 9.461e15;
        if (lightYears < 1000) {
            return `${lightYears.toFixed(2)} light years`;
        } else if (lightYears < 1e6) {
            return `${(lightYears / 1000).toFixed(2)} thousand light years`;
        } else {
            return `${(lightYears / 1e6).toFixed(2)} million light years`;
        }
    }
}

// Calculate object size in pixels based on current view
function calculateObjectSize(objectMeters, currentViewSize) {
    const ratio = objectMeters / currentViewSize;
    const baseSize = ratio * (VIEWPORT_HEIGHT * 0.6);
    return Math.max(MIN_OBJECT_SIZE, Math.min(MAX_OBJECT_SIZE, baseSize));
}

// Render all objects
function renderObjects() {
    scrollContent.innerHTML = '';
    
    const minPos = sizeToPosition(lifeObjects[0].size);
    const maxPos = sizeToPosition(lifeObjects[lifeObjects.length - 1].size);
    const totalWidth = maxPos - minPos + 4000; // Add padding
    
    scrollContent.style.width = `${totalWidth}px`;
    
    lifeObjects.forEach(obj => {
        const objElement = document.createElement('div');
        objElement.className = 'size-object';
        objElement.dataset.size = obj.size;
        objElement.dataset.name = obj.name;
        objElement.dataset.description = obj.description;
        
        const position = sizeToPosition(obj.size) - minPos + 2000;
        objElement.style.left = `${position}px`;
        
        const circle = document.createElement('div');
        circle.className = 'object-circle';
        circle.style.backgroundColor = obj.color;
        
        const label = document.createElement('div');
        label.className = 'object-label';
        label.textContent = obj.name;
        
        objElement.appendChild(circle);
        objElement.appendChild(label);
        
        objElement.addEventListener('click', () => {
            const targetPos = position - window.innerWidth / 2;
            targetScroll = -targetPos;
            focusObject(obj);
        });
        
        scrollContent.appendChild(objElement);
    });
}

// Update object sizes based on current view
function updateObjectSizes() {
    const centerViewPos = -scrollPosition + window.innerWidth / 2;
    const currentViewSize = positionToSize(centerViewPos);
    
    document.querySelectorAll('.size-object').forEach(obj => {
        const objSize = parseFloat(obj.dataset.size);
        const pixelSize = calculateObjectSize(objSize, currentViewSize);
        
        const circle = obj.querySelector('.object-circle');
        circle.style.width = `${pixelSize}px`;
        circle.style.height = `${pixelSize}px`;
        
        // Position vertically centered
        obj.style.top = `50%`;
        obj.style.transform = `translateY(-50%)`;
        
        // Fade out objects that are too small or too large
        const objPos = parseFloat(obj.style.left);
        const distanceFromCenter = Math.abs(objPos - centerViewPos);
        const opacity = distanceFromCenter < window.innerWidth * 2 ? 1 : 0.3;
        obj.style.opacity = opacity;
    });
}

// Focus on a specific object
function focusObject(obj) {
    currentFocusedObject = obj;
    objectTitle.textContent = obj.name;
    objectDesc.textContent = obj.description;
    objectSizeDisplay.textContent = `Size: ${formatSize(obj.size)}`;
}

// Find closest object to center
function findClosestObject() {
    const centerViewPos = -scrollPosition + window.innerWidth / 2;
    let closestObj = null;
    let closestDistance = Infinity;
    
    lifeObjects.forEach(obj => {
        const objPos = sizeToPosition(obj.size) - sizeToPosition(lifeObjects[0].size) + 2000;
        const distance = Math.abs(objPos - centerViewPos);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestObj = obj;
        }
    });
    
    if (closestObj && closestObj !== currentFocusedObject) {
        focusObject(closestObj);
    }
}

// Update scale display
function updateScaleDisplay() {
    const centerViewPos = -scrollPosition + window.innerWidth / 2;
    const currentViewSize = positionToSize(centerViewPos);
    currentScaleDisplay.textContent = formatSize(currentViewSize);
    
    // Update scale bar
    const minSize = lifeObjects[0].size;
    const maxSize = lifeObjects[lifeObjects.length - 1].size;
    const progress = (Math.log10(currentViewSize) - Math.log10(minSize)) / 
                     (Math.log10(maxSize) - Math.log10(minSize));
    scaleMarker.style.left = `${progress * 100}%`;
}

// Animation loop
function animate() {
    // Smooth scrolling
    scrollPosition += (targetScroll - scrollPosition) * 0.1;
    
    scrollContent.style.transform = `translateX(${scrollPosition}px)`;
    
    updateObjectSizes();
    updateScaleDisplay();
    findClosestObject();
    
    requestAnimationFrame(animate);
}

// Handle scroll/wheel events
let scrollTimeout;
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const delta = e.deltaY || e.deltaX;
    targetScroll -= delta * 2;
    
    // Limit scrolling
    const maxScroll = 0;
    const minScroll = -(scrollContent.offsetWidth - window.innerWidth);
    targetScroll = Math.max(minScroll, Math.min(maxScroll, targetScroll));
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        findClosestObject();
    }, 150);
}, { passive: false });

// Touch support
let touchStartX = 0;
let touchStartScroll = 0;

viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartScroll = targetScroll;
});

viewport.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    targetScroll = touchStartScroll + deltaX;
    
    const maxScroll = 0;
    const minScroll = -(scrollContent.offsetWidth - window.innerWidth);
    targetScroll = Math.max(minScroll, Math.min(maxScroll, targetScroll));
}, { passive: false });

viewport.addEventListener('touchend', () => {
    findClosestObject();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        targetScroll += 200;
    } else if (e.key === 'ArrowRight') {
        targetScroll -= 200;
    }
    
    const maxScroll = 0;
    const minScroll = -(scrollContent.offsetWidth - window.innerWidth);
    targetScroll = Math.max(minScroll, Math.min(maxScroll, targetScroll));
});

// Initialize
function init() {
    renderObjects();
    
    // Start at human size
    const humanPos = sizeToPosition(HUMAN_SIZE) - sizeToPosition(lifeObjects[0].size) + 2000;
    targetScroll = -humanPos + window.innerWidth / 2;
    scrollPosition = targetScroll;
    
    // Find and focus on human
    const humanObj = lifeObjects.find(obj => obj.size === HUMAN_SIZE);
    if (humanObj) {
        focusObject(humanObj);
    }
    
    animate();
}

// Handle window resize
window.addEventListener('resize', () => {
    updateObjectSizes();
});

// Start
init();

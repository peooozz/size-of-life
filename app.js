// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const labelsContainer = document.getElementById('labels');

// UI elements
const zoomLevelDisplay = document.getElementById('zoom-level');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');
const infoSize = document.getElementById('info-size');

// State
let zoom = 1.7; // Current zoom level in meters (start at human height)
let targetZoom = 1.7;
let canvasWidth, canvasHeight;
let centerX, centerY;

// Constants
const MIN_ZOOM = 1e-35; // Planck length
const MAX_ZOOM = 1e27; // Observable universe
const ZOOM_SPEED = 0.15;
const REFERENCE_SIZE = 200; // Reference circle size in pixels

// Initialize canvas
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
}

// Format size for display
function formatSize(meters) {
    const absMeters = Math.abs(meters);
    
    if (absMeters === 0) return "0 m";
    
    if (absMeters < 1e-15) {
        return `${(meters * 1e18).toExponential(1)} am`;
    } else if (absMeters < 1e-12) {
        return `${(meters * 1e15).toFixed(absMeters < 1e-14 ? 1 : 2)} fm`;
    } else if (absMeters < 1e-9) {
        return `${(meters * 1e12).toFixed(absMeters < 1e-11 ? 1 : 2)} pm`;
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
    } else if (absMeters < 1e9) {
        return `${(meters / 1e6).toFixed(2)} Mm`;
    } else if (absMeters < 9.461e15) {
        return `${(meters / 1e9).toFixed(2)} Gm`;
    } else {
        const lightYears = meters / 9.461e15;
        if (lightYears < 1000) {
            return `${lightYears.toFixed(2)} ly`;
        } else if (lightYears < 1e6) {
            return `${(lightYears / 1000).toFixed(2)} thousand ly`;
        } else if (lightYears < 1e9) {
            return `${(lightYears / 1e6).toFixed(2)} million ly`;
        } else {
            return `${(lightYears / 1e9).toFixed(2)} billion ly`;
        }
    }
}

// Calculate object radius in pixels based on current zoom
function getObjectRadius(objectSize, currentZoom) {
    // The object's size relative to the current zoom level
    const ratio = objectSize / currentZoom;
    // Scale to pixels
    const radius = ratio * REFERENCE_SIZE;
    return radius;
}

// Check if object should be visible
function isObjectVisible(objectSize, currentZoom) {
    const radius = getObjectRadius(objectSize, currentZoom);
    // Show objects that are between 5px and screen size
    return radius >= 5 && radius <= Math.max(canvasWidth, canvasHeight) * 2;
}

// Draw all objects
function drawObjects() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    labelsContainer.innerHTML = '';
    
    let closestObject = null;
    let closestDistance = Infinity;
    
    lifeObjects.forEach(obj => {
        if (!isObjectVisible(obj.size, zoom)) return;
        
        const radius = getObjectRadius(obj.size, zoom);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, obj.color);
        gradient.addColorStop(1, obj.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Outer glow
        ctx.strokeStyle = obj.color + '40';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add label if object is prominent
        if (radius >= 30 && radius <= canvasHeight / 2) {
            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = obj.name;
            label.style.left = centerX + 'px';
            label.style.top = (centerY - radius - 25) + 'px';
            labelsContainer.appendChild(label);
        }
        
        // Find closest object to current zoom
        const sizeDiff = Math.abs(Math.log10(obj.size) - Math.log10(zoom));
        if (sizeDiff < closestDistance) {
            closestDistance = sizeDiff;
            closestObject = obj;
        }
    });
    
    // Update info box with closest object
    if (closestObject) {
        infoTitle.textContent = closestObject.name;
        infoDescription.textContent = closestObject.description;
        infoSize.textContent = formatSize(closestObject.size);
    }
    
    // Draw reference circle (shows current zoom level)
    ctx.beginPath();
    ctx.arc(centerX, centerY, REFERENCE_SIZE, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update zoom level display
function updateZoomDisplay() {
    zoomLevelDisplay.textContent = formatSize(zoom);
}

// Animation loop
function animate() {
    // Smooth zoom transition
    zoom += (targetZoom - zoom) * ZOOM_SPEED;
    
    // Clamp zoom
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    
    drawObjects();
    updateZoomDisplay();
    
    requestAnimationFrame(animate);
}

// Handle mouse wheel
let lastWheelTime = 0;
const wheelThrottle = 16; // ~60fps

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastWheelTime < wheelThrottle) return;
    lastWheelTime = now;
    
    const delta = e.deltaY;
    
    // Zoom in = decrease zoom value (see smaller things)
    // Zoom out = increase zoom value (see bigger things)
    const zoomFactor = delta > 0 ? 1.1 : 0.909; // ~10% per scroll
    
    targetZoom *= zoomFactor;
    targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
}, { passive: false });

// Touch support
let touchStartDistance = 0;
let touchStartZoom = 0;

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        touchStartZoom = targetZoom;
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const scale = touchStartDistance / distance;
        targetZoom = touchStartZoom * scale;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    } else if (e.touches.length === 1) {
        // Single finger scroll for zoom
        const touch = e.touches[0];
        const deltaY = touch.clientY - (window.innerHeight / 2);
        
        // Slow zoom based on vertical position
        const zoomFactor = 1 + (deltaY / window.innerHeight) * 0.02;
        targetZoom *= zoomFactor;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    }
}, { passive: false });

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
        e.preventDefault();
        targetZoom *= 0.8;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    } else if (e.key === 'ArrowDown' || e.key === '-') {
        e.preventDefault();
        targetZoom *= 1.25;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    }
});

// Click to cycle through objects
let currentObjectIndex = lifeObjects.findIndex(obj => obj.size === 1.7) || 0;

canvas.addEventListener('click', () => {
    currentObjectIndex = (currentObjectIndex + 1) % lifeObjects.length;
    targetZoom = lifeObjects[currentObjectIndex].size;
});

// Initialize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Find human object and start there
const humanObj = lifeObjects.find(obj => obj.name === "Human (average)");
if (humanObj) {
    zoom = humanObj.size;
    targetZoom = humanObj.size;
}

animate();

// Hide instructions after first interaction
let hasInteracted = false;
const instructions = document.querySelector('.instructions');

function hideInstructions() {
    if (!hasInteracted) {
        hasInteracted = true;
        if (instructions) {
            instructions.style.opacity = '0';
            setTimeout(() => {
                instructions.style.display = 'none';
            }, 300);
        }
    }
}

canvas.addEventListener('wheel', hideInstructions, { once: true });
canvas.addEventListener('touchstart', hideInstructions, { once: true });
document.addEventListener('keydown', hideInstructions, { once: true });

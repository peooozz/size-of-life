// Canvas setup
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const labelsContainer = document.getElementById('labels-container');

// UI elements
const zoomSlider = document.getElementById('zoom-slider');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const scaleDisplay = document.getElementById('scale-display');
const currentSizeDisplay = document.getElementById('current-size');
const sizeRangeDisplay = document.getElementById('size-range');
const objectName = document.getElementById('object-name');
const objectDescription = document.getElementById('object-description');
const objectSize = document.getElementById('object-size');

// State
let canvasWidth, canvasHeight;
let scale = 1; // Current scale (meters per screen height)
let targetScale = 1;
let currentObject = null;

// Scale range (log scale)
const MIN_SCALE_LOG = -35; // Planck length scale
const MAX_SCALE_LOG = 27;  // Observable universe scale
const SCALE_RANGE = MAX_SCALE_LOG - MIN_SCALE_LOG;

// Initialize canvas size
function resizeCanvas() {
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

// Convert slider position to scale
function sliderToScale(value) {
    const logScale = MIN_SCALE_LOG + (value / 100) * SCALE_RANGE;
    return Math.pow(10, logScale);
}

// Convert scale to slider position
function scaleToSlider(scale) {
    const logScale = Math.log10(scale);
    return ((logScale - MIN_SCALE_LOG) / SCALE_RANGE) * 100;
}

// Format size for display
function formatSize(meters) {
    if (meters < 1e-12) {
        return `${(meters * 1e15).toFixed(2)} fm`;
    } else if (meters < 1e-9) {
        return `${(meters * 1e12).toFixed(2)} pm`;
    } else if (meters < 1e-6) {
        return `${(meters * 1e9).toFixed(2)} nm`;
    } else if (meters < 1e-3) {
        return `${(meters * 1e6).toFixed(2)} μm`;
    } else if (meters < 1) {
        return `${(meters * 1e3).toFixed(2)} mm`;
    } else if (meters < 1000) {
        return `${meters.toFixed(2)} m`;
    } else if (meters < 1e6) {
        return `${(meters / 1e3).toFixed(2)} km`;
    } else if (meters < 9.461e15) {
        return `${(meters / 1e6).toFixed(2)} Mm`;
    } else {
        const lightYears = meters / 9.461e15;
        return `${lightYears.toFixed(2)} light years`;
    }
}

// Format scale display
function formatScale(scale) {
    if (scale < 0.001) {
        return `1:${(1/scale).toExponential(1)}`;
    } else if (scale < 1) {
        return `1:${Math.round(1/scale)}`;
    } else if (scale < 1000) {
        return `${scale.toFixed(1)}:1`;
    } else {
        return `${scale.toExponential(1)}:1`;
    }
}

// Draw objects on canvas
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    labelsContainer.innerHTML = '';
    
    // Smooth scale transition
    scale += (targetScale - scale) * 0.1;
    
    // Reference line (1 meter at current scale)
    const referenceHeight = canvasHeight;
    const pixelsPerMeter = referenceHeight / scale;
    
    // Update displays
    scaleDisplay.textContent = formatScale(scale);
    currentSizeDisplay.textContent = formatSize(scale);
    
    // Find visible objects
    let closestObject = null;
    let closestDistance = Infinity;
    
    lifeObjects.forEach(obj => {
        const objHeightInPixels = obj.size * pixelsPerMeter;
        
        // Only draw if object is in a reasonable size range
        if (objHeightInPixels > 2 && objHeightInPixels < canvasHeight * 5) {
            const x = canvasWidth / 2;
            const y = canvasHeight / 2;
            const radius = Math.max(2, Math.min(objHeightInPixels / 2, canvasHeight / 2));
            
            // Draw object
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = obj.color;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            
            // Glow effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
            gradient.addColorStop(0, obj.color + '40');
            gradient.addColorStop(1, obj.color + '00');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // Add label
            if (objHeightInPixels > 20 && objHeightInPixels < canvasHeight * 2) {
                const label = document.createElement('div');
                label.className = 'object-label';
                label.textContent = `${obj.name} (${formatSize(obj.size)})`;
                label.style.left = `${x}px`;
                label.style.top = `${y - radius}px`;
                labelsContainer.appendChild(label);
            }
            
            // Find closest object to current scale
            const sizeRatio = Math.log10(obj.size / scale);
            const distance = Math.abs(sizeRatio);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        }
    });
    
    // Update object info
    if (closestObject && closestObject !== currentObject) {
        currentObject = closestObject;
        objectName.textContent = closestObject.name;
        objectDescription.textContent = closestObject.description;
        objectSize.textContent = `Size: ${formatSize(closestObject.size)}`;
    }
    
    // Draw scale reference
    drawScaleReference();
    
    requestAnimationFrame(draw);
}

// Draw scale reference bar
function drawScaleReference() {
    const refWidth = 100;
    const refHeight = 3;
    const refX = 30;
    const refY = canvasHeight - 50;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(refX, refY, refWidth, refHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    const refSize = (refWidth / canvasHeight) * scale;
    ctx.fillText(formatSize(refSize), refX, refY - 10);
}

// Event listeners
zoomSlider.addEventListener('input', (e) => {
    targetScale = sliderToScale(e.target.value);
});

zoomInBtn.addEventListener('click', () => {
    const newValue = Math.min(100, parseFloat(zoomSlider.value) + 2);
    zoomSlider.value = newValue;
    targetScale = sliderToScale(newValue);
});

zoomOutBtn.addEventListener('click', () => {
    const newValue = Math.max(0, parseFloat(zoomSlider.value) - 2);
    zoomSlider.value = newValue;
    targetScale = sliderToScale(newValue);
});

// Mouse wheel zoom
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newValue = Math.max(0, Math.min(100, parseFloat(zoomSlider.value) + delta));
    zoomSlider.value = newValue;
    targetScale = sliderToScale(newValue);
});

// Touch support for mobile
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    const delta = (touchStartY - touchY) * 0.1;
    const newValue = Math.max(0, Math.min(100, parseFloat(zoomSlider.value) + delta));
    zoomSlider.value = newValue;
    targetScale = sliderToScale(newValue);
    touchStartY = touchY;
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === '+') {
        zoomInBtn.click();
    } else if (e.key === 'ArrowDown' || e.key === '-') {
        zoomOutBtn.click();
    }
});

// Initialize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Set initial scale to human size
const humanSizeLog = Math.log10(1.7);
const initialSliderValue = ((humanSizeLog - MIN_SCALE_LOG) / SCALE_RANGE) * 100;
zoomSlider.value = initialSliderValue;
targetScale = sliderToScale(initialSliderValue);
scale = targetScale;

// Start animation
draw();

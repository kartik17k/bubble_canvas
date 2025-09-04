class BubblesApp {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resetButton = document.getElementById('resetButton');
        
        this.circles = [];
        this.arrows = [];
        this.animations = [];
        
        this.init();
    }
    
    init() {
        this.setupCircles();
        this.setupArrows();
        this.setupEventListeners();
        this.draw();
    }
    
    setupCircles() {
        const colors = ['#fbbf24', '#3b82f6', '#ef4444', '#10b981']; // yellow, blue, red, green
        const hitColors = ['#6b7280', '#6b7280', '#6b7280', '#6b7280']; // gray for hit state
        
        this.circles = colors.map((color, index) => ({
            x: 80,
            y: 80 + index * 80,
            radius: 30,
            color: color,
            originalColor: color,
            hitColor: hitColors[index],
            isHit: false,
            index: index
        }));
    }
    
    setupArrows() {
        this.arrows = this.circles.map((circle, index) => ({
            x: 520,
            y: circle.y,
            originalX: 520,
            targetX: circle.x + circle.radius + 10,
            targetY: circle.y,
            isMoving: false,
            circleIndex: index,
            width: 40,
            height: 8
        }));
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.resetButton.addEventListener('click', () => this.reset());
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        this.circles.forEach((circle, index) => {
            if (this.isPointInCircle(clickX, clickY, circle) && !this.arrows[index].isMoving) {
                this.startArrowAnimation(index);
            }
        });
    }
    
    isPointInCircle(x, y, circle) {
        const distance = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
        return distance <= circle.radius;
    }
    
    startArrowAnimation(arrowIndex) {
        const arrow = this.arrows[arrowIndex];
        arrow.isMoving = true;
        
        const startTime = performance.now();
        const duration = 800; // 800ms animation
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeInOut = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            arrow.x = arrow.originalX - (arrow.originalX - arrow.targetX) * easeInOut;
            
            this.draw();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Arrow has reached the circle
                this.circles[arrowIndex].isHit = true;
                this.circles[arrowIndex].color = this.circles[arrowIndex].hitColor;
                arrow.isMoving = false;
                this.draw();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw circles
        this.circles.forEach(circle => {
            this.drawCircle(circle);
        });
        
        // Draw arrows
        this.arrows.forEach(arrow => {
            this.drawArrow(arrow);
        });
    }
    
    drawCircle(circle) {
        this.ctx.beginPath();
        this.ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = circle.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add subtle inner shadow effect for depth
        if (!circle.isHit) {
            this.ctx.beginPath();
            this.ctx.arc(circle.x - 3, circle.y - 3, circle.radius - 3, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fill();
        }
    }
    
    drawArrow(arrow) {
        const ctx = this.ctx;
        
        // Arrow body (rectangle)
        ctx.fillStyle = '#374151';
        ctx.fillRect(arrow.x, arrow.y - arrow.height/2, arrow.width, arrow.height);
        
        // Arrow head (triangle)
        ctx.beginPath();
        ctx.moveTo(arrow.x, arrow.y - 12);
        ctx.lineTo(arrow.x - 20, arrow.y);
        ctx.lineTo(arrow.x, arrow.y + 12);
        ctx.closePath();
        ctx.fill();
        
        // Add highlight for better visibility
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    reset() {
        // Reset circles to original colors
        this.circles.forEach(circle => {
            circle.color = circle.originalColor;
            circle.isHit = false;
        });
        
        // Reset arrows to original positions
        this.arrows.forEach(arrow => {
            arrow.x = arrow.originalX;
            arrow.isMoving = false;
        });
        
        // Stop all animations
        this.animations.forEach(animation => {
            if (animation) {
                cancelAnimationFrame(animation);
            }
        });
        this.animations = [];
        
        this.draw();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BubblesApp();
});
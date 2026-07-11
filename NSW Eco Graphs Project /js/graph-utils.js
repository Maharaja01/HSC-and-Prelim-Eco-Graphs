class BaseGraph {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Defaults
        this.padding = { top: 30, right: 30, bottom: 50, left: 50 };
        this.xRange = options.xRange || [0, 100];
        this.yRange = options.yRange || [0, 100];
        
        this.xLabel = options.xLabel || 'Quantity';
        this.yLabel = options.yLabel || 'Price';
        
        this.elements = []; // Lines, curves, points
        
        // Animation state
        this.isAnimating = false;
        
        // Colors from CSS
        this.colors = {
            demand: '#0ea5e9',
            supply: '#f59e0b',
            equilibrium: '#10b981',
            other: '#8b5cf6',
            axis: '#334155',
            text: '#1e293b',
            bg: '#fafafa'
        };

        // Dragging state
        this.isDragging = false;
        this.draggedElement = null;
        
        this._bindEvents();
    }
    
    // Coordinate mapping
    xToPx(x) {
        return this.padding.left + (x - this.xRange[0]) / (this.xRange[1] - this.xRange[0]) * (this.width - this.padding.left - this.padding.right);
    }
    
    yToPx(y) {
        // Invert Y axis so 0 is at bottom
        return this.height - this.padding.bottom - (y - this.yRange[0]) / (this.yRange[1] - this.yRange[0]) * (this.height - this.padding.top - this.padding.bottom);
    }
    
    pxToX(px) {
        return this.xRange[0] + (px - this.padding.left) / (this.width - this.padding.left - this.padding.right) * (this.xRange[1] - this.xRange[0]);
    }
    
    pxToY(py) {
        return this.yRange[0] + (this.height - this.padding.bottom - py) / (this.height - this.padding.top - this.padding.bottom) * (this.yRange[1] - this.yRange[0]);
    }
    
    // Drawing
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    drawAxes() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = this.colors.axis;
        ctx.lineWidth = 2;
        
        // Y axis
        ctx.moveTo(this.padding.left, this.padding.top);
        ctx.lineTo(this.padding.left, this.height - this.padding.bottom);
        
        // X axis
        ctx.lineTo(this.width - this.padding.right, this.height - this.padding.bottom);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.xLabel, this.width / 2, this.height - 15);
        
        ctx.save();
        ctx.translate(20, this.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(this.yLabel, 0, 0);
        ctx.restore();
        
        // Origin
        ctx.textAlign = 'right';
        ctx.fillText('0', this.padding.left - 5, this.height - this.padding.bottom + 15);
    }

    drawLine(x1, y1, x2, y2, color, lineWidth = 3, dash = []) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dash);
        ctx.moveTo(this.xToPx(x1), this.yToPx(y1));
        ctx.lineTo(this.xToPx(x2), this.yToPx(y2));
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawCurve(points, color, lineWidth = 3) {
        if(points.length < 2) return;
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(this.xToPx(points[0].x), this.yToPx(points[0].y));
        for(let i=1; i<points.length; i++) {
            ctx.lineTo(this.xToPx(points[i].x), this.yToPx(points[i].y));
        }
        ctx.stroke();
    }

    drawPoint(x, y, color, radius = 6) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.xToPx(x), this.yToPx(y), radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawLabel(text, x, y, color = this.colors.text, align = 'center') {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = align;
        ctx.fillText(text, this.xToPx(x), this.yToPx(y));
    }

    drawDashedLineToAxes(x, y, color) {
        this.drawLine(x, y, x, 0, color, 1, [5, 5]);
        this.drawLine(x, y, 0, y, color, 1, [5, 5]);
    }
    
    // Animation/Tweening helpers
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    animateValue(obj, prop, endValue, duration = 500, onComplete = null) {
        const startValue = obj[prop];
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            let progress = elapsed / duration;
            if(progress > 1) progress = 1;
            
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            
            obj[prop] = this.lerp(startValue, endValue, easeProgress);
            
            this.draw();
            
            if(progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if(onComplete) onComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Drag events (to be overridden by subclasses if needed)
    _bindEvents() {
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onMouseDown({ offsetX: touch.clientX - this.canvas.getBoundingClientRect().left, offsetY: touch.clientY - this.canvas.getBoundingClientRect().top });
        }, {passive: false});
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onMouseMove({ offsetX: touch.clientX - this.canvas.getBoundingClientRect().left, offsetY: touch.clientY - this.canvas.getBoundingClientRect().top });
        }, {passive: false});
        this.canvas.addEventListener('touchend', this._onMouseUp.bind(this));
    }

    _onMouseDown(e) {
        const x = this.pxToX(e.offsetX);
        const y = this.pxToY(e.offsetY);
        this.onDragStart(x, y);
    }

    _onMouseMove(e) {
        const x = this.pxToX(e.offsetX);
        const y = this.pxToY(e.offsetY);
        this.onDragMove(x, y);
    }

    _onMouseUp(e) {
        this.onDragEnd();
    }
    
    // Hooks for subclasses
    onDragStart(x, y) {}
    onDragMove(x, y) {}
    onDragEnd() {}
    
    draw() {
        this.clear();
        this.drawAxes();
    }
    
    updateStatus(id, text) {
        const el = document.getElementById(id);
        if(el) {
            el.innerHTML = text;
            // Add brief highlight animation
            el.style.backgroundColor = '#dcfce7';
            setTimeout(() => {
                el.style.backgroundColor = '#f0fdf4';
            }, 300);
        }
    }
}
